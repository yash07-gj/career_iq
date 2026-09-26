from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Job, CareerRole
from app.schemas import JobResponse

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
def get_curated_jobs(db: Session = Depends(get_db)):
    results = db.query(Job, CareerRole).join(
        CareerRole, Job.career_role_id == CareerRole.career_role_id
    ).all()

    jobs_out = []
    for job, role in results:
        jobs_out.append(
            JobResponse(
                job_id=job.job_id,
                career_role_id=job.career_role_id,
                role_name=role.role_name,
                job_title=job.job_title,
                company_name=job.company_name,
                location=job.location,
                work_mode=job.work_mode,
                description=job.description,
                experience_requirement=job.experience_requirement,
                is_demo_data=job.is_demo_data
            )
        )
    return jobs_out
