from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import (
    AnalysisRun, CareerRecommendation, CareerRole, CareerRoleSkill, SkillGap, Skill,
    CandidateProfile, CandidateSkill, ReadinessScore, User
)
from app.schemas import GapAnalysisResponse, SkillGapItem, CareerRecommendationResponse, JobMatchItem
from app.services.matching_engine import (
    evaluate_candidate_profile, ensure_current_analysis, latest_resume_role_name, skill_coverage
)
from app.services.insights import build_recommendations, build_job_matches

router = APIRouter(prefix="/api/analysis", tags=["Analysis & Recommendations"])

@router.post("/run/{profile_id}")
def trigger_analysis(profile_id: int, db: Session = Depends(get_db)):
    analysis_id = evaluate_candidate_profile(profile_id=profile_id, db=db)
    return {"message": "Analysis evaluated successfully", "analysis_id": analysis_id}

def _user_analysis(user_id: Optional[int], db: Session):
    """(analysis_id, resume role name) for the user's latest analysis, or (None, None) if no resume yet."""
    if user_id:
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
        if not profile:
            return None, None
        run = ensure_current_analysis(profile, db)
        if not run:
            return None, None
        return run.analysis_id, latest_resume_role_name(profile.profile_id, db)
    run = db.query(AnalysisRun).order_by(AnalysisRun.analysis_id.desc()).first()
    if not run:
        return None, None
    return run.analysis_id, latest_resume_role_name(run.profile_id, db)


@router.get("/recommendations", response_model=List[CareerRecommendationResponse])
def get_recommendations(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Career roles ranked by the job title on the latest resume + skill coverage."""
    analysis_id, resume_role = _user_analysis(user_id, db)
    if not analysis_id:
        return []  # no resume uploaded yet
    return build_recommendations(analysis_id, resume_role, db)


@router.get("/job-matches", response_model=List[JobMatchItem])
def get_job_matches(user_id: Optional[int] = Query(None), limit: int = Query(6, ge=1, le=50), db: Session = Depends(get_db)):
    """Positions related to the job title on the latest resume, best match first."""
    analysis_id, resume_role = _user_analysis(user_id, db)
    if not analysis_id:
        return []
    return build_job_matches(analysis_id, resume_role, db, limit=limit)

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

    # Sort gaps: skills completely missing from the resume first, then weak ones;
    # within each group High priority first, then Medium, then Low
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    gap_items.sort(key=lambda x: (x.status != "missing", priority_order.get(x.priority, 3), -x.priority_score))

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
    # (same formula as the Dashboard's Career Readiness)
    readiness_score = round(skill_coverage(
        [rs for rs, _ in role_skills],
        {sid: lvl for sid, (lvl, _n) in cand_skill_map.items()},
    ), 1)

    return GapAnalysisResponse(
        target_role=role.role_name if role else "Data Analyst",
        target_role_id=role.career_role_id if role else 1,
        readiness_score=readiness_score,
        matched_skills=matched_names,
        missing_skills=gap_items
    )
