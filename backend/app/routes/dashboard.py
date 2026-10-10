from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, CandidateProfile, CandidateSkill, CareerRole, CareerRecommendation,
    ReadinessScore, SkillGap, Skill, AnalysisRun, Resume
)
from app.schemas import DashboardResponse, MetricOverview, CareerRecommendationResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch active user & profile
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database.")
        
    actual_user_id = user.user_id
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == actual_user_id).first()
    if not profile:
        profile = CandidateProfile(user_id=actual_user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    profile_id = profile.profile_id

    # 2. Check if user has uploaded a resume or run an analysis
    latest_run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile_id).order_by(AnalysisRun.analysis_id.desc()).first()
    latest_resume = db.query(Resume).filter(Resume.profile_id == profile_id).order_by(Resume.resume_id.desc()).first()

    # Skill demand distribution (always available for industry market reference)
    market_skills = [
        {"name": "Python", "demand": 95, "growth": "+18%"},
        {"name": "SQL", "demand": 88, "growth": "+12%"},
        {"name": "Power BI", "demand": 78, "growth": "+22%"},
        {"name": "Pandas", "demand": 75, "growth": "+15%"},
        {"name": "Excel", "demand": 70, "growth": "+8%"}
    ]

    # If first time login / no resume uploaded / no analysis yet -> Return 0 metrics
    if not latest_run:
        metrics = MetricOverview(
            career_readiness=0.0,
            top_career_match="No Resume Uploaded",
            top_match_percentage=0.0,
            total_skills=0,
            missing_skills=0
        )
        return DashboardResponse(
            metrics=metrics,
            recommendations=[],
            market_skills=market_skills,
            user_name=user.full_name,
            has_resume=False,
            resume_filename=None
        )

    # 3. User HAS uploaded a resume and has analysis data
    analysis_id = latest_run.analysis_id

    # Fetch user's calculated recommendations
    recs = db.query(CareerRecommendation, CareerRole).join(
        CareerRole, CareerRecommendation.career_role_id == CareerRole.career_role_id
    ).filter(CareerRecommendation.analysis_id == analysis_id).order_by(CareerRecommendation.recommendation_rank.asc()).all()

    rec_responses = [
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

    # Fetch user's readiness score
    readiness = db.query(ReadinessScore).filter(ReadinessScore.analysis_id == analysis_id).first()
    overall_readiness = float(readiness.overall_score) if readiness else 0.0

    # Counts
    total_skills = db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile_id).count()
    missing_skills = db.query(SkillGap).filter(SkillGap.analysis_id == analysis_id).count()

    top_role_name = rec_responses[0].role if rec_responses else "Pending Assessment"
    top_match_pct = rec_responses[0].match if rec_responses else 0.0

    metrics = MetricOverview(
        career_readiness=overall_readiness,
        top_career_match=top_role_name,
        top_match_percentage=top_match_pct,
        total_skills=total_skills,
        missing_skills=missing_skills
    )

    return DashboardResponse(
        metrics=metrics,
        recommendations=rec_responses,
        market_skills=market_skills,
        user_name=user.full_name,
        has_resume=True,
        resume_filename=latest_resume.file_name if latest_resume else "resume.pdf"
    )

