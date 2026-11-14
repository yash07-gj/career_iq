from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models import User, CandidateProfile, Job, Resume, JobApplication, CareerRole

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

class AdminUserItem(BaseModel):
    user_id: int
    full_name: str
    email: str
    account_role: str
    active_status: int
    created_at: Optional[datetime] = None
    has_resume: bool = False
    profile_summary: Optional[str] = None
    city: Optional[str] = None

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_jobs: int
    total_resumes: int
    total_applications: int

class AdminApplicationItem(BaseModel):
    application_id: int
    job_id: int
    job_title: str
    company_name: str
    job_type: str
    location: Optional[str] = None
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    experience_level: Optional[str] = None
    cover_note: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_file_url: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

class StatusUpdateRequest(BaseModel):
    status: str

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.active_status == 1).count()
    total_jobs = db.query(Job).count()
    total_resumes = db.query(Resume).count()
    total_applications = db.query(JobApplication).count()

    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        total_jobs=total_jobs,
        total_resumes=total_resumes,
        total_applications=total_applications
    )

@router.get("/users", response_model=List[AdminUserItem])
def get_admin_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.user_id.asc()).all()
    results = []
    for u in users:
        prof = db.query(CandidateProfile).filter(CandidateProfile.user_id == u.user_id).first()
        has_res = False
        city_val = None
        summary_val = None
        if prof:
            has_res = db.query(Resume).filter(Resume.profile_id == prof.profile_id).count() > 0
            city_val = prof.city
            summary_val = prof.profile_summary

        results.append(AdminUserItem(
            user_id=u.user_id,
            full_name=u.full_name,
            email=u.email,
            account_role=u.account_role,
            active_status=u.active_status,
            created_at=u.created_at,
            has_resume=has_res,
            profile_summary=summary_val,
            city=city_val
        ))
    return results

@router.patch("/users/{user_id}/status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.account_role == "admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate admin account.")
    
    user.active_status = 0 if user.active_status == 1 else 1
    db.commit()
    db.refresh(user)
    return {"success": True, "user_id": user.user_id, "active_status": user.active_status}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.account_role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin account.")

    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User {user_id} deleted successfully."}

@router.get("/applications", response_model=List[AdminApplicationItem])
def get_admin_applications(db: Session = Depends(get_db)):
    results = db.query(JobApplication, Job).outerjoin(
        Job, JobApplication.job_id == Job.job_id
    ).order_by(JobApplication.application_id.desc()).all()

    items = []
    for app, job in results:
        items.append(AdminApplicationItem(
            application_id=app.application_id,
            job_id=app.job_id,
            job_title=job.job_title if job else "General Application",
            company_name=job.company_name if job else "CareerIQ Partner",
            job_type=job.job_type if job and job.job_type else "Full-time",
            location=job.location if job else "India",
            user_id=app.user_id,
            full_name=app.full_name,
            email=app.email,
            phone=app.phone,
            experience_level=app.experience_level,
            cover_note=app.cover_note,
            portfolio_url=app.portfolio_url,
            resume_file_url=app.resume_file_url,
            status=app.status or "Applied",
            created_at=app.created_at
        ))
    return items

@router.patch("/applications/{application_id}/status")
def update_application_status(application_id: int, payload: StatusUpdateRequest, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = payload.status
    db.commit()
    db.refresh(app)
    return {"success": True, "application_id": app.application_id, "status": app.status}

@router.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return {"success": True, "message": f"Application {application_id} deleted successfully."}
