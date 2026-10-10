from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CandidateProfile, Resume, CandidateSkill, Skill
from app.schemas import ResumeUploadResponse
from app.services.resume_parser import process_resume_upload

router = APIRouter(prefix="/api/resume", tags=["Resume Parser"])

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_and_analyze_resume(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF or DOCX resume, parses raw text and skills,
    updates candidate profile and executes AI matching engine.
    """
    allowed_extensions = [".pdf", ".docx", ".doc", ".txt"]
    filename = file.filename or "resume.pdf"
    
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a PDF or DOCX resume document."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        result = process_resume_upload(
            user_id=user_id,
            original_filename=filename,
            file_bytes=content,
            db=db
        )
        return ResumeUploadResponse(**result)

    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print(f"[Resume Upload Exception] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@router.get("/status/{user_id}")
def get_resume_status(user_id: int, db: Session = Depends(get_db)):
    """Checks whether the user has uploaded an active parsed resume."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.user_id).first()
    if not profile:
        return {"has_resume": False, "skills": [], "total_skills": 0}

    resume = db.query(Resume).filter(Resume.profile_id == profile.profile_id).order_by(Resume.resume_id.desc()).first()
    cand_skills = db.query(CandidateSkill, Skill).join(
        Skill, CandidateSkill.skill_id == Skill.skill_id
    ).filter(CandidateSkill.profile_id == profile.profile_id).all()

    skill_list = [s.Skill.skill_name for s in cand_skills]

    return {
        "has_resume": resume is not None,
        "resume_id": resume.resume_id if resume else None,
        "file_name": resume.file_name if resume else None,
        "uploaded_at": resume.uploaded_at.isoformat() if resume and resume.uploaded_at else None,
        "skills": skill_list,
        "total_skills": len(skill_list)
    }
