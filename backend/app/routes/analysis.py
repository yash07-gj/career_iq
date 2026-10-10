from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import (
    AnalysisRun, CareerRecommendation, CareerRole, SkillGap, Skill,
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

    profile_id = 1
    analysis_id = None

    if user_id:
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
        if profile:
            profile_id = profile.profile_id
            latest_run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile_id).order_by(AnalysisRun.analysis_id.desc()).first()
            if latest_run:
                analysis_id = latest_run.analysis_id

    if not analysis_id:
        if user_id:
            # User with no resume uploaded yet
            return GapAnalysisResponse(
                target_role=role.role_name if role else "Data Analyst",
                target_role_id=role.career_role_id if role else 1,
                readiness_score=0.0,
                matched_skills=[],
                missing_skills=[]
            )
        latest_run = db.query(AnalysisRun).order_by(AnalysisRun.analysis_id.desc()).first()
        analysis_id = latest_run.analysis_id if latest_run else 1

    # Fetch candidate matched skills
    cand_skills = db.query(CandidateSkill, Skill).join(
        Skill, CandidateSkill.skill_id == Skill.skill_id
    ).filter(CandidateSkill.profile_id == profile_id).all()
    matched_names = [s.Skill.skill_name for s in cand_skills]

    # Fetch missing skills / gaps
    gaps = db.query(SkillGap, Skill).join(
        Skill, SkillGap.skill_id == Skill.skill_id
    ).filter(
        SkillGap.analysis_id == analysis_id,
        SkillGap.career_role_id == (role.career_role_id if role else 1)
    ).all()

    gap_items = []
    for g, s in gaps:
        p_val = float(g.priority_score)
        p_label = "High" if p_val >= 60 else "Medium" if p_val >= 40 else "Low"
        gap_items.append(
            SkillGapItem(
                skill_gap_id=g.skill_gap_id,
                skill_id=g.skill_id,
                name=s.skill_name,
                current_level=g.current_level,
                required_level=g.required_level,
                priority=p_label,
                priority_score=p_val,
                status=g.status
            )
        )

    readiness = db.query(ReadinessScore).filter(
        ReadinessScore.analysis_id == analysis_id,
        ReadinessScore.career_role_id == (role.career_role_id if role else 1)
    ).first()

    return GapAnalysisResponse(
        target_role=role.role_name if role else "Data Analyst",
        target_role_id=role.career_role_id if role else 1,
        readiness_score=float(readiness.overall_score) if readiness else 0.0,
        matched_skills=matched_names,
        missing_skills=gap_items
    )

