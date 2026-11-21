"""Read helpers shared by the Dashboard and Recommendations APIs."""
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models import CareerRecommendation, CareerRole, Job, JobMatch
from app.schemas import CareerRecommendationResponse, JobMatchItem
from app.services.career_catalog import title_fit


def fit_label(role_name: str, resume_role_name: Optional[str]) -> Optional[str]:
    """'resume' = the job title on the resume, 'related' = same career family, else None."""
    fit = title_fit(role_name, resume_role_name)
    return "resume" if fit == 100 else "related" if fit >= 60 else None


def build_recommendations(analysis_id: int, resume_role_name: Optional[str], db: Session) -> List[CareerRecommendationResponse]:
    rows = db.query(CareerRecommendation, CareerRole).join(
        CareerRole, CareerRecommendation.career_role_id == CareerRole.career_role_id
    ).filter(CareerRecommendation.analysis_id == analysis_id).order_by(CareerRecommendation.recommendation_rank.asc()).all()
    return [
        CareerRecommendationResponse(
            career_recommendation_id=rec.career_recommendation_id,
            career_role_id=role.career_role_id,
            role=role.role_name,
            desc=role.description,
            match=float(rec.match_percentage),
            rank=rec.recommendation_rank,
            summary_explanation=rec.summary_explanation,
            fit=fit_label(role.role_name, resume_role_name),
        )
        for rec, role in rows
    ]


def build_job_matches(analysis_id: int, resume_role_name: Optional[str], db: Session, limit: int = 6) -> List[JobMatchItem]:
    """Best-matching positions for the analysis (already ranked by resume title + skills)."""
    rows = db.query(JobMatch, Job, CareerRole).join(
        Job, JobMatch.job_id == Job.job_id
    ).outerjoin(
        CareerRole, Job.career_role_id == CareerRole.career_role_id
    ).filter(JobMatch.analysis_id == analysis_id).order_by(JobMatch.match_rank.asc()).limit(limit).all()
    return [
        JobMatchItem(
            job_id=job.job_id,
            job_title=job.job_title,
            company_name=job.company_name,
            location=job.location,
            work_mode=job.work_mode,
            job_type=job.job_type,
            salary_range=job.salary_range,
            role_name=role.role_name if role else None,
            match=float(jm.match_percentage),
            rank=jm.match_rank,
            fit=fit_label(role.role_name, resume_role_name) if role else None,
        )
        for jm, job, role in rows
    ]
