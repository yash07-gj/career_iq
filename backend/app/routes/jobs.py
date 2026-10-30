from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.database import get_db
from app.models import Job, CareerRole, JobApplication, User, CandidateProfile, JobSkill, Skill
from app.schemas import JobResponse, JobCreateOrUpdate, JobApplicationCreate, JobApplicationResponse

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

APPLICATION_UPLOADS_DIR = "uploads/applications"
os.makedirs(APPLICATION_UPLOADS_DIR, exist_ok=True)

def format_job_response(job: Job, role: CareerRole, db: Session) -> JobResponse:
    # Fetch skill names for this job
    skills = db.query(Skill.skill_name).join(
        JobSkill, JobSkill.skill_id == Skill.skill_id
    ).filter(JobSkill.job_id == job.job_id).all()
    skill_names = [s[0] for s in skills]

    # Calculate match baseline (or default 85-92%)
    match_score = 88 if "Intern" in job.job_title else 84

    return JobResponse(
        job_id=job.job_id,
        career_role_id=job.career_role_id,
        role_name=role.role_name if role else "Technology",
        job_title=job.job_title,
        company_name=job.company_name,
        location=job.location,
        work_mode=job.work_mode,
        job_type=job.job_type or "Full-time",
        salary_range=job.salary_range,
        description=job.description,
        responsibilities=job.responsibilities,
        experience_requirement=job.experience_requirement,
        skills=skill_names,
        match=match_score,
        is_demo_data=job.is_demo_data
    )

@router.get("", response_model=List[JobResponse])
def get_curated_jobs(db: Session = Depends(get_db)):
    results = db.query(Job, CareerRole).join(
        CareerRole, Job.career_role_id == CareerRole.career_role_id
    ).order_by(Job.job_id.asc()).all()

    jobs_out = []
    for job, role in results:
        jobs_out.append(format_job_response(job, role, db))
    return jobs_out

@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    role = db.query(CareerRole).filter(CareerRole.career_role_id == job.career_role_id).first()
    return format_job_response(job, role, db)

@router.post("", response_model=JobResponse)
def create_job(payload: JobCreateOrUpdate, db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(CareerRole.career_role_id == payload.career_role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid career_role_id")

    new_job = Job(
        career_role_id=payload.career_role_id,
        job_title=payload.job_title,
        company_name=payload.company_name,
        location=payload.location,
        work_mode=payload.work_mode,
        job_type=payload.job_type,
        experience_requirement=payload.experience_requirement,
        salary_range=payload.salary_range,
        description=payload.description,
        responsibilities=payload.responsibilities,
        is_demo_data=0,
        source="Admin Added"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Link skills
    if payload.skill_ids:
        for sid in payload.skill_ids:
            db.add(JobSkill(job_id=new_job.job_id, skill_id=sid, required_level=3, importance_weight=1.25, mandatory_flag=1))
        db.commit()

    return format_job_response(new_job, role, db)

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, payload: JobCreateOrUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.career_role_id = payload.career_role_id
    job.job_title = payload.job_title
    job.company_name = payload.company_name
    job.location = payload.location
    job.work_mode = payload.work_mode
    job.job_type = payload.job_type
    job.experience_requirement = payload.experience_requirement
    job.salary_range = payload.salary_range
    job.description = payload.description
    job.responsibilities = payload.responsibilities
    
    # Update skills if provided
    if payload.skill_ids is not None:
        db.query(JobSkill).filter(JobSkill.job_id == job_id).delete()
        for sid in payload.skill_ids:
            db.add(JobSkill(job_id=job_id, skill_id=sid, required_level=3, importance_weight=1.25, mandatory_flag=1))

    db.commit()
    db.refresh(job)
    role = db.query(CareerRole).filter(CareerRole.career_role_id == job.career_role_id).first()
    return format_job_response(job, role, db)

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"success": True, "message": f"Job {job_id} deleted successfully from database."}

@router.post("/apply", response_model=JobApplicationResponse)
def submit_job_application(
    payload: JobApplicationCreate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_app = JobApplication(
        job_id=payload.job_id,
        user_id=payload.user_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        experience_level=payload.experience_level,
        cover_note=payload.cover_note,
        portfolio_url=payload.portfolio_url,
        resume_file_url=payload.resume_file_url,
        status="Applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.post("/apply-with-resume")
def submit_job_application_with_resume(
    job_id: int = Form(...),
    user_id: int = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    cover_note: Optional[str] = Form(None),
    portfolio_url: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resume_url = None
    if resume_file and resume_file.filename:
        file_ext = os.path.splitext(resume_file.filename)[1]
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        saved_filename = f"application_user_{user_id}_job_{job_id}_{timestamp}{file_ext}"
        filepath = os.path.join(APPLICATION_UPLOADS_DIR, saved_filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(resume_file.file, buffer)
        resume_url = f"/uploads/applications/{saved_filename}"

    new_app = JobApplication(
        job_id=job_id,
        user_id=user_id,
        full_name=full_name,
        email=email,
        phone=phone,
        experience_level=experience_level,
        cover_note=cover_note,
        portfolio_url=portfolio_url,
        resume_file_url=resume_url,
        status="Applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return {
        "success": True,
        "message": "Application submitted successfully!",
        "application_id": new_app.application_id,
        "status": new_app.status
    }

@router.get("/user-applications/{user_id}", response_model=List[JobApplicationResponse])
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    apps = db.query(JobApplication).filter(JobApplication.user_id == user_id).order_by(JobApplication.application_id.desc()).all()
    return apps
