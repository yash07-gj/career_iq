-- =============================================================================
-- CareerIQ Database Specification — Complete 25-Table Schema
-- Storage Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Target System: MySQL Workbench / MySQL Server 8.0+
-- =============================================================================

DROP DATABASE IF EXISTS careeriq_db;
CREATE DATABASE careeriq_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE careeriq_db;

-- Disable foreign key checks for clean creation order
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- MODULE 1: CANDIDATE PROFILE (8 TABLES)
-- =============================================================================

-- 1. users: Account and authentication data
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account_role VARCHAR(30) NOT NULL DEFAULT 'candidate',
    active_status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. candidate_profiles: 1-to-1 profile linked to users
CREATE TABLE candidate_profiles (
    profile_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    linkedin_url VARCHAR(500) DEFAULT NULL,
    portfolio_url VARCHAR(500) DEFAULT NULL,
    profile_summary TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) 
        REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. candidate_preferences: Career goals and compensation preferences
CREATE TABLE candidate_preferences (
    preference_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL UNIQUE,
    target_role_id BIGINT UNSIGNED DEFAULT NULL,
    preferred_location VARCHAR(150) DEFAULT NULL,
    work_mode VARCHAR(30) DEFAULT NULL,
    expected_salary DECIMAL(12,2) DEFAULT NULL,
    salary_currency CHAR(3) DEFAULT 'INR',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pref_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. education: Academic qualifications
CREATE TABLE education (
    education_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    degree VARCHAR(150) NOT NULL,
    college VARCHAR(200) NOT NULL,
    specialization VARCHAR(150) DEFAULT NULL,
    score DECIMAL(5,2) DEFAULT NULL,
    score_type VARCHAR(20) DEFAULT NULL,
    start_year SMALLINT UNSIGNED DEFAULT NULL,
    end_year SMALLINT UNSIGNED DEFAULT NULL,
    INDEX idx_edu_profile (profile_id),
    CONSTRAINT fk_edu_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. experience: Work and internship history
CREATE TABLE experience (
    experience_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    company VARCHAR(200) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    is_current TINYINT(1) NOT NULL DEFAULT 0,
    description TEXT DEFAULT NULL,
    INDEX idx_exp_profile (profile_id),
    CONSTRAINT fk_exp_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. projects: Academic, personal, and professional projects
CREATE TABLE projects (
    project_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    project_title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    github_url VARCHAR(500) DEFAULT NULL,
    live_url VARCHAR(500) DEFAULT NULL,
    technologies TEXT DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    INDEX idx_proj_profile (profile_id),
    CONSTRAINT fk_proj_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. certifications: Professional certificates and courses
CREATE TABLE certifications (
    certification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    certificate_name VARCHAR(200) NOT NULL,
    issuer VARCHAR(200) NOT NULL,
    issue_date DATE DEFAULT NULL,
    credential_url VARCHAR(500) DEFAULT NULL,
    INDEX idx_cert_profile (profile_id),
    CONSTRAINT fk_cert_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. resumes: Uploaded resume metadata and NLP extracted raw text
CREATE TABLE resumes (
    resume_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    extracted_text LONGTEXT DEFAULT NULL,
    parser_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resume_profile (profile_id),
    CONSTRAINT fk_resume_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- MODULE 2: SKILLS ENGINE (3 TABLES)
-- =============================================================================

-- 9. skills: Master taxonomy of canonical normalized skills
CREATE TABLE skills (
    skill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(150) NOT NULL,
    normalized_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    active_status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. skill_aliases: Alternate names and abbreviations for matching
CREATE TABLE skill_aliases (
    alias_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT UNSIGNED NOT NULL,
    alias_name VARCHAR(150) NOT NULL UNIQUE,
    normalized_alias VARCHAR(150) NOT NULL,
    INDEX idx_alias_skill (skill_id),
    CONSTRAINT fk_alias_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. candidate_skills: Candidate's verified/extracted skill inventory
CREATE TABLE candidate_skills (
    candidate_skill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    skill_id BIGINT UNSIGNED NOT NULL,
    proficiency_level TINYINT UNSIGNED NOT NULL DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
    experience_months SMALLINT UNSIGNED DEFAULT 0,
    source VARCHAR(20) NOT NULL DEFAULT 'manual',
    extraction_confidence DECIMAL(5,2) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cand_skill (profile_id, skill_id),
    INDEX idx_cand_skill_skill (skill_id),
    CONSTRAINT fk_cand_skill_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE,
    CONSTRAINT fk_cand_skill_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- MODULE 3: REFERENCE DATASET (4 TABLES)
-- =============================================================================

-- 12. career_roles: Available industry career paths
CREATE TABLE career_roles (
    career_role_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    active_status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now link candidate_preferences to career_roles
ALTER TABLE candidate_preferences
    ADD CONSTRAINT fk_pref_career_role FOREIGN KEY (target_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE SET NULL;

-- 13. career_role_skills: Required skill competencies per role
CREATE TABLE career_role_skills (
    role_skill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    career_role_id BIGINT UNSIGNED NOT NULL,
    skill_id BIGINT UNSIGNED NOT NULL,
    required_level TINYINT UNSIGNED NOT NULL DEFAULT 1 CHECK (required_level BETWEEN 1 AND 5),
    importance_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    mandatory_flag TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_role_skill (career_role_id, skill_id),
    INDEX idx_role_skill_skill (skill_id),
    CONSTRAINT fk_role_skill_role FOREIGN KEY (career_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE CASCADE,
    CONSTRAINT fk_role_skill_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. jobs: Curated dummy job opportunities
CREATE TABLE jobs (
    job_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    career_role_id BIGINT UNSIGNED NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    location VARCHAR(150) DEFAULT NULL,
    work_mode VARCHAR(30) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    experience_requirement VARCHAR(100) DEFAULT NULL,
    is_demo_data TINYINT(1) NOT NULL DEFAULT 1,
    source VARCHAR(100) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_job_role (career_role_id),
    CONSTRAINT fk_job_role FOREIGN KEY (career_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. job_skills: Skill requirements for each job listing
CREATE TABLE job_skills (
    job_skill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT UNSIGNED NOT NULL,
    skill_id BIGINT UNSIGNED NOT NULL,
    required_level TINYINT UNSIGNED NOT NULL DEFAULT 1 CHECK (required_level BETWEEN 1 AND 5),
    importance_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    mandatory_flag TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_job_skill (job_id, skill_id),
    INDEX idx_job_skill_skill (skill_id),
    CONSTRAINT fk_job_skill_job FOREIGN KEY (job_id) 
        REFERENCES jobs (job_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_skill_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- MODULE 4: ANALYSIS RESULTS & EXPLAINABILITY (6 TABLES)
-- =============================================================================

-- 16. analysis_runs: Profile assessment session log
CREATE TABLE analysis_runs (
    analysis_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    resume_id BIGINT UNSIGNED DEFAULT NULL,
    analysis_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    algorithm_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    status VARCHAR(30) NOT NULL DEFAULT 'started',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    INDEX idx_run_profile (profile_id),
    INDEX idx_run_resume (resume_id),
    CONSTRAINT fk_run_profile FOREIGN KEY (profile_id) 
        REFERENCES candidate_profiles (profile_id) ON DELETE CASCADE,
    CONSTRAINT fk_run_resume FOREIGN KEY (resume_id) 
        REFERENCES resumes (resume_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. career_recommendations: Match percentages for recommended career roles
CREATE TABLE career_recommendations (
    career_recommendation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    career_role_id BIGINT UNSIGNED NOT NULL,
    match_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    recommendation_rank INT UNSIGNED NOT NULL DEFAULT 1,
    summary_explanation TEXT DEFAULT NULL,
    UNIQUE KEY uq_rec_run_role (analysis_id, career_role_id),
    INDEX idx_rec_role (career_role_id),
    CONSTRAINT fk_rec_analysis FOREIGN KEY (analysis_id) 
        REFERENCES analysis_runs (analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_role FOREIGN KEY (career_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. job_matches: Matched dummy job postings for candidate
CREATE TABLE job_matches (
    job_match_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    job_id BIGINT UNSIGNED NOT NULL,
    match_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    match_rank INT UNSIGNED NOT NULL DEFAULT 1,
    summary_explanation TEXT DEFAULT NULL,
    UNIQUE KEY uq_match_run_job (analysis_id, job_id),
    INDEX idx_match_job (job_id),
    CONSTRAINT fk_match_analysis FOREIGN KEY (analysis_id) 
        REFERENCES analysis_runs (analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_job FOREIGN KEY (job_id) 
        REFERENCES jobs (job_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. match_explanations: Detailed Explainable AI (XAI) factors
CREATE TABLE match_explanations (
    explanation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    job_match_id BIGINT UNSIGNED DEFAULT NULL,
    career_recommendation_id BIGINT UNSIGNED DEFAULT NULL,
    skill_id BIGINT UNSIGNED DEFAULT NULL,
    factor_type VARCHAR(30) NOT NULL DEFAULT 'matched',
    contribution DECIMAL(7,2) DEFAULT NULL,
    explanation_text TEXT NOT NULL,
    INDEX idx_exp_analysis (analysis_id),
    INDEX idx_exp_job_match (job_match_id),
    INDEX idx_exp_career_rec (career_recommendation_id),
    INDEX idx_exp_skill (skill_id),
    CONSTRAINT chk_exp_target CHECK (
        (job_match_id IS NOT NULL AND career_recommendation_id IS NULL) OR 
        (job_match_id IS NULL AND career_recommendation_id IS NOT NULL)
    ),
    CONSTRAINT fk_exp_analysis FOREIGN KEY (analysis_id) 
        REFERENCES analysis_runs (analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_job_match FOREIGN KEY (job_match_id) 
        REFERENCES job_matches (job_match_id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_career_rec FOREIGN KEY (career_recommendation_id) 
        REFERENCES career_recommendations (career_recommendation_id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. readiness_scores: Multi-factor career preparation scores
CREATE TABLE readiness_scores (
    readiness_score_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    career_role_id BIGINT UNSIGNED NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    skills_score DECIMAL(5,2) DEFAULT NULL,
    education_score DECIMAL(5,2) DEFAULT NULL,
    experience_score DECIMAL(5,2) DEFAULT NULL,
    projects_score DECIMAL(5,2) DEFAULT NULL,
    UNIQUE KEY uq_readiness_run_role (analysis_id, career_role_id),
    INDEX idx_readiness_role (career_role_id),
    CONSTRAINT fk_readiness_analysis FOREIGN KEY (analysis_id) 
        REFERENCES analysis_runs (analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_readiness_role FOREIGN KEY (career_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. skill_gaps: Missing or weak skills needing closure
CREATE TABLE skill_gaps (
    skill_gap_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    career_role_id BIGINT UNSIGNED NOT NULL,
    skill_id BIGINT UNSIGNED NOT NULL,
    current_level TINYINT UNSIGNED NOT NULL DEFAULT 0 CHECK (current_level BETWEEN 0 AND 5),
    required_level TINYINT UNSIGNED NOT NULL DEFAULT 1 CHECK (required_level BETWEEN 1 AND 5),
    priority_score DECIMAL(7,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'missing',
    UNIQUE KEY uq_gap_run_role_skill (analysis_id, career_role_id, skill_id),
    INDEX idx_gap_skill (skill_id),
    CONSTRAINT fk_gap_analysis FOREIGN KEY (analysis_id) 
        REFERENCES analysis_runs (analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_gap_role FOREIGN KEY (career_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE RESTRICT,
    CONSTRAINT fk_gap_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- MODULE 5: LEARNING ROADMAP (4 TABLES)
-- =============================================================================

-- 22. learning_resources: Curated courses, videos, and tutorials
CREATE TABLE learning_resources (
    resource_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(150) DEFAULT NULL,
    resource_type VARCHAR(30) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    duration_minutes INT UNSIGNED DEFAULT NULL,
    is_free TINYINT(1) NOT NULL DEFAULT 1,
    active_status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_res_type (resource_type),
    INDEX idx_res_free (is_free)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. learning_resource_skills: M-to-M bridge between resources and taught skills
CREATE TABLE learning_resource_skills (
    resource_id BIGINT UNSIGNED NOT NULL,
    skill_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (resource_id, skill_id),
    INDEX idx_lrs_skill (skill_id),
    CONSTRAINT fk_lrs_resource FOREIGN KEY (resource_id) 
        REFERENCES learning_resources (resource_id) ON DELETE CASCADE,
    CONSTRAINT fk_lrs_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. learning_roadmaps: Personalized roadmap container for a career goal
CREATE TABLE learning_roadmaps (
    roadmap_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT UNSIGNED NOT NULL,
    career_role_id BIGINT UNSIGNED NOT NULL,
    roadmap_title VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'not_started',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rm_analysis (analysis_id),
    INDEX idx_rm_role (career_role_id),
    CONSTRAINT fk_rm_analysis FOREIGN KEY (analysis_id) 
        REFERENCES analysis_runs (analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_rm_role FOREIGN KEY (career_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. roadmap_steps: Sequential milestones within a roadmap
CREATE TABLE roadmap_steps (
    roadmap_step_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT UNSIGNED NOT NULL,
    skill_id BIGINT UNSIGNED NOT NULL,
    resource_id BIGINT UNSIGNED DEFAULT NULL,
    step_number INT UNSIGNED NOT NULL DEFAULT 1,
    expected_days INT UNSIGNED DEFAULT NULL,
    completion_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
    UNIQUE KEY uq_step_order (roadmap_id, step_number),
    INDEX idx_step_skill (skill_id),
    INDEX idx_step_resource (resource_id),
    CONSTRAINT fk_step_roadmap FOREIGN KEY (roadmap_id) 
        REFERENCES learning_roadmaps (roadmap_id) ON DELETE CASCADE,
    CONSTRAINT fk_step_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE RESTRICT,
    CONSTRAINT fk_step_resource FOREIGN KEY (resource_id) 
        REFERENCES learning_resources (resource_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Schema Creation Completed: 25 Tables Defined Successfully
-- =============================================================================
