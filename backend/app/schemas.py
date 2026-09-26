from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    account_role: str
    active_status: int

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Skills Schemas ---
class SkillBase(BaseModel):
    skill_id: int
    skill_name: str
    normalized_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CandidateSkillResponse(BaseModel):
    candidate_skill_id: int
    skill_id: int
    skill_name: str
    proficiency_level: int
    experience_months: Optional[int] = 0
    source: str
    extraction_confidence: Optional[float] = None

# --- Career Roles & Jobs ---
class CareerRoleResponse(BaseModel):
    career_role_id: int
    role_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    job_id: int
    career_role_id: int
    role_name: Optional[str] = None
    job_title: str
    company_name: str
    location: Optional[str] = None
    work_mode: Optional[str] = None
    description: Optional[str] = None
    experience_requirement: Optional[str] = None
    is_demo_data: int = 1

    class Config:
        from_attributes = True

# --- Analysis & Dashboard ---
class CareerRecommendationResponse(BaseModel):
    career_recommendation_id: int
    career_role_id: int
    role: str
    desc: Optional[str] = None
    match: float
    rank: int
    summary_explanation: Optional[str] = None

class MetricOverview(BaseModel):
    career_readiness: float
    top_career_match: str
    top_match_percentage: float
    total_skills: int
    missing_skills: int

class DashboardResponse(BaseModel):
    metrics: MetricOverview
    recommendations: List[CareerRecommendationResponse]
    market_skills: List[dict]
    user_name: str

# --- Skill Gap ---
class SkillGapItem(BaseModel):
    skill_gap_id: int
    skill_id: int
    name: str
    current_level: int
    required_level: int
    priority: str
    priority_score: float
    status: str

class GapAnalysisResponse(BaseModel):
    target_role: str
    target_role_id: int
    readiness_score: float
    matched_skills: List[str]
    missing_skills: List[SkillGapItem]

# --- Roadmap ---
class RoadmapStepResponse(BaseModel):
    roadmap_step_id: int
    step_number: int
    skill_name: str
    resource_title: Optional[str] = None
    resource_url: Optional[str] = None
    resource_type: Optional[str] = None
    provider: Optional[str] = None
    expected_days: Optional[int] = None
    completion_status: str

class RoadmapResponse(BaseModel):
    roadmap_id: int
    title: str
    target_role: str
    status: str
    steps: List[RoadmapStepResponse]

# --- Simulation ---
class SimulationRequest(BaseModel):
    target_role_id: int
    selected_skill_ids: List[int]

class SimulationResponse(BaseModel):
    target_role: str
    current_score: float
    simulated_score: float
    score_delta: float
    added_skills: List[str]
