from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import (
    AnalysisRun, CareerRecommendation, CareerRole, CareerRoleSkill, SkillGap, Skill,
    CandidateProfile, CandidateSkill, ReadinessScore, User
)
from app.schemas import GapAnalysisResponse, SkillGapItem, CareerRecommendationResponse
from app.services.matching_engine import evaluate_candidate_profile

router = APIRouter(prefix="/api/analysis", tags=["Analysis & Recommendations"])

@router.post("/run/{profile_id}")
def trigger_analysis(profile_id: int, db: Session = Depends(get_db)):
    analysis_id = evaluate_candidate_profile(profile_id=profile_id, db=db)
    return {"message": "Analysis evaluated successfully", "analysis_id": analysis_id}

@router.get("/recommendations", response_model=List[CareerRecommendationResponse])
def get_recommendations(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    analysis_id = None
    if user_id:
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
        if profile:
            latest_run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile.profile_id).order_by(AnalysisRun.analysis_id.desc()).first()
            if latest_run:
                analysis_id = latest_run.analysis_id
            else:
                # User has not uploaded a resume yet
                return []

    if not analysis_id:
        latest_run = db.query(AnalysisRun).order_by(AnalysisRun.analysis_id.desc()).first()
        analysis_id = latest_run.analysis_id if latest_run else 1

    recs = db.query(CareerRecommendation, CareerRole).join(
        CareerRole, CareerRecommendation.career_role_id == CareerRole.career_role_id
    ).filter(CareerRecommendation.analysis_id == analysis_id).order_by(CareerRecommendation.recommendation_rank.asc()).all()

    return [
        CareerRecommendationResponse(
            career_recommendation_id=r.CareerRecommendation.career_recommendation_id,
            career_role_id=r.CareerRole.career_role_id,
            role=r.CareerRole.role_name,
            desc=r.CareerRole.description,
            match=float(r.CareerRecommendation.match_percentage),
            rank=r.CareerRecommendation.recommendation_rank,
            summary_explanation=r.CareerRecommendation.summary_explanation
        )
        for r in recs
    ]

@router.get("/gap-analysis", response_model=GapAnalysisResponse)
def get_gap_analysis(role_id: int = 1, user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(CareerRole.career_role_id == role_id).first()
    if not role:
        role = db.query(CareerRole).first()

    profile = None
    if user_id:
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()

    if not profile:
        latest_run = db.query(AnalysisRun).order_by(AnalysisRun.analysis_id.desc()).first()
        if latest_run and latest_run.profile_id:
            profile = db.query(CandidateProfile).filter(CandidateProfile.profile_id == latest_run.profile_id).first()
        if not profile:
            profile = db.query(CandidateProfile).first()

    if not profile:
        return GapAnalysisResponse(
            target_role=role.role_name if role else "Data Analyst",
            target_role_id=role.career_role_id if role else 1,
            readiness_score=0.0,
            matched_skills=[],
            missing_skills=[]
        )

    profile_id = profile.profile_id
    latest_run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile_id).order_by(AnalysisRun.analysis_id.desc()).first()

    # Fetch candidate skills
    cand_skills = db.query(CandidateSkill, Skill).join(
        Skill, CandidateSkill.skill_id == Skill.skill_id
    ).filter(CandidateSkill.profile_id == profile_id).all()

    if user_id and not latest_run and not cand_skills:
        return GapAnalysisResponse(
            target_role=role.role_name if role else "Data Analyst",
            target_role_id=role.career_role_id if role else 1,
            readiness_score=0.0,
            matched_skills=[],
            missing_skills=[]
        )

    cand_skill_map = {cs.Skill.skill_id: (cs.CandidateSkill.proficiency_level, cs.Skill.skill_name) for cs in cand_skills}

    # Fetch required skills for the target career role
    role_skills = db.query(CareerRoleSkill, Skill).join(
        Skill, CareerRoleSkill.skill_id == Skill.skill_id
    ).filter(CareerRoleSkill.career_role_id == role.career_role_id).all()

    gap_items = []
    missing_skill_names_lower = set()

    for rs, sk in role_skills:
        req_level = rs.required_level
        cand_level, _ = cand_skill_map.get(rs.skill_id, (0, sk.skill_name))

        # If candidate does not meet the required level, it is a gap / deficiency
        if cand_level < req_level:
            p_val = float(rs.importance_weight) * 50.0
            p_label = "High" if p_val >= 60 else "Medium" if p_val >= 40 else "Low"
            status_label = "weak" if cand_level > 0 else "missing"
            gap_items.append(
                SkillGapItem(
                    skill_gap_id=rs.role_skill_id,
                    skill_id=rs.skill_id,
                    name=sk.skill_name,
                    current_level=cand_level,
                    required_level=req_level,
                    priority=p_label,
                    priority_score=p_val,
                    status=status_label
                )
            )
            missing_skill_names_lower.add(sk.skill_name.lower())

    # Sort gaps: High priority first, then Medium, then Low
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    gap_items.sort(key=lambda x: (priority_order.get(x.priority, 3), -x.priority_score))

    # STRICT GUARANTEE: Any skill mentioned in Missing / Skill Deficiencies
    # must NEVER be mentioned in Verified Acquired Skills!
    matched_names = []
    seen_matched = set()
    for cs in cand_skills:
        s_name = cs.Skill.skill_name
        s_name_lower = s_name.lower()
        if s_name_lower not in missing_skill_names_lower and s_name_lower not in seen_matched:
            matched_names.append(s_name)
            seen_matched.add(s_name_lower)

    # Readiness score calculation
    readiness_score = 0.0
    if role_skills:
        total_weight = sum(float(rs.importance_weight) for rs, _ in role_skills)
        earned_weight = 0.0
        for rs, _ in role_skills:
            req_level = rs.required_level
            cand_level, _ = cand_skill_map.get(rs.skill_id, (0, ""))
            if cand_level >= req_level:
                earned_weight += float(rs.importance_weight)
            elif cand_level > 0:
                earned_weight += float(rs.importance_weight) * (cand_level / req_level)
        readiness_score = round((earned_weight / total_weight) * 100, 1) if total_weight > 0 else 0.0

    return GapAnalysisResponse(
        target_role=role.role_name if role else "Data Analyst",
        target_role_id=role.career_role_id if role else 1,
        readiness_score=readiness_score,
        matched_skills=matched_names,
        missing_skills=gap_items
    )
