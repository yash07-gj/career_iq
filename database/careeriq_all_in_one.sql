-- =============================================================================
-- CareerIQ Database — Single-File Complete Schema & Seed Data
-- 25 Tables + Comprehensive Initial Datasets
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Ready for MySQL Workbench / MySQL Server 8.0+
-- =============================================================================

DROP DATABASE IF EXISTS careeriq_db;
CREATE DATABASE careeriq_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE careeriq_db;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- MODULE 1: CANDIDATE PROFILE (8 TABLES)
-- =============================================================================

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

CREATE TABLE skills (
    skill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(150) NOT NULL,
    normalized_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    active_status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE skill_aliases (
    alias_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT UNSIGNED NOT NULL,
    alias_name VARCHAR(150) NOT NULL UNIQUE,
    normalized_alias VARCHAR(150) NOT NULL,
    INDEX idx_alias_skill (skill_id),
    CONSTRAINT fk_alias_skill FOREIGN KEY (skill_id) 
        REFERENCES skills (skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE career_roles (
    career_role_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    active_status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE candidate_preferences
    ADD CONSTRAINT fk_pref_career_role FOREIGN KEY (target_role_id) 
        REFERENCES career_roles (career_role_id) ON DELETE SET NULL;

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

-- =============================================================================
-- SEED DATA INSERTION
-- =============================================================================

-- Master Skills
INSERT INTO skills (skill_id, skill_name, normalized_name, description, active_status) VALUES
(1, 'Python', 'python', 'General-purpose programming language for data science and backend', 1),
(2, 'SQL', 'sql', 'Structured Query Language for database management and querying', 1),
(3, 'Power BI', 'power_bi', 'Business analytics and data visualization tool by Microsoft', 1),
(4, 'Excel', 'excel', 'Spreadsheet tool for data analysis, pivot tables, and modeling', 1),
(5, 'Pandas', 'pandas', 'Python library for data manipulation and analysis', 1),
(6, 'Tableau', 'tableau', 'Interactive data visualization software for BI', 1),
(7, 'Machine Learning', 'machine_learning', 'Algorithms and statistical models for predictive analytics', 1),
(8, 'Scikit-learn', 'scikit_learn', 'Python machine learning library for classification and regression', 1),
(9, 'Statistics', 'statistics', 'Mathematical foundations for data inference and probability', 1),
(10, 'FastAPI', 'fastapi', 'Modern, high-performance web framework for Python APIs', 1),
(11, 'React', 'react', 'JavaScript library for building responsive user interfaces', 1),
(12, 'MySQL', 'mysql', 'Relational database management system', 1),
(13, 'Data Visualization', 'data_visualization', 'Visual representation of data and insights', 1),
(14, 'Communication', 'communication', 'Verbal and written articulation of analytical insights', 1),
(15, 'Git', 'git', 'Distributed version control system for code management', 1);

-- Skill Aliases
INSERT INTO skill_aliases (alias_id, skill_id, alias_name, normalized_alias) VALUES
(1, 1, 'Python3', 'python3'),
(2, 1, 'Python Programming', 'python_programming'),
(3, 2, 'Structured Query Language', 'structured_query_language'),
(4, 2, 'MySQL Queries', 'mysql_queries'),
(5, 3, 'PowerBI', 'powerbi'),
(6, 3, 'Microsoft Power BI', 'microsoft_power_bi'),
(7, 4, 'MS Excel', 'ms_excel'),
(8, 4, 'Advanced Excel', 'advanced_excel'),
(9, 7, 'ML', 'ml'),
(10, 8, 'sklearn', 'sklearn'),
(11, 10, 'FastAPI Python', 'fastapi_python'),
(12, 11, 'React.js', 'react_js'),
(13, 11, 'ReactJS', 'reactjs');

-- Career Roles
INSERT INTO career_roles (career_role_id, role_name, description, active_status) VALUES
(1, 'Data Analyst', 'Analyzes structured datasets, designs dashboards, and delivers actionable business insights.', 1),
(2, 'Business Analyst', 'Bridges business requirements with data solutions and process workflows.', 1),
(3, 'BI Analyst', 'Specializes in business intelligence reporting, ETL metrics, and enterprise dashboarding.', 1),
(4, 'Data Scientist', 'Applies statistical modeling, machine learning, and advanced algorithms to solve complex data challenges.', 1),
(5, 'Full Stack Python Developer', 'Develops full-stack applications using Python backends and modern JavaScript frontends.', 1);

-- Career Role Skills
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(1, 2, 4, 1.30, 1), (1, 1, 3, 1.20, 1), (1, 3, 3, 1.15, 0), (1, 4, 4, 1.10, 1), (1, 5, 3, 1.05, 0), (1, 13, 3, 1.00, 0), (1, 14, 3, 0.90, 0),
(2, 4, 4, 1.30, 1), (2, 2, 3, 1.15, 1), (2, 3, 3, 1.10, 0), (2, 14, 5, 1.25, 1), (2, 13, 3, 1.00, 0),
(3, 3, 5, 1.35, 1), (3, 2, 4, 1.25, 1), (3, 6, 4, 1.15, 0), (3, 4, 4, 1.05, 0), (3, 12, 3, 1.00, 0),
(4, 1, 4, 1.30, 1), (4, 7, 4, 1.35, 1), (4, 8, 4, 1.20, 1), (4, 9, 4, 1.25, 1), (4, 5, 4, 1.15, 1), (4, 2, 3, 1.05, 0),
(5, 1, 4, 1.30, 1), (5, 10, 4, 1.25, 1), (5, 11, 4, 1.25, 1), (5, 12, 3, 1.10, 1), (5, 15, 3, 1.00, 0);

-- Curated Dummy Jobs
INSERT INTO jobs (job_id, career_role_id, job_title, company_name, location, work_mode, description, experience_requirement, is_demo_data, source) VALUES
(1, 1, 'Junior Data Analyst', 'Cognizant Solutions', 'Bangalore, India', 'Hybrid', 'Looking for an entry-level Data Analyst to build SQL queries, clean datasets, and prepare monthly executive dashboards.', '0-1 Years', 1, 'Campus Recruitment Drive'),
(2, 1, 'Associate Business Intelligence Analyst', 'Deloitte Digital', 'Hyderabad, India', 'Onsite', 'Design interactive Power BI and SQL dashboards for financial client reporting.', '0-2 Years', 1, 'Industry Dataset 2026'),
(3, 2, 'Business Operations Analyst', 'Accenture India', 'Pune, India', 'Hybrid', 'Perform requirements gathering, data modeling with Excel, and stakeholder presentations.', '1-3 Years', 1, 'Industry Dataset 2026'),
(4, 4, 'Junior Data Scientist', 'Fractal Analytics', 'Mumbai, India', 'Remote', 'Assist in building predictive machine learning pipelines, feature engineering with Pandas, and exploratory data analysis.', '0-2 Years', 1, 'Demo Portal Seed'),
(5, 5, 'Python Backend Engineer', 'Zomato Tech', 'Gurgaon, India', 'Hybrid', 'Develop robust RESTful microservices using Python FastAPI and MySQL databases.', '1-3 Years', 1, 'Demo Portal Seed');

-- Job Skills
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(1, 2, 3, 1.25, 1), (1, 1, 3, 1.15, 1), (1, 4, 3, 1.10, 1), (1, 3, 2, 1.00, 0),
(2, 3, 4, 1.30, 1), (2, 2, 3, 1.20, 1), (2, 4, 3, 1.05, 0),
(3, 4, 4, 1.30, 1), (3, 14, 4, 1.20, 1), (3, 2, 2, 1.00, 0),
(4, 1, 4, 1.30, 1), (4, 7, 3, 1.25, 1), (4, 5, 3, 1.15, 1), (4, 9, 3, 1.10, 0),
(5, 1, 4, 1.30, 1), (5, 10, 4, 1.30, 1), (5, 12, 3, 1.15, 1), (5, 15, 3, 1.00, 0);

-- Learning Resources
INSERT INTO learning_resources (resource_id, title, provider, resource_type, url, duration_minutes, is_free, active_status) VALUES
(1, 'Power BI for Beginners: Zero to Hero Dashboarding', 'Microsoft Learn', 'course', 'https://learn.microsoft.com/power-bi', 360, 1, 1),
(2, 'Mastering SQL for Data Analytics and Database Engineering', 'Coursera', 'course', 'https://coursera.org/learn/sql-for-data-science', 480, 1, 1),
(3, 'Python for Data Analysis with Pandas & NumPy', 'FreeCodeCamp', 'video', 'https://youtube.com/watch?v=pandas-tutorial', 240, 1, 1),
(4, 'Applied Machine Learning in Python with Scikit-learn', 'Coursera', 'course', 'https://coursera.org/learn/applied-machine-learning', 600, 0, 1),
(5, 'Statistics and Probability Foundations for Data Science', 'Khan Academy', 'article', 'https://khanacademy.org/math/statistics-probability', 300, 1, 1),
(6, 'FastAPI - The Complete Python Web API Framework Guide', 'FastAPI Documentation', 'documentation', 'https://fastapi.tiangolo.com/tutorial/', 180, 1, 1);

-- Learning Resource Skills
INSERT INTO learning_resource_skills (resource_id, skill_id) VALUES
(1, 3), (1, 13), (2, 2), (2, 12), (3, 1), (3, 5), (4, 7), (4, 8), (5, 9), (6, 1), (6, 10);

-- Sample Users & Profile
INSERT INTO users (user_id, full_name, email, password_hash, account_role, active_status) VALUES
(1, 'John Doe', 'john.doe@example.com', '$2b$12$e8x/0bB0e1u9aZ18GjPqe.EXAMPLE_PASSWORD_HASH', 'candidate', 1),
(2, 'Admin Manager', 'admin@careeriq.com', '$2b$12$e8x/0bB0e1u9aZ18GjPqe.EXAMPLE_ADMIN_HASH', 'admin', 1);

INSERT INTO candidate_profiles (profile_id, user_id, phone, city, linkedin_url, portfolio_url, profile_summary) VALUES
(1, 1, '+91 98765 43210', 'Pune, India', 'https://linkedin.com/in/johndoe', 'https://github.com/johndoe', 'Aspiring Data Analyst with foundational Python, SQL, and Excel knowledge. Eager to solve business problems with data.');

INSERT INTO candidate_preferences (preference_id, profile_id, target_role_id, preferred_location, work_mode, expected_salary, salary_currency) VALUES
(1, 1, 1, 'Pune / Bangalore', 'Hybrid', 650000.00, 'INR');

INSERT INTO education (education_id, profile_id, degree, college, specialization, score, score_type, start_year, end_year) VALUES
(1, 1, 'Master of Computer Applications (MCA)', 'Pune University', 'Data Engineering & Software Systems', 8.60, 'CGPA', 2024, 2026),
(2, 1, 'Bachelor of Computer Science (BCS)', 'Pune University', 'Computer Science', 82.50, 'Percentage', 2021, 2024);

INSERT INTO experience (experience_id, profile_id, company, designation, start_date, end_date, is_current, description) VALUES
(1, 1, 'InnoTech Solutions', 'Data Analyst Intern', '2026-01-15', '2026-06-30', 0, 'Built SQL reporting queries, analyzed customer retention metrics, and created automated weekly summary sheets.');

INSERT INTO projects (project_id, profile_id, project_title, description, github_url, live_url, technologies, start_date, end_date) VALUES
(1, 1, 'E-Commerce Sales Performance Dashboard', 'Processed 50,000+ customer transactions to compute revenue trends and churn analysis.', 'https://github.com/johndoe/sales-dashboard', 'https://sales-dashboard.demo', 'Python, Pandas, SQL, Excel', '2025-08-01', '2025-11-30');

INSERT INTO certifications (certification_id, profile_id, certificate_name, issuer, issue_date, credential_url) VALUES
(1, 1, 'Google Data Analytics Professional Certificate', 'Coursera / Google', '2025-12-10', 'https://coursera.org/verify/SAMPLE123');

INSERT INTO resumes (resume_id, profile_id, file_name, storage_path, extracted_text, parser_status) VALUES
(1, 1, 'John_Doe_MCA_Resume.pdf', '/uploads/resumes/john_doe_resume_2026.pdf', 'John Doe - MCA Graduate. Skills: Python, SQL, Excel, Pandas, MySQL, Git, Data Analysis, Communication. Experience: Data Analyst Intern at InnoTech Solutions.', 'success');

-- Candidate Skills
INSERT INTO candidate_skills (candidate_skill_id, profile_id, skill_id, proficiency_level, experience_months, source, extraction_confidence) VALUES
(1, 1, 1, 4, 18, 'resume', 95.00),
(2, 1, 2, 4, 14, 'resume', 88.00),
(3, 1, 4, 4, 24, 'resume', 92.00),
(4, 1, 5, 3, 10, 'resume', 80.00),
(5, 1, 12, 3, 12, 'resume', 85.00),
(6, 1, 14, 4, 24, 'manual', 90.00),
(7, 1, 15, 3, 12, 'resume', 75.00);

-- Analysis Run & Results
INSERT INTO analysis_runs (analysis_id, profile_id, resume_id, algorithm_version, status, started_at, completed_at) VALUES
(1, 1, 1, 'v1.0-tfidf-cosine', 'completed', NOW(), NOW());

INSERT INTO career_recommendations (career_recommendation_id, analysis_id, career_role_id, match_percentage, recommendation_rank, summary_explanation) VALUES
(1, 1, 1, 89.00, 1, 'Strong match across SQL, Python, Excel, and Pandas data foundations.'),
(2, 1, 2, 82.00, 2, 'Good match with Excel, SQL, and communication competencies.'),
(3, 1, 3, 79.00, 3, 'High potential; requires Power BI mastery to achieve top match status.'),
(4, 1, 4, 65.00, 4, 'Foundational Python/SQL present; missing Scikit-learn and Machine Learning.');

INSERT INTO job_matches (job_match_id, analysis_id, job_id, match_percentage, match_rank, summary_explanation) VALUES
(1, 1, 1, 92.00, 1, 'Meets SQL and Python requirements for Junior Data Analyst position.'),
(2, 1, 2, 78.00, 2, 'Satisfies SQL/Excel requirements, needs Power BI advancement.');

INSERT INTO match_explanations (explanation_id, analysis_id, job_match_id, career_recommendation_id, skill_id, factor_type, contribution, explanation_text) VALUES
(1, 1, NULL, 1, 2, 'matched', 32.50, 'Candidate has Advanced SQL (Level 4), meeting mandatory role requirements (+32.5%).'),
(2, 1, NULL, 1, 1, 'matched', 28.00, 'Candidate possesses strong Python proficiency (Level 4) matching analytical scope (+28.0%).'),
(3, 1, NULL, 1, 3, 'missing', -11.00, 'Missing Power BI dashboarding expertise required for comprehensive reporting (-11.0%).');

INSERT INTO readiness_scores (readiness_score_id, analysis_id, career_role_id, overall_score, skills_score, education_score, experience_score, projects_score) VALUES
(1, 1, 1, 78.00, 84.00, 85.00, 65.00, 78.00);

INSERT INTO skill_gaps (skill_gap_id, analysis_id, career_role_id, skill_id, current_level, required_level, priority_score, status) VALUES
(1, 1, 1, 3, 0, 3, 85.00, 'missing'),
(2, 1, 1, 13, 1, 3, 70.00, 'weak');

INSERT INTO learning_roadmaps (roadmap_id, analysis_id, career_role_id, roadmap_title, status) VALUES
(1, 1, 1, 'Targeted 30-Day Data Analyst Readiness Acceleration Roadmap', 'in_progress');

INSERT INTO roadmap_steps (roadmap_step_id, roadmap_id, skill_id, resource_id, step_number, expected_days, completion_status) VALUES
(1, 1, 3, 1, 1, 10, 'in_progress'),
(2, 1, 13, 1, 2, 7, 'not_started'),
(3, 1, 5, 3, 3, 5, 'completed');

SET FOREIGN_KEY_CHECKS = 1;
