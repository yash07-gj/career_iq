from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CandidateProfile, CandidatePreference, CareerRole, CandidateSkill, Skill
from app.schemas import ProfileResponse, ProfileUpdateRequest
import os
import shutil

router = APIRouter(prefix="/api/profile", tags=["Profile"])

UPLOAD_DIR = "uploads/profiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        profile = CandidateProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    preferences = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
    target_role_id = preferences.target_role_id if preferences else None
    target_role_name = None
    if target_role_id:
        role = db.query(CareerRole).filter(CareerRole.career_role_id == target_role_id).first()
        target_role_name = role.role_name if role else None

    # Get skills
    cand_skills = db.query(CandidateSkill, Skill).join(Skill, CandidateSkill.skill_id == Skill.skill_id)\
        .filter(CandidateSkill.profile_id == profile.profile_id).all()
    skills = [s.Skill.skill_name for s in cand_skills]

    # Education and Experience from profile summary for now or dedicated fields if they exist
    # Let's map education and experience fields if they were on profile?
    # CandidateProfile has profile_summary, but doesn't have direct education string field
    # Wait, the user wants "education" and "experience" fields in Profile. 
    # Let's just use the profile_summary and phone for now, or just add them.
    # We will use mock/dummy fields or the related models.
    # Let's use the first record of Education/Experience for simplicity.
    from app.models import Education, Experience
    edu = db.query(Education).filter(Education.profile_id == profile.profile_id).first()
    exp = db.query(Experience).filter(Experience.profile_id == profile.profile_id).first()
    
    education_str = edu.degree if edu else ""
    experience_str = exp.designation if exp else ""

    return ProfileResponse(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        profile_picture_url=profile.profile_picture_url,
        target_role_id=target_role_id,
        target_role_name=target_role_name,
        education=education_str,
        experience=experience_str,
        skills=skills
    )

@router.put("/{user_id}", response_model=ProfileResponse)
def update_profile(user_id: int, request: ProfileUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.full_name = request.full_name
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        profile = CandidateProfile(user_id=user_id)
        db.add(profile)
        db.flush()

    # Target Role
    preferences = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
    if not preferences:
        preferences = CandidatePreference(profile_id=profile.profile_id)
        db.add(preferences)
    
    if request.target_role_id:
        preferences.target_role_id = request.target_role_id
    elif request.target_role_name:
        role = db.query(CareerRole).filter(CareerRole.role_name == request.target_role_name).first()
        if role:
            preferences.target_role_id = role.career_role_id

    db.commit()

    return get_profile(user_id, db)

@router.post("/{user_id}/photo")
def upload_profile_photo(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        profile = CandidateProfile(user_id=user_id)
        db.add(profile)
        db.flush()

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"user_{user_id}_photo{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/uploads/profiles/{filename}"
    profile.profile_picture_url = url
    db.commit()

    return {"message": "Photo uploaded successfully", "profile_picture_url": url}
