from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CareerRole, CareerRoleSkill, CandidateSkill, Skill
from app.schemas import SimulationRequest, SimulationResponse

router = APIRouter(prefix="/api/simulation", tags=["What-If Simulation"])

@router.post("", response_model=SimulationResponse)
def simulate_career_readiness(req: SimulationRequest, db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(CareerRole.career_role_id == req.target_role_id).first()
    if not role:
        role = db.query(CareerRole).first()

    role_skills = db.query(CareerRoleSkill).filter(CareerRoleSkill.career_role_id == role.career_role_id).all()
    
    # Candidate base skills
    cand_skills = db.query(CandidateSkill).filter(CandidateSkill.profile_id == 1).all()
    base_skill_ids = {cs.skill_id for cs in cand_skills}

    # Combined with simulated skills
    simulated_skill_ids = base_skill_ids.union(set(req.selected_skill_ids))

    total_weight = sum(float(rs.importance_weight) for rs in role_skills)
    
    base_weight = sum(float(rs.importance_weight) for rs in role_skills if rs.skill_id in base_skill_ids)
    sim_weight = sum(float(rs.importance_weight) for rs in role_skills if rs.skill_id in simulated_skill_ids)

    base_score = round((base_weight / total_weight) * 100, 2) if total_weight > 0 else 78.0
    sim_score = round((sim_weight / total_weight) * 100, 2) if total_weight > 0 else 88.0
    
    added_names = [
        s.skill_name for s in db.query(Skill).filter(Skill.skill_id.in_(req.selected_skill_ids)).all()
    ]

    return SimulationResponse(
        target_role=role.role_name,
        current_score=base_score,
        simulated_score=sim_score,
        score_delta=round(sim_score - base_score, 2),
        added_skills=added_names
    )
