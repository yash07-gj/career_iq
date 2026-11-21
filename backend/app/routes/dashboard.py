from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, CandidateProfile, CandidateSkill, CareerRole, CareerRoleSkill, CareerRecommendation,
    ReadinessScore, SkillGap, Skill, AnalysisRun, Resume
)
from app.schemas import DashboardResponse, MetricOverview, CareerRecommendationResponse
from app.services.matching_engine import ensure_current_analysis, latest_resume_role_name, skill_coverage
from app.services.insights import build_recommendations, build_job_matches

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
    latest_run = ensure_current_analysis(profile, db)
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

    # Recommendations ranked by the job title on the resume + skills
    resume_role = latest_resume_role_name(profile_id, db)
    rec_responses = build_recommendations(analysis_id, resume_role, db)

    top_role_id = rec_responses[0].career_role_id if rec_responses else 1
    top_role_name = rec_responses[0].role if rec_responses else "Pending Assessment"
    top_match_pct = rec_responses[0].match if rec_responses else 0.0

    # Fetch candidate's acquired skills
    cand_skills = db.query(CandidateSkill, Skill).join(
        Skill, CandidateSkill.skill_id == Skill.skill_id
    ).filter(CandidateSkill.profile_id == profile_id).all()
    cand_skill_map = {cs.Skill.skill_id: (cs.CandidateSkill.proficiency_level, cs.Skill.skill_name) for cs in cand_skills}

    # Calculate missing skills for the top career match role (exact same as Skill Gap Analysis)
    role_skills = db.query(CareerRoleSkill, Skill).join(
        Skill, CareerRoleSkill.skill_id == Skill.skill_id
    ).filter(CareerRoleSkill.career_role_id == top_role_id).all()

    # Missing skills (not in the resume at all) first, then weak ones, most important first
    role_skills.sort(key=lambda r: (cand_skill_map.get(r[0].skill_id, (0, ""))[0] > 0, -float(r[0].importance_weight)))
    missing_skill_names = []
    missing_skill_names_lower = set()
    for rs, sk in role_skills:
        cand_level, _ = cand_skill_map.get(rs.skill_id, (0, sk.skill_name))
        if cand_level < rs.required_level:
            missing_skill_names.append(sk.skill_name)
            missing_skill_names_lower.add(sk.skill_name.lower())

    missing_skills_count = len(missing_skill_names)

    # Career readiness for the top (resume) role from the candidate's current skills,
    # calculated exactly like the Skill Gap page so both pages show the same number
    overall_readiness = round(skill_coverage(
        [rs for rs, _sk in role_skills],
        {sid: lvl for sid, (lvl, _n) in cand_skill_map.items()},
    ), 1)

    # Calculate verified acquired skills (exact same as Skill Gap Analysis)
    matched_names = []
    seen_matched = set()
    for cs in cand_skills:
        s_name = cs.Skill.skill_name
        s_name_lower = s_name.lower()
        if s_name_lower not in missing_skill_names_lower and s_name_lower not in seen_matched:
            matched_names.append(s_name)
            seen_matched.add(s_name_lower)

    matched_skills_count = len(matched_names)

    metrics = MetricOverview(
        career_readiness=overall_readiness,
        top_career_match=top_role_name,
        top_match_percentage=top_match_pct,
        total_skills=matched_skills_count,
        missing_skills=missing_skills_count
    )

    return DashboardResponse(
        metrics=metrics,
        recommendations=rec_responses,
        market_skills=market_skills,
        missing_skills_list=missing_skill_names,
        matched_skills_list=matched_names,
        job_matches=build_job_matches(analysis_id, resume_role, db, limit=4),
        resume_role=resume_role,
        user_name=user.full_name,
        has_resume=True,
        resume_filename=latest_resume.file_name if latest_resume else "resume.pdf"
    )

