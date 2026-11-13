from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, CandidateProfile, CandidatePreference, CareerRole, CandidateSkill, Skill,
    Education, Experience, Project, Certification, Resume, AnalysisRun, CareerRecommendation, LearningRoadmap
)
from app.schemas import ProfileResponse, ProfileUpdateRequest, SettingsPayload
from app.services.pdf_generator import generate_user_data_pdf
import os
import json
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

@router.get("/{user_id}/settings")
def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    pref = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()

    default_settings = {
        "theme": "light",
        "compact_mode": False,
        "notifications": {
            "careerRecs": True,
            "jobMatches": True,
            "learningReminders": True,
            "marketUpdates": False
        },
        "preferences": {
            "workType": pref.work_mode if (pref and pref.work_mode) else "Any",
            "location": pref.preferred_location if (pref and pref.preferred_location) else "Any",
            "interests": [],
            "remoteOk": True
        },
        "ai_settings": {
            "personalizedRecs": True,
            "jobMatching": True,
            "learningRecs": True
        }
    }

    if profile.settings_json:
        try:
            saved = json.loads(profile.settings_json)
            # Merge with defaults
            for key, val in saved.items():
                if isinstance(val, dict) and key in default_settings and isinstance(default_settings[key], dict):
                    default_settings[key].update(val)
                else:
                    default_settings[key] = val
        except Exception:
            pass

    return default_settings

@router.put("/{user_id}/settings")
def update_user_settings(user_id: int, payload: SettingsPayload, db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        profile = CandidateProfile(user_id=user_id)
        db.add(profile)
        db.flush()

    # Save to profile.settings_json
    settings_dict = payload.model_dump()
    profile.settings_json = json.dumps(settings_dict)

    # Sync candidate preferences
    pref = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
    if not pref:
        pref = CandidatePreference(profile_id=profile.profile_id)
        db.add(pref)

    if payload.preferences:
        pref_data = payload.preferences
        if "location" in pref_data and pref_data["location"]:
            pref.preferred_location = pref_data["location"]
        if "workType" in pref_data and pref_data["workType"]:
            pref.work_mode = pref_data["workType"]

    db.commit()
    return {"success": True, "message": "Settings updated successfully!", "settings": settings_dict}

@router.get("/{user_id}/export-data")
def export_user_data(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        return {"user": {"user_id": user.user_id, "name": user.full_name, "email": user.email}}

    cand_skills = db.query(CandidateSkill, Skill).join(Skill, CandidateSkill.skill_id == Skill.skill_id)\
        .filter(CandidateSkill.profile_id == profile.profile_id).all()
    skills_data = [{"skill": s.Skill.skill_name, "source": s.CandidateSkill.source} for s in cand_skills]

    pref = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
    resumes = db.query(Resume).filter(Resume.profile_id == profile.profile_id).all()
    analysis_runs = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile.profile_id).all()

    analysis_data = []
    for ar in analysis_runs:
        recs = db.query(CareerRecommendation, CareerRole).join(CareerRole, CareerRecommendation.career_role_id == CareerRole.career_role_id)\
            .filter(CareerRecommendation.analysis_id == ar.analysis_id).all()
        analysis_data.append({
            "analysis_id": ar.analysis_id,
            "analysis_date": ar.analysis_date.isoformat() if ar.analysis_date else None,
            "recommendations": [{
                "role": r.CareerRole.role_name,
                "match": float(r.CareerRecommendation.match_percentage or 0),
                "rank": r.CareerRecommendation.recommendation_rank
            } for r in recs]
        })

    settings_data = {}
    if profile.settings_json:
        try:
            settings_data = json.loads(profile.settings_json)
        except Exception:
            pass

    return {
        "export_date": "2026-10-12T00:00:00Z",
        "account": {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.account_role,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "profile": {
            "phone": profile.phone,
            "city": profile.city,
            "linkedin_url": profile.linkedin_url,
            "portfolio_url": profile.portfolio_url,
            "summary": profile.profile_summary,
            "photo_url": profile.profile_picture_url
        },
        "skills": skills_data,
        "preferences": {
            "preferred_location": pref.preferred_location if pref else None,
            "work_mode": pref.work_mode if pref else None,
            "expected_salary": float(pref.expected_salary) if (pref and pref.expected_salary) else None
        },
        "resumes": [{
            "file_name": r.file_name,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None
        } for r in resumes],
        "analysis_history": analysis_data,
        "saved_settings": settings_data
    }

@router.get("/{user_id}/recommendation-data")
def get_recommendation_data(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        return {"has_data": False, "recommendations": []}

    latest_run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile.profile_id)\
        .order_by(AnalysisRun.analysis_id.desc()).first()

    if not latest_run:
        return {"has_data": False, "recommendations": []}

    recs = db.query(CareerRecommendation, CareerRole).join(CareerRole, CareerRecommendation.career_role_id == CareerRole.career_role_id)\
        .filter(CareerRecommendation.analysis_id == latest_run.analysis_id)\
        .order_by(CareerRecommendation.recommendation_rank.asc()).all()

    return {
        "has_data": True,
        "analysis_id": latest_run.analysis_id,
        "analysis_date": latest_run.analysis_date.isoformat() if latest_run.analysis_date else None,
        "recommendations": [{
            "role": r.CareerRole.role_name,
            "match": float(r.CareerRecommendation.match_percentage or 0),
            "rank": r.CareerRecommendation.recommendation_rank,
            "summary": r.CareerRecommendation.summary_explanation
        } for r in recs]
    }

@router.delete("/{user_id}/recommendation-data")
def clear_recommendation_data(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Delete all analysis runs for this profile (cascades delete recommendations, gaps, roadmaps)
    runs = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile.profile_id).all()
    for run in runs:
        db.delete(run)
    db.commit()

    return {"success": True, "message": "Recommendation data reset successfully."}

@router.get("/{user_id}/export-pdf")
def export_user_data_pdf(user_id: int, db: Session = Depends(get_db)):
    data = export_user_data(user_id, db)
    pdf_buffer = generate_user_data_pdf(data)
    user_name = data.get("account", {}).get("full_name", f"User_{user_id}").replace(" ", "_")
    filename = f"CareerIQ_Profile_{user_name}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


