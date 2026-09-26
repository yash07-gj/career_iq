from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Skill, CareerRole
from app.schemas import SkillBase, CareerRoleResponse

router = APIRouter(prefix="/api", tags=["Skills & Roles"])

@router.get("/skills", response_model=List[SkillBase])
def get_all_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).filter(Skill.active_status == 1).all()
    return skills

@router.get("/career-roles", response_model=List[CareerRoleResponse])
def get_career_roles(db: Session = Depends(get_db)):
    roles = db.query(CareerRole).filter(CareerRole.active_status == 1).all()
    return roles
