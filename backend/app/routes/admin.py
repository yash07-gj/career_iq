from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, CandidateProfile, CandidatePreference, CareerRole, Resume

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """
    Fetches all user details from the MySQL database.
    """
    users = db.query(User).order_by(User.user_id.asc()).all()
    user_list = []

    for u in users:
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == u.user_id).first()
        target_role_name = None
        resumes_count = 0

        if profile:
            pref = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
            if pref and pref.target_role_id:
                role = db.query(CareerRole).filter(CareerRole.career_role_id == pref.target_role_id).first()
                if role:
                    target_role_name = role.role_name

            resumes_count = db.query(Resume).filter(Resume.profile_id == profile.profile_id).count()

        user_list.append({
            "user_id": u.user_id,
            "full_name": u.full_name,
            "email": u.email,
            "account_role": u.account_role or "candidate",
            "active_status": u.active_status if u.active_status is not None else 1,
            "created_at": u.created_at.strftime("%d %b %Y, %I:%M %p") if u.created_at else "N/A",
            "phone": profile.phone if profile and profile.phone else "Not provided",
            "city": profile.city if profile and profile.city else "Not provided",
            "target_role": target_role_name or "Not set",
            "resumes_count": resumes_count,
        })

    return user_list

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Deletes a user account from MySQL database (protects primary admin user).
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.email == "admin@careeriq.com":
        raise HTTPException(status_code=400, detail="Cannot delete the primary system administrator account.")

    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User '{user.full_name}' deleted successfully from database."}

@router.patch("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    """
    Toggles user active_status between Active (1) and Inactive (0).
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.active_status = 0 if user.active_status == 1 else 1
    db.commit()
    status_text = "Active" if user.active_status == 1 else "Inactive"
    return {
        "success": True,
        "message": f"User status updated to {status_text}.",
        "active_status": user.active_status
    }
