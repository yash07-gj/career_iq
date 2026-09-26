from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LearningRoadmap, RoadmapStep, Skill, LearningResource, CareerRole
from app.schemas import RoadmapResponse, RoadmapStepResponse

router = APIRouter(prefix="/api/roadmap", tags=["Learning Roadmap"])

@router.get("", response_model=RoadmapResponse)
def get_current_roadmap(db: Session = Depends(get_db)):
    roadmap = db.query(LearningRoadmap).order_by(LearningRoadmap.roadmap_id.desc()).first()
    if not roadmap:
        return RoadmapResponse(
            roadmap_id=1,
            title="30-Day Accelerated Data Analyst Career Roadmap",
            target_role="Data Analyst",
            status="in_progress",
            steps=[]
        )

    role = db.query(CareerRole).filter(CareerRole.career_role_id == roadmap.career_role_id).first()
    steps_db = db.query(RoadmapStep, Skill, LearningResource).join(
        Skill, RoadmapStep.skill_id == Skill.skill_id
    ).outerjoin(
        LearningResource, RoadmapStep.resource_id == LearningResource.resource_id
    ).filter(
        RoadmapStep.roadmap_id == roadmap.roadmap_id
    ).order_by(RoadmapStep.step_number.asc()).all()

    steps_out = []
    for step, skill, res in steps_db:
        steps_out.append(
            RoadmapStepResponse(
                roadmap_step_id=step.roadmap_step_id,
                step_number=step.step_number,
                skill_name=skill.skill_name,
                resource_title=res.title if res else "Official Documentation & Tutorials",
                resource_url=res.url if res else "https://learn.microsoft.com",
                resource_type=res.resource_type if res else "course",
                provider=res.provider if res else "Curated",
                expected_days=step.expected_days or 7,
                completion_status=step.completion_status
            )
        )

    return RoadmapResponse(
        roadmap_id=roadmap.roadmap_id,
        title=roadmap.roadmap_title,
        target_role=role.role_name if role else "Data Analyst",
        status=roadmap.status,
        steps=steps_out
    )

@router.put("/step/{step_id}/status")
def update_step_status(step_id: int, status: str, db: Session = Depends(get_db)):
    step = db.query(RoadmapStep).filter(RoadmapStep.roadmap_step_id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    step.completion_status = status
    db.commit()
    return {"message": "Step status updated", "step_id": step_id, "status": status}
