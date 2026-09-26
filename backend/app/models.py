from datetime import datetime
from sqlalchemy import (
    Column, BigInteger, Integer, SmallInteger, String, Text, 
    DateTime, Date, DECIMAL, ForeignKey, Boolean, CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

# =============================================================================
# MODULE 1: CANDIDATE PROFILE (8 TABLES)
# =============================================================================

class User(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    account_role = Column(String(30), nullable=False, default="candidate")
    active_status = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    profile_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    phone = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    profile_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
    preferences = relationship("CandidatePreference", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    education = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    experience = relationship("Experience", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="profile", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="profile", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="profile", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRun", back_populates="profile", cascade="all, delete-orphan")


class CandidatePreference(Base):
    __tablename__ = "candidate_preferences"

    preference_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False, unique=True)
    target_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="SET NULL"), nullable=True)
    preferred_location = Column(String(150), nullable=True)
    work_mode = Column(String(30), nullable=True)
    expected_salary = Column(DECIMAL(12, 2), nullable=True)
    salary_currency = Column(String(3), default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="preferences")
    target_role = relationship("CareerRole")


class Education(Base):
    __tablename__ = "education"

    education_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    degree = Column(String(150), nullable=False)
    college = Column(String(200), nullable=False)
    specialization = Column(String(150), nullable=True)
    score = Column(DECIMAL(5, 2), nullable=True)
    score_type = Column(String(20), nullable=True)
    start_year = Column(SmallInteger, nullable=True)
    end_year = Column(SmallInteger, nullable=True)

    profile = relationship("CandidateProfile", back_populates="education")


class Experience(Base):
    __tablename__ = "experience"

    experience_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    company = Column(String(200), nullable=False)
    designation = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(SmallInteger, default=0)
    description = Column(Text, nullable=True)

    profile = relationship("CandidateProfile", back_populates="experience")


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    project_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    technologies = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    profile = relationship("CandidateProfile", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    certification_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    certificate_name = Column(String(200), nullable=False)
    issuer = Column(String(200), nullable=False)
    issue_date = Column(Date, nullable=True)
    credential_url = Column(String(500), nullable=True)

    profile = relationship("CandidateProfile", back_populates="certifications")


class Resume(Base):
    __tablename__ = "resumes"

    resume_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    extracted_text = Column(Text, nullable=True)
    parser_status = Column(String(30), default="pending")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="resumes")


# =============================================================================
# MODULE 2: SKILLS ENGINE (3 TABLES)
# =============================================================================

class Skill(Base):
    __tablename__ = "skills"

    skill_id = Column(BigInteger, primary_key=True, autoincrement=True)
    skill_name = Column(String(150), nullable=False)
    normalized_name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    active_status = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")


class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    alias_id = Column(BigInteger, primary_key=True, autoincrement=True)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    alias_name = Column(String(150), nullable=False, unique=True)
    normalized_alias = Column(String(150), nullable=False)

    skill = relationship("Skill", back_populates="aliases")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    candidate_skill_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="RESTRICT"), nullable=False)
    proficiency_level = Column(SmallInteger, default=1)
    experience_months = Column(SmallInteger, default=0)
    source = Column(String(20), default="manual")
    extraction_confidence = Column(DECIMAL(5, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="skills")
    skill = relationship("Skill")


# =============================================================================
# MODULE 3: REFERENCE DATASET (4 TABLES)
# =============================================================================

class CareerRole(Base):
    __tablename__ = "career_roles"

    career_role_id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    active_status = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    required_skills = relationship("CareerRoleSkill", back_populates="career_role", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="career_role")


class CareerRoleSkill(Base):
    __tablename__ = "career_role_skills"

    role_skill_id = Column(BigInteger, primary_key=True, autoincrement=True)
    career_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="RESTRICT"), nullable=False)
    required_level = Column(SmallInteger, default=1)
    importance_weight = Column(DECIMAL(5, 2), default=1.00)
    mandatory_flag = Column(SmallInteger, default=0)

    career_role = relationship("CareerRole", back_populates="required_skills")
    skill = relationship("Skill")


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(BigInteger, primary_key=True, autoincrement=True)
    career_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="RESTRICT"), nullable=False)
    job_title = Column(String(200), nullable=False)
    company_name = Column(String(200), nullable=False)
    location = Column(String(150), nullable=True)
    work_mode = Column(String(30), nullable=True)
    description = Column(Text, nullable=True)
    experience_requirement = Column(String(100), nullable=True)
    is_demo_data = Column(SmallInteger, default=1)
    source = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    career_role = relationship("CareerRole", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")


class JobSkill(Base):
    __tablename__ = "job_skills"

    job_skill_id = Column(BigInteger, primary_key=True, autoincrement=True)
    job_id = Column(BigInteger, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="RESTRICT"), nullable=False)
    required_level = Column(SmallInteger, default=1)
    importance_weight = Column(DECIMAL(5, 2), default=1.00)
    mandatory_flag = Column(SmallInteger, default=0)

    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill")


# =============================================================================
# MODULE 4: ANALYSIS RESULTS & EXPLAINABILITY (6 TABLES)
# =============================================================================

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    analysis_id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_id = Column(BigInteger, ForeignKey("candidate_profiles.profile_id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(BigInteger, ForeignKey("resumes.resume_id", ondelete="SET NULL"), nullable=True)
    analysis_date = Column(DateTime, default=datetime.utcnow)
    algorithm_version = Column(String(50), default="v1.0")
    status = Column(String(30), default="started")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    profile = relationship("CandidateProfile", back_populates="analysis_runs")
    resume = relationship("Resume")
    recommendations = relationship("CareerRecommendation", back_populates="analysis", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="analysis", cascade="all, delete-orphan")
    explanations = relationship("MatchExplanation", back_populates="analysis", cascade="all, delete-orphan")
    readiness_scores = relationship("ReadinessScore", back_populates="analysis", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="analysis", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="analysis", cascade="all, delete-orphan")


class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    career_recommendation_id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(BigInteger, ForeignKey("analysis_runs.analysis_id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="RESTRICT"), nullable=False)
    match_percentage = Column(DECIMAL(5, 2), default=0.00)
    recommendation_rank = Column(Integer, default=1)
    summary_explanation = Column(Text, nullable=True)

    analysis = relationship("AnalysisRun", back_populates="recommendations")
    career_role = relationship("CareerRole")


class JobMatch(Base):
    __tablename__ = "job_matches"

    job_match_id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(BigInteger, ForeignKey("analysis_runs.analysis_id", ondelete="CASCADE"), nullable=False)
    job_id = Column(BigInteger, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False)
    match_percentage = Column(DECIMAL(5, 2), default=0.00)
    match_rank = Column(Integer, default=1)
    summary_explanation = Column(Text, nullable=True)

    analysis = relationship("AnalysisRun", back_populates="job_matches")
    job = relationship("Job")


class MatchExplanation(Base):
    __tablename__ = "match_explanations"

    explanation_id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(BigInteger, ForeignKey("analysis_runs.analysis_id", ondelete="CASCADE"), nullable=False)
    job_match_id = Column(BigInteger, ForeignKey("job_matches.job_match_id", ondelete="CASCADE"), nullable=True)
    career_recommendation_id = Column(BigInteger, ForeignKey("career_recommendations.career_recommendation_id", ondelete="CASCADE"), nullable=True)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="SET NULL"), nullable=True)
    factor_type = Column(String(30), default="matched")
    contribution = Column(DECIMAL(7, 2), nullable=True)
    explanation_text = Column(Text, nullable=False)

    analysis = relationship("AnalysisRun", back_populates="explanations")
    job_match = relationship("JobMatch")
    career_recommendation = relationship("CareerRecommendation")
    skill = relationship("Skill")


class ReadinessScore(Base):
    __tablename__ = "readiness_scores"

    readiness_score_id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(BigInteger, ForeignKey("analysis_runs.analysis_id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="RESTRICT"), nullable=False)
    overall_score = Column(DECIMAL(5, 2), default=0.00)
    skills_score = Column(DECIMAL(5, 2), nullable=True)
    education_score = Column(DECIMAL(5, 2), nullable=True)
    experience_score = Column(DECIMAL(5, 2), nullable=True)
    projects_score = Column(DECIMAL(5, 2), nullable=True)

    analysis = relationship("AnalysisRun", back_populates="readiness_scores")
    career_role = relationship("CareerRole")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    skill_gap_id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(BigInteger, ForeignKey("analysis_runs.analysis_id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="RESTRICT"), nullable=False)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="RESTRICT"), nullable=False)
    current_level = Column(SmallInteger, default=0)
    required_level = Column(SmallInteger, default=1)
    priority_score = Column(DECIMAL(7, 2), default=0.00)
    status = Column(String(20), default="missing")

    analysis = relationship("AnalysisRun", back_populates="skill_gaps")
    career_role = relationship("CareerRole")
    skill = relationship("Skill")


# =============================================================================
# MODULE 5: LEARNING ROADMAP (4 TABLES)
# =============================================================================

class LearningResource(Base):
    __tablename__ = "learning_resources"

    resource_id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(150), nullable=True)
    resource_type = Column(String(30), nullable=False)
    url = Column(String(1000), nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    is_free = Column(SmallInteger, default=1)
    active_status = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningResourceSkill(Base):
    __tablename__ = "learning_resource_skills"

    resource_id = Column(BigInteger, ForeignKey("learning_resources.resource_id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="CASCADE"), primary_key=True)

    resource = relationship("LearningResource")
    skill = relationship("Skill")


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    roadmap_id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(BigInteger, ForeignKey("analysis_runs.analysis_id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(BigInteger, ForeignKey("career_roles.career_role_id", ondelete="RESTRICT"), nullable=False)
    roadmap_title = Column(String(255), nullable=False)
    status = Column(String(30), default="not_started")
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("AnalysisRun", back_populates="roadmaps")
    career_role = relationship("CareerRole")
    steps = relationship("RoadmapStep", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    roadmap_step_id = Column(BigInteger, primary_key=True, autoincrement=True)
    roadmap_id = Column(BigInteger, ForeignKey("learning_roadmaps.roadmap_id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(BigInteger, ForeignKey("skills.skill_id", ondelete="RESTRICT"), nullable=False)
    resource_id = Column(BigInteger, ForeignKey("learning_resources.resource_id", ondelete="SET NULL"), nullable=True)
    step_number = Column(Integer, default=1)
    expected_days = Column(Integer, nullable=True)
    completion_status = Column(String(30), default="not_started")

    roadmap = relationship("LearningRoadmap", back_populates="steps")
    skill = relationship("Skill")
    resource = relationship("LearningResource")
