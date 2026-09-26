from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, CandidateProfile, CandidateSkill, CareerRole, CareerRecommendation,
    ReadinessScore, SkillGap, Skill, AnalysisRun
)
from app.schemas import DashboardResponse, MetricOverview, CareerRecommendationResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    # 1. Fetch default active user & profile (John Doe, user_id=1)
    user = db.query(User).filter(User.user_id == 1).first()
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == 1).first()
    profile_id = profile.profile_id if profile else 1

    # 2. Get latest analysis run
    latest_run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile_id).order_by(AnalysisRun.analysis_id.desc()).first()
    analysis_id = latest_run.analysis_id if latest_run else 1

    # 3. Fetch recommendations
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

    # 4. Fetch readiness score
    readiness = db.query(ReadinessScore).filter(ReadinessScore.analysis_id == analysis_id).first()
    overall_readiness = float(readiness.overall_score) if readiness else 78.0

    # 5. Counts
    total_skills = db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile_id).count()
    missing_skills = db.query(SkillGap).filter(SkillGap.analysis_id == analysis_id).count()

    top_role_name = rec_responses[0].role if rec_responses else "Data Analyst"
    top_match_pct = rec_responses[0].match if rec_responses else 89.0

    metrics = MetricOverview(
        career_readiness=overall_readiness,
        top_career_match=top_role_name,
        top_match_percentage=top_match_pct,
        total_skills=total_skills if total_skills > 0 else 12,
        missing_skills=missing_skills if missing_skills > 0 else 5
    )

    # 6. Skill demand distribution
    market_skills = [
        {"name": "Python", "demand": 95, "growth": "+18%"},
        {"name": "SQL", "demand": 88, "growth": "+12%"},
        {"name": "Power BI", "demand": 78, "growth": "+22%"},
        {"name": "Pandas", "demand": 75, "growth": "+15%"},
        {"name": "Excel", "demand": 70, "growth": "+8%"}
    ]

    return DashboardResponse(
        metrics=metrics,
        recommendations=rec_responses,
        market_skills=market_skills,
        user_name=user.full_name if user else "John Doe"
    )
