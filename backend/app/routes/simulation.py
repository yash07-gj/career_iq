from typing import Dict, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    CareerRole, CareerRoleSkill, CandidateSkill, CandidateProfile, CandidatePreference, Skill
)
from app.schemas import SimulationRequest, SimulationResponse
from app.services.matching_engine import ensure_current_analysis, latest_resume_role_name, skill_coverage
from app.services.insights import build_recommendations

router = APIRouter(prefix="/api/simulation", tags=["What-If Simulation"])


def _candidate_levels(user_id: Optional[int], db: Session) -> Dict[int, int]:
    """{skill_id: proficiency level} for the user's profile (skills from the resume + added manually)."""
    if not user_id:
        return {}
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile:
        return {}
    return {cs.skill_id: cs.proficiency_level for cs in
            db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile.profile_id).all()}


def _simulate(role_skills, levels: Dict[int, int], selected_ids):
    """Current readiness and readiness after learning the selected skills up to the required level."""
    current = round(skill_coverage(role_skills, levels), 1)
    simulated_levels = dict(levels)
    for rs in role_skills:
        if rs.skill_id in selected_ids:
            simulated_levels[rs.skill_id] = max(levels.get(rs.skill_id, 0), rs.required_level)
    simulated = round(skill_coverage(role_skills, simulated_levels), 1)
    return current, simulated


@router.get("/options")
def simulation_options(user_id: Optional[int] = Query(None), role_id: Optional[int] = Query(None),
                       db: Session = Depends(get_db)):
    """
    Everything the What-If page needs, based on the uploaded resume:
    roles (the resume's role first), the selected role, the candidate's current skills
    and the skills that role still needs.
    """
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first() if user_id else None
    has_resume = False
    resume_role = None
    roles = []
    if profile:
        run = ensure_current_analysis(profile, db)
        if run:
            has_resume = True
            resume_role = latest_resume_role_name(profile.profile_id, db)
            roles = [{"career_role_id": r.career_role_id, "role_name": r.role, "match": r.match, "fit": r.fit}
                     for r in build_recommendations(run.analysis_id, resume_role, db)]
    if not roles:
        roles = [{"career_role_id": r.career_role_id, "role_name": r.role_name, "match": None, "fit": None}
                 for r in db.query(CareerRole).filter(CareerRole.active_status == 1).order_by(CareerRole.role_name).all()]

    # Selected role: asked for > target role on the profile > top recommendation (the resume's role)
    role_ids = [r["career_role_id"] for r in roles]
    selected = role_id if role_id in role_ids else None
    if selected is None and profile:
        pref = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
        if pref and pref.target_role_id in role_ids:
            selected = pref.target_role_id
    if selected is None and role_ids:
        selected = role_ids[0]

    role = db.query(CareerRole).filter(CareerRole.career_role_id == selected).first()
    levels = _candidate_levels(user_id, db)
    role_skills = db.query(CareerRoleSkill, Skill).join(Skill, CareerRoleSkill.skill_id == Skill.skill_id) \
        .filter(CareerRoleSkill.career_role_id == selected).all() if role else []
    role_skill_ids = {rs.skill_id for rs, _ in role_skills}

    current_skills = sorted(
        s.skill_name for s in db.query(Skill).filter(Skill.skill_id.in_(list(levels))).all()
    ) if levels else []

    addable = []
    for rs, sk in role_skills:
        have = levels.get(rs.skill_id, 0)
        if have < rs.required_level:
            gain = _simulate([r for r, _ in role_skills], levels, {rs.skill_id})
            addable.append({
                "skill_id": rs.skill_id,
                "name": sk.skill_name,
                "status": "weak" if have > 0 else "missing",
                "current_level": have,
                "required_level": rs.required_level,
                "gain": round(gain[1] - gain[0], 1),
            })
    # Biggest readiness gain first
    addable.sort(key=lambda a: (-a["gain"], a["status"] != "missing"))

    current_score, _ = _simulate([r for r, _ in role_skills], levels, set())
    return {
        "has_resume": has_resume,
        "resume_role": resume_role,
        "roles": roles,
        "selected_role_id": selected,
        "selected_role": role.role_name if role else None,
        "current_skills": current_skills,
        "role_skill_ids": sorted(role_skill_ids),
        "addable_skills": addable,
        "current_score": current_score,
    }


@router.post("", response_model=SimulationResponse)
def simulate_career_readiness(req: SimulationRequest, db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(CareerRole.career_role_id == req.target_role_id).first()
    if not role:
        role = db.query(CareerRole).first()

    role_skills = db.query(CareerRoleSkill).filter(CareerRoleSkill.career_role_id == role.career_role_id).all()
    levels = _candidate_levels(req.user_id, db)
    selected = set(req.selected_skill_ids)
    current, simulated = _simulate(role_skills, levels, selected)

    added_names = [s.skill_name for s in db.query(Skill).filter(Skill.skill_id.in_(list(selected))).all()] if selected else []

    return SimulationResponse(
        target_role=role.role_name,
        current_score=current,
        simulated_score=simulated,
        score_delta=round(simulated - current, 1),
        added_skills=added_names
    )
