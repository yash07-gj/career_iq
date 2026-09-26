-- =============================================================================
-- CareerIQ Database Specification — Seed Data Script
-- Populates Reference Datasets, Master Skills, Jobs, Learning Resources, 
-- and Sample Candidate Analysis Run for MySQL Workbench / CareerIQ Platform
-- =============================================================================

USE careeriq_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. MASTER SKILLS
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

-- 2. SKILL ALIASES
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

-- 3. CAREER ROLES
INSERT INTO career_roles (career_role_id, role_name, description, active_status) VALUES
(1, 'Data Analyst', 'Analyzes structured datasets, designs dashboards, and delivers actionable business insights.', 1),
(2, 'Business Analyst', 'Bridges business requirements with data solutions and process workflows.', 1),
(3, 'BI Analyst', 'Specializes in business intelligence reporting, ETL metrics, and enterprise dashboarding.', 1),
(4, 'Data Scientist', 'Applies statistical modeling, machine learning, and advanced algorithms to solve complex data challenges.', 1),
(5, 'Full Stack Python Developer', 'Develops full-stack applications using Python backends and modern JavaScript frontends.', 1);

-- 4. CAREER ROLE SKILLS
-- Data Analyst (Role 1)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(1, 2, 4, 1.30, 1), -- SQL (Level 4, High weight)
(1, 1, 3, 1.20, 1), -- Python (Level 3)
(1, 3, 3, 1.15, 0), -- Power BI
(1, 4, 4, 1.10, 1), -- Excel
(1, 5, 3, 1.05, 0), -- Pandas
(1, 13, 3, 1.00, 0), -- Data Visualization
(1, 14, 3, 0.90, 0); -- Communication

-- Business Analyst (Role 2)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(2, 4, 4, 1.30, 1), -- Excel
(2, 2, 3, 1.15, 1), -- SQL
(2, 3, 3, 1.10, 0), -- Power BI
(2, 14, 5, 1.25, 1), -- Communication
(2, 13, 3, 1.00, 0); -- Data Visualization

-- BI Analyst (Role 3)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(3, 3, 5, 1.35, 1), -- Power BI (Level 5)
(3, 2, 4, 1.25, 1), -- SQL
(3, 6, 4, 1.15, 0), -- Tableau
(3, 4, 4, 1.05, 0), -- Excel
(3, 12, 3, 1.00, 0); -- MySQL

-- Data Scientist (Role 4)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(4, 1, 4, 1.30, 1), -- Python
(4, 7, 4, 1.35, 1), -- Machine Learning
(4, 8, 4, 1.20, 1), -- Scikit-learn
(4, 9, 4, 1.25, 1), -- Statistics
(4, 5, 4, 1.15, 1), -- Pandas
(4, 2, 3, 1.05, 0); -- SQL

-- Full Stack Python Developer (Role 5)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(5, 1, 4, 1.30, 1), -- Python
(5, 10, 4, 1.25, 1), -- FastAPI
(5, 11, 4, 1.25, 1), -- React
(5, 12, 3, 1.10, 1), -- MySQL
(5, 15, 3, 1.00, 0); -- Git

-- 5. CURATED DUMMY JOBS
INSERT INTO jobs (job_id, career_role_id, job_title, company_name, location, work_mode, description, experience_requirement, is_demo_data, source) VALUES
(1, 1, 'Junior Data Analyst', 'Cognizant Solutions', 'Bangalore, India', 'Hybrid', 'Looking for an entry-level Data Analyst to build SQL queries, clean datasets, and prepare monthly executive dashboards.', '0-1 Years', 1, 'Campus Recruitment Drive'),
(2, 1, 'Associate Business Intelligence Analyst', 'Deloitte Digital', 'Hyderabad, India', 'Onsite', 'Design interactive Power BI and SQL dashboards for financial client reporting.', '0-2 Years', 1, 'Industry Dataset 2026'),
(3, 2, 'Business Operations Analyst', 'Accenture India', 'Pune, India', 'Hybrid', 'Perform requirements gathering, data modeling with Excel, and stakeholder presentations.', '1-3 Years', 1, 'Industry Dataset 2026'),
(4, 4, 'Junior Data Scientist', 'Fractal Analytics', 'Mumbai, India', 'Remote', 'Assist in building predictive machine learning pipelines, feature engineering with Pandas, and exploratory data analysis.', '0-2 Years', 1, 'Demo Portal Seed'),
(5, 5, 'Python Backend Engineer', 'Zomato Tech', 'Gurgaon, India', 'Hybrid', 'Develop robust RESTful microservices using Python FastAPI and MySQL databases.', '1-3 Years', 1, 'Demo Portal Seed');

-- 6. JOB SKILLS
-- Job 1 (Junior Data Analyst)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(1, 2, 3, 1.25, 1), -- SQL
(1, 1, 3, 1.15, 1), -- Python
(1, 4, 3, 1.10, 1), -- Excel
(1, 3, 2, 1.00, 0); -- Power BI

-- Job 2 (Associate BI Analyst)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(2, 3, 4, 1.30, 1), -- Power BI
(2, 2, 3, 1.20, 1), -- SQL
(2, 4, 3, 1.05, 0); -- Excel

-- Job 3 (Business Operations Analyst)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(3, 4, 4, 1.30, 1), -- Excel
(3, 14, 4, 1.20, 1), -- Communication
(3, 2, 2, 1.00, 0); -- SQL

-- Job 4 (Junior Data Scientist)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(4, 1, 4, 1.30, 1), -- Python
(4, 7, 3, 1.25, 1), -- Machine Learning
(4, 5, 3, 1.15, 1), -- Pandas
(4, 9, 3, 1.10, 0); -- Statistics

-- Job 5 (Python Backend Engineer)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(5, 1, 4, 1.30, 1), -- Python
(5, 10, 4, 1.30, 1), -- FastAPI
(5, 12, 3, 1.15, 1), -- MySQL
(5, 15, 3, 1.00, 0); -- Git

-- 7. LEARNING RESOURCES
INSERT INTO learning_resources (resource_id, title, provider, resource_type, url, duration_minutes, is_free, active_status) VALUES
(1, 'Power BI for Beginners: Zero to Hero Dashboarding', 'Microsoft Learn', 'course', 'https://learn.microsoft.com/power-bi', 360, 1, 1),
(2, 'Mastering SQL for Data Analytics and Database Engineering', 'Coursera', 'course', 'https://coursera.org/learn/sql-for-data-science', 480, 1, 1),
(3, 'Python for Data Analysis with Pandas & NumPy', 'FreeCodeCamp', 'video', 'https://youtube.com/watch?v=pandas-tutorial', 240, 1, 1),
(4, 'Applied Machine Learning in Python with Scikit-learn', 'Coursera', 'course', 'https://coursera.org/learn/applied-machine-learning', 600, 0, 1),
(5, 'Statistics and Probability Foundations for Data Science', 'Khan Academy', 'article', 'https://khanacademy.org/math/statistics-probability', 300, 1, 1),
(6, 'FastAPI - The Complete Python Web API Framework Guide', 'FastAPI Documentation', 'documentation', 'https://fastapi.tiangolo.com/tutorial/', 180, 1, 1);

-- 8. LEARNING RESOURCE SKILLS
INSERT INTO learning_resource_skills (resource_id, skill_id) VALUES
(1, 3), -- Power BI
(1, 13), -- Data Visualization
(2, 2), -- SQL
(2, 12), -- MySQL
(3, 1), -- Python
(3, 5), -- Pandas
(4, 7), -- Machine Learning
(4, 8), -- Scikit-learn
(5, 9), -- Statistics
(6, 1), -- Python
(6, 10); -- FastAPI

-- 9. SAMPLE CANDIDATE & PROFILE
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

-- 10. CANDIDATE SKILLS
INSERT INTO candidate_skills (candidate_skill_id, profile_id, skill_id, proficiency_level, experience_months, source, extraction_confidence) VALUES
(1, 1, 1, 4, 18, 'resume', 95.00), -- Python (Level 4, 95% confidence)
(2, 1, 2, 4, 14, 'resume', 88.00), -- SQL (Level 4, 88% confidence)
(3, 1, 4, 4, 24, 'resume', 92.00), -- Excel (Level 4)
(4, 1, 5, 3, 10, 'resume', 80.00), -- Pandas (Level 3)
(5, 1, 12, 3, 12, 'resume', 85.00), -- MySQL (Level 3)
(6, 1, 14, 4, 24, 'manual', 90.00), -- Communication (Level 4)
(7, 1, 15, 3, 12, 'resume', 75.00); -- Git (Level 3)

-- 11. SAMPLE ANALYSIS RUN
INSERT INTO analysis_runs (analysis_id, profile_id, resume_id, algorithm_version, status, started_at, completed_at) VALUES
(1, 1, 1, 'v1.0-tfidf-cosine', 'completed', NOW(), NOW());

-- 12. CAREER RECOMMENDATIONS
INSERT INTO career_recommendations (career_recommendation_id, analysis_id, career_role_id, match_percentage, recommendation_rank, summary_explanation) VALUES
(1, 1, 1, 89.00, 1, 'Strong match across SQL, Python, Excel, and Pandas data foundations.'),
(2, 1, 2, 82.00, 2, 'Good match with Excel, SQL, and communication competencies.'),
(3, 1, 3, 79.00, 3, 'High potential; requires Power BI mastery to achieve top match status.'),
(4, 1, 4, 65.00, 4, 'Foundational Python/SQL present; missing Scikit-learn and Machine Learning.');

-- 13. JOB MATCHES
INSERT INTO job_matches (job_match_id, analysis_id, job_id, match_percentage, match_rank, summary_explanation) VALUES
(1, 1, 1, 92.00, 1, 'Meets SQL and Python requirements for Junior Data Analyst position.'),
(2, 1, 2, 78.00, 2, 'Satisfies SQL/Excel requirements, needs Power BI advancement.');

-- 14. MATCH EXPLANATIONS (Explainable AI Factors)
INSERT INTO match_explanations (explanation_id, analysis_id, job_match_id, career_recommendation_id, skill_id, factor_type, contribution, explanation_text) VALUES
(1, 1, NULL, 1, 2, 'matched', 32.50, 'Candidate has Advanced SQL (Level 4), meeting mandatory role requirements (+32.5%).'),
(2, 1, NULL, 1, 1, 'matched', 28.00, 'Candidate possesses strong Python proficiency (Level 4) matching analytical scope (+28.0%).'),
(3, 1, NULL, 1, 3, 'missing', -11.00, 'Missing Power BI dashboarding expertise required for comprehensive reporting (-11.0%).');

-- 15. READINESS SCORES
INSERT INTO readiness_scores (readiness_score_id, analysis_id, career_role_id, overall_score, skills_score, education_score, experience_score, projects_score) VALUES
(1, 1, 1, 78.00, 84.00, 85.00, 65.00, 78.00);

-- 16. SKILL GAPS
INSERT INTO skill_gaps (skill_gap_id, analysis_id, career_role_id, skill_id, current_level, required_level, priority_score, status) VALUES
(1, 1, 1, 3, 0, 3, 85.00, 'missing'), -- Power BI (Priority 85, missing)
(2, 1, 1, 13, 1, 3, 70.00, 'weak');     -- Data Visualization (Priority 70, weak)

-- 17. LEARNING ROADMAP
INSERT INTO learning_roadmaps (roadmap_id, analysis_id, career_role_id, roadmap_title, status) VALUES
(1, 1, 1, 'Targeted 30-Day Data Analyst Readiness Acceleration Roadmap', 'in_progress');

-- 18. ROADMAP STEPS
INSERT INTO roadmap_steps (roadmap_step_id, roadmap_id, skill_id, resource_id, step_number, expected_days, completion_status) VALUES
(1, 1, 3, 1, 1, 10, 'in_progress'), -- Learn Power BI
(2, 1, 13, 1, 2, 7, 'not_started'), -- Master Data Visualization Principles
(3, 1, 5, 3, 3, 5, 'completed');     -- Review Advanced Pandas Transforms

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Seed Data Insertion Completed Successfully
-- =============================================================================
