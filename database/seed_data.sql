-- =============================================================================
-- CareerIQ Database — Extended Seed Data Script (Aligned with Page 9 of Design Guide)
-- 10-15+ Realistic Dummy Records per Table for Comprehensive Testing & MCA Evaluation
-- Storage Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

USE careeriq_db;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. MASTER SKILLS (20 Skills)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE skills;
INSERT INTO skills (skill_id, skill_name, normalized_name, description, active_status) VALUES
(1, 'Python', 'python', 'General-purpose programming language for data analytics, scripting, and backend', 1),
(2, 'SQL', 'sql', 'Structured Query Language for querying and managing relational databases', 1),
(3, 'Power BI', 'power_bi', 'Interactive business intelligence and data dashboard platform by Microsoft', 1),
(4, 'Excel', 'excel', 'Spreadsheet tool for data analysis, pivot tables, VLOOKUP, and financial modeling', 1),
(5, 'Pandas', 'pandas', 'Python library for fast data manipulation, cleaning, and structured data analysis', 1),
(6, 'Tableau', 'tableau', 'Visual analytics platform used for enterprise reporting and business intelligence', 1),
(7, 'Machine Learning', 'machine_learning', 'Predictive modeling, supervised/unsupervised algorithms, and feature engineering', 1),
(8, 'Scikit-learn', 'scikit_learn', 'Python machine learning toolkit for classification, regression, and clustering', 1),
(9, 'Statistics', 'statistics', 'Mathematical foundations, hypothesis testing, probability, and inferential metrics', 1),
(10, 'Data Visualization', 'data_visualization', 'Communicating quantitative data through charts, plots, and visual storytelling', 1),
(11, 'Communication', 'communication', 'Presenting analytical insights and technical findings to business stakeholders', 1),
(12, 'Problem Solving', 'problem_solving', 'Structured analytical problem-solving and business workflow optimization', 1),
(13, 'MySQL', 'mysql', 'Open-source relational database management system', 1),
(14, 'FastAPI', 'fastapi', 'Modern, fast web framework for building RESTful APIs with Python', 1),
(15, 'React', 'react', 'JavaScript library for creating modern interactive user interfaces', 1),
(16, 'Git', 'git', 'Distributed version control system for tracking source code changes', 1),
(17, 'ETL & Data Cleaning', 'etl_data_cleaning', 'Extract, transform, load pipelines and data preprocessing workflows', 1),
(18, 'Data Modeling', 'data_modeling', 'Designing logical and physical database schemas and star/snowflake schemas', 1),
(19, 'Deep Learning', 'deep_learning', 'Neural networks, PyTorch, and TensorFlow for complex pattern recognition', 1),
(20, 'AWS Cloud Basics', 'aws_cloud_basics', 'Cloud storage, S3, EC2, and cloud-hosted data pipelines', 1);

-- -----------------------------------------------------------------------------
-- 2. SKILL ALIASES (18 Aliases)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE skill_aliases;
INSERT INTO skill_aliases (alias_id, skill_id, alias_name, normalized_alias) VALUES
(1, 1, 'Python3', 'python3'),
(2, 1, 'Python Programming', 'python_programming'),
(3, 1, 'Py', 'py'),
(4, 2, 'Structured Query Language', 'structured_query_language'),
(5, 2, 'MySQL Queries', 'mysql_queries'),
(6, 2, 'PostgreSQL', 'postgresql'),
(7, 3, 'PowerBI', 'powerbi'),
(8, 3, 'Microsoft Power BI', 'microsoft_power_bi'),
(9, 4, 'MS Excel', 'ms_excel'),
(10, 4, 'Advanced Excel', 'advanced_excel'),
(11, 4, 'Spreadsheets', 'spreadsheets'),
(12, 7, 'ML', 'ml'),
(13, 7, 'Applied ML', 'applied_ml'),
(14, 8, 'sklearn', 'sklearn'),
(15, 9, 'Statistical Analysis', 'statistical_analysis'),
(16, 10, 'Data Viz', 'data_viz'),
(17, 14, 'FastAPI Python', 'fastapi_python'),
(18, 15, 'ReactJS', 'reactjs');

-- -----------------------------------------------------------------------------
-- 3. CAREER ROLES (Aligned with Page 9 of Design Guide)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE career_roles;
INSERT INTO career_roles (career_role_id, role_name, description, active_status) VALUES
(1, 'Data Analyst', 'Analyzes structured datasets, designs dashboards, and delivers actionable business insights.', 1),
(2, 'Business Analyst', 'Bridges business requirements with data solutions, reporting workflows, and communication.', 1),
(3, 'BI Analyst', 'Specializes in business intelligence reporting, ETL metrics, Power BI/Tableau, and enterprise dashboarding.', 1),
(4, 'Junior Data Scientist', 'Applies statistical modeling, machine learning, and advanced algorithms to solve predictive data challenges.', 1),
(5, 'Machine Learning Engineer', 'Deploys, monitors, and optimizes scalable machine learning pipelines and models in production.', 1);

-- -----------------------------------------------------------------------------
-- 4. CAREER ROLE SKILLS (Mandatory & Weighted Skill Rules)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE career_role_skills;
-- 1. Data Analyst (Page 9: SQL, Excel, Python, Pandas, Statistics, Data Visualization)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(1, 2, 4, 1.30, 1), -- SQL (Required Level 4, Mandatory)
(1, 4, 4, 1.25, 1), -- Excel (Required Level 4, Mandatory)
(1, 1, 3, 1.20, 1), -- Python (Required Level 3, Mandatory)
(1, 5, 3, 1.15, 0), -- Pandas
(1, 9, 3, 1.10, 0), -- Statistics
(1, 10, 3, 1.05, 0), -- Data Visualization
(1, 3, 2, 1.00, 0); -- Power BI

-- 2. Business Analyst (Page 9: Excel, SQL, Power BI, Communication, Problem Solving)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(2, 4, 4, 1.35, 1), -- Excel (Mandatory)
(2, 11, 4, 1.30, 1), -- Communication (Mandatory)
(2, 12, 4, 1.25, 1), -- Problem Solving (Mandatory)
(2, 2, 3, 1.20, 1), -- SQL (Mandatory)
(2, 3, 3, 1.15, 0), -- Power BI
(2, 10, 3, 1.00, 0); -- Data Visualization

-- 3. BI Analyst (Page 9: SQL, Power BI, Tableau, Excel, Data Visualization)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(3, 3, 4, 1.35, 1), -- Power BI (Mandatory)
(3, 2, 4, 1.30, 1), -- SQL (Mandatory)
(3, 6, 3, 1.20, 0), -- Tableau
(3, 4, 4, 1.15, 1), -- Excel (Mandatory)
(3, 10, 4, 1.10, 0), -- Data Visualization
(3, 17, 3, 1.05, 0); -- ETL & Data Cleaning

-- 4. Junior Data Scientist (Page 9: Python, SQL, Pandas, Statistics, Machine Learning, Scikit-learn)
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(4, 1, 4, 1.35, 1), -- Python (Mandatory)
(4, 5, 4, 1.30, 1), -- Pandas (Mandatory)
(4, 7, 3, 1.30, 1), -- Machine Learning (Mandatory)
(4, 9, 4, 1.25, 1), -- Statistics (Mandatory)
(4, 8, 3, 1.20, 0), -- Scikit-learn
(4, 2, 3, 1.10, 0), -- SQL
(4, 10, 3, 1.00, 0); -- Data Visualization

-- 5. Machine Learning Engineer
INSERT INTO career_role_skills (career_role_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(5, 1, 4, 1.35, 1), -- Python
(5, 7, 4, 1.35, 1), -- Machine Learning
(5, 8, 4, 1.25, 1), -- Scikit-learn
(5, 14, 3, 1.20, 0), -- FastAPI
(5, 16, 3, 1.10, 0); -- Git

-- -----------------------------------------------------------------------------
-- 5. CURATED DUMMY JOBS (12 Jobs — Exactly includes 8 from Page 9 Table)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE jobs;
INSERT INTO jobs (job_id, career_role_id, job_title, company_name, location, work_mode, description, experience_requirement, is_demo_data, source) VALUES
-- 8 Official Jobs from Page 9 Table:
(1, 1, 'Junior Data Analyst', 'Insight Analytics Pvt Ltd', 'Bangalore, India', 'Hybrid', 'Perform structured data extraction using SQL, build automated reporting spreadsheets with Excel, and prepare monthly stakeholder summaries.', '0-1 Years', 1, 'MCA Curated Dataset 2026'),
(2, 1, 'Data Analyst Intern', 'DataSphere Solutions', 'Pune, India', 'Hybrid', 'Assist senior analysts in cleaning CSV/JSON datasets using Python Pandas and designing interactive BI dashboards.', '0-1 Years', 1, 'MCA Curated Dataset 2026'),
(3, 2, 'Business Analyst Trainee', 'Nexa Consulting', 'Mumbai, India', 'Onsite', 'Collaborate with client teams to document business requirements, develop Excel workflow models, and present analytical findings.', '0-2 Years', 1, 'MCA Curated Dataset 2026'),
(4, 3, 'Junior BI Analyst', 'Vision Metrics', 'Hyderabad, India', 'Onsite', 'Design, build, and deploy enterprise Power BI reports, maintain SQL views, and optimize automated visual KPIs.', '0-2 Years', 1, 'MCA Curated Dataset 2026'),
(5, 3, 'Reporting Analyst', 'Alpha Systems', 'Chennai, India', 'Hybrid', 'Generate operational and financial reports using Excel and SQL queries. Experience with Tableau or Power BI is preferred.', '1-2 Years', 1, 'MCA Curated Dataset 2026'),
(6, 4, 'Data Science Intern', 'AI Labs India', 'Bangalore, India', 'Remote', 'Implement exploratory data analysis (EDA), statistical hypothesis tests, and preliminary baseline models with Scikit-learn.', '0-1 Years', 1, 'MCA Curated Dataset 2026'),
(7, 4, 'Junior Data Scientist', 'PredictiveWorks', 'Noida, India', 'Remote', 'Develop predictive classification and regression models in Python, preprocess datasets using Pandas, and evaluate metrics.', '1-2 Years', 1, 'MCA Curated Dataset 2026'),
(8, 2, 'MIS Executive', 'SmartOps Pvt Ltd', 'Ahmedabad, India', 'Onsite', 'Maintain daily management information system reports, create pivot tables, and present operational summaries to leadership.', '0-2 Years', 1, 'MCA Curated Dataset 2026'),

-- Additional 4 Realistic Supplementary Jobs for rich filtering:
(9, 1, 'Associate Analytics Consultant', 'Quantiphi Analytics', 'Bangalore, India', 'Hybrid', 'Build business dashboards and query SQL data lakes to uncover customer retention patterns.', '1-2 Years', 1, 'Campus Recruitment Drive'),
(10, 3, 'Business Intelligence Specialist', 'InfoEdge India', 'Noida, India', 'Hybrid', 'Lead Power BI dashboard initiatives, design star-schema data models, and streamline SQL reporting.', '1-3 Years', 1, 'Industry Dataset 2026'),
(11, 4, 'Machine Learning Associate', 'ZS Associates', 'Pune, India', 'Hybrid', 'Build healthcare analytics pipelines using Python, Pandas, statistical modeling, and ML classification algorithms.', '0-2 Years', 1, 'Industry Dataset 2026'),
(12, 5, 'AI / ML Engineer Trainee', 'Mu Sigma Inc', 'Bangalore, India', 'Onsite', 'Deploy Python-based machine learning models, build RESTful API inference wrappers, and maintain Git codebases.', '0-2 Years', 1, 'Campus Recruitment Drive');

-- -----------------------------------------------------------------------------
-- 6. JOB SKILLS (Requirements mapped to all 12 Jobs)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE job_skills;
-- Job 1: Junior Data Analyst (Insight Analytics)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(1, 2, 3, 1.30, 1), -- SQL
(1, 4, 3, 1.25, 1), -- Excel
(1, 1, 2, 1.15, 0), -- Python
(1, 10, 2, 1.00, 0); -- Data Visualization

-- Job 2: Data Analyst Intern (DataSphere Solutions)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(2, 1, 3, 1.30, 1), -- Python
(2, 5, 3, 1.25, 1), -- Pandas
(2, 2, 2, 1.15, 0), -- SQL
(2, 4, 2, 1.00, 0); -- Excel

-- Job 3: Business Analyst Trainee (Nexa Consulting)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(3, 4, 4, 1.35, 1), -- Excel
(3, 11, 4, 1.30, 1), -- Communication
(3, 12, 3, 1.20, 1), -- Problem Solving
(3, 2, 2, 1.05, 0); -- SQL

-- Job 4: Junior BI Analyst (Vision Metrics)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(4, 3, 4, 1.35, 1), -- Power BI
(4, 2, 3, 1.25, 1), -- SQL
(4, 10, 3, 1.15, 0); -- Data Visualization

-- Job 5: Reporting Analyst (Alpha Systems)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(5, 4, 4, 1.30, 1), -- Excel
(5, 2, 3, 1.25, 1), -- SQL
(5, 6, 2, 1.10, 0); -- Tableau

-- Job 6: Data Science Intern (AI Labs India)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(6, 1, 3, 1.35, 1), -- Python
(6, 5, 3, 1.25, 1), -- Pandas
(6, 9, 3, 1.20, 1), -- Statistics
(6, 8, 2, 1.10, 0); -- Scikit-learn

-- Job 7: Junior Data Scientist (PredictiveWorks)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(7, 1, 4, 1.35, 1), -- Python
(7, 7, 3, 1.30, 1), -- Machine Learning
(7, 8, 3, 1.25, 1), -- Scikit-learn
(7, 5, 3, 1.15, 0); -- Pandas

-- Job 8: MIS Executive (SmartOps Pvt Ltd)
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(8, 4, 4, 1.35, 1), -- Excel
(8, 11, 3, 1.20, 1), -- Communication
(8, 2, 2, 1.10, 0); -- SQL

-- Job 9: Quantiphi Analytics
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(9, 2, 4, 1.30, 1), (9, 1, 3, 1.20, 1), (9, 10, 3, 1.10, 0);

-- Job 10: InfoEdge India
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(10, 3, 4, 1.35, 1), (10, 2, 4, 1.25, 1), (10, 18, 3, 1.15, 0);

-- Job 11: ZS Associates
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(11, 1, 4, 1.30, 1), (11, 7, 3, 1.25, 1), (11, 9, 3, 1.20, 0);

-- Job 12: Mu Sigma Inc
INSERT INTO job_skills (job_id, skill_id, required_level, importance_weight, mandatory_flag) VALUES
(12, 1, 4, 1.30, 1), (12, 7, 3, 1.25, 1), (12, 16, 3, 1.10, 0);

-- -----------------------------------------------------------------------------
-- 7. LEARNING RESOURCES (12 High-Quality Curated Resources)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE learning_resources;
INSERT INTO learning_resources (resource_id, title, provider, resource_type, url, duration_minutes, is_free, active_status) VALUES
(1, 'Power BI for Beginners: Zero to Hero Dashboarding', 'Microsoft Learn', 'course', 'https://learn.microsoft.com/power-bi', 360, 1, 1),
(2, 'Mastering SQL for Data Analytics and Database Engineering', 'Coursera', 'course', 'https://coursera.org/learn/sql-for-data-science', 480, 1, 1),
(3, 'Python for Data Analysis with Pandas & NumPy', 'FreeCodeCamp', 'video', 'https://youtube.com/watch?v=pandas-tutorial', 240, 1, 1),
(4, 'Applied Machine Learning in Python with Scikit-learn', 'Coursera', 'course', 'https://coursera.org/learn/applied-machine-learning', 600, 0, 1),
(5, 'Statistics and Probability Foundations for Data Science', 'Khan Academy', 'article', 'https://khanacademy.org/math/statistics-probability', 300, 1, 1),
(6, 'Tableau Desktop Essential Training for Analysts', 'LinkedIn Learning', 'course', 'https://linkedin.com/learning/tableau-essential-training', 300, 0, 1),
(7, 'Advanced Excel for Business & Data Analysis', 'Coursera', 'course', 'https://coursera.org/learn/excel-analytics', 360, 1, 1),
(8, 'Data Visualization Masterclass: Storytelling with Charts', 'YouTube', 'video', 'https://youtube.com/watch?v=dataviz-masterclass', 180, 1, 1),
(9, 'FastAPI - The Complete Python Web API Framework Guide', 'FastAPI Documentation', 'documentation', 'https://fastapi.tiangolo.com/tutorial/', 180, 1, 1),
(10, 'Git & GitHub Complete Workflow Guide for Developers', 'FreeCodeCamp', 'video', 'https://youtube.com/watch?v=git-guide', 120, 1, 1),
(11, 'Business Analyst Problem Solving Frameworks & Case Studies', 'Udemy', 'course', 'https://udemy.com/course/business-analyst-toolkit', 420, 0, 1),
(12, 'Effective Communication & Presentation for Technical Analysts', 'Coursera', 'course', 'https://coursera.org/learn/tech-communication', 240, 1, 1);

-- -----------------------------------------------------------------------------
-- 8. LEARNING RESOURCE SKILLS MAPPING
-- -----------------------------------------------------------------------------
TRUNCATE TABLE learning_resource_skills;
INSERT INTO learning_resource_skills (resource_id, skill_id) VALUES
(1, 3), -- Resource 1 -> Power BI
(1, 10), -- Resource 1 -> Data Visualization
(2, 2), -- Resource 2 -> SQL
(2, 13), -- Resource 2 -> MySQL
(3, 1), -- Resource 3 -> Python
(3, 5), -- Resource 3 -> Pandas
(4, 7), -- Resource 4 -> Machine Learning
(4, 8), -- Resource 4 -> Scikit-learn
(5, 9), -- Resource 5 -> Statistics
(6, 6), -- Resource 6 -> Tableau
(6, 10), -- Resource 6 -> Data Visualization
(7, 4), -- Resource 7 -> Excel
(8, 10), -- Resource 8 -> Data Visualization
(9, 1), -- Resource 9 -> Python
(9, 14), -- Resource 9 -> FastAPI
(10, 16), -- Resource 10 -> Git
(11, 12), -- Resource 11 -> Problem Solving
(12, 11); -- Resource 12 -> Communication

-- -----------------------------------------------------------------------------
-- 9. SAMPLE CANDIDATES & USERS (4 Users)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE users;
INSERT INTO users (user_id, full_name, email, password_hash, account_role, active_status) VALUES
(1, 'John Doe', 'john.doe@example.com', '$2b$12$e8x/0bB0e1u9aZ18GjPqe.EXAMPLE_PASSWORD_HASH', 'candidate', 1),
(2, 'Priya Sharma', 'priya.sharma@example.com', '$2b$12$e8x/0bB0e1u9aZ18GjPqe.EXAMPLE_PASSWORD_HASH', 'candidate', 1),
(3, 'Rahul Verma', 'rahul.verma@example.com', '$2b$12$e8x/0bB0e1u9aZ18GjPqe.EXAMPLE_PASSWORD_HASH', 'candidate', 1),
(4, 'Admin Manager', 'admin@careeriq.com', '$2b$12$e8x/0bB0e1u9aZ18GjPqe.EXAMPLE_ADMIN_HASH', 'admin', 1);

TRUNCATE TABLE candidate_profiles;
INSERT INTO candidate_profiles (profile_id, user_id, phone, city, linkedin_url, portfolio_url, profile_summary) VALUES
(1, 1, '+91 98765 43210', 'Pune, India', 'https://linkedin.com/in/johndoe', 'https://github.com/johndoe', 'MCA final-year student specializing in Data Analytics and Python scripting. Strong knowledge of SQL, Excel, and Pandas with internship experience.'),
(2, 2, '+91 98111 22334', 'Bangalore, India', 'https://linkedin.com/in/priyasharma', 'https://github.com/priyasharma', 'Aspiring Business Analyst with a strong background in stakeholder communication, advanced Excel modeling, and Power BI dashboards.'),
(3, 3, '+91 97222 33445', 'Hyderabad, India', 'https://linkedin.com/in/rahulverma', 'https://github.com/rahulverma', 'Computer Science graduate passionate about predictive machine learning, statistical modeling, and data science.');

TRUNCATE TABLE candidate_preferences;
INSERT INTO candidate_preferences (preference_id, profile_id, target_role_id, preferred_location, work_mode, expected_salary, salary_currency) VALUES
(1, 1, 1, 'Pune / Bangalore', 'Hybrid', 650000.00, 'INR'),
(2, 2, 2, 'Bangalore / Mumbai', 'Hybrid', 720000.00, 'INR'),
(3, 3, 4, 'Hyderabad / Remote', 'Remote', 850000.00, 'INR');

TRUNCATE TABLE education;
INSERT INTO education (education_id, profile_id, degree, college, specialization, score, score_type, start_year, end_year) VALUES
(1, 1, 'Master of Computer Applications (MCA)', 'Pune University', 'Data Engineering & Software Systems', 8.60, 'CGPA', 2024, 2026),
(2, 1, 'Bachelor of Computer Science (BCS)', 'Pune University', 'Computer Science', 82.50, 'Percentage', 2021, 2024),
(3, 2, 'Master of Business Administration (MBA)', 'Symbiosis Institute', 'Business Analytics & IT', 8.40, 'CGPA', 2024, 2026),
(4, 3, 'Bachelor of Technology (B.Tech)', 'JNTU Hyderabad', 'Computer Science & AI', 8.90, 'CGPA', 2022, 2026);

TRUNCATE TABLE experience;
INSERT INTO experience (experience_id, profile_id, company, designation, start_date, end_date, is_current, description) VALUES
(1, 1, 'DataSphere Solutions', 'Data Analyst Intern', '2026-01-15', '2026-06-30', 0, 'Built SQL reporting queries, cleaned CSV customer transaction tables with Pandas, and automated weekly summary sheets.'),
(2, 2, 'Nexa Consulting', 'Business Analyst Intern', '2025-06-01', '2025-12-15', 0, 'Drafted business requirement documents (BRD), mapped user stories, and built Excel KPI tracking models.'),
(3, 3, 'AI Labs India', 'Data Science Research Intern', '2025-08-01', '2026-02-28', 0, 'Prepared exploratory data analysis scripts, trained baseline linear/logistic regression models, and evaluated accuracy metrics.');

TRUNCATE TABLE projects;
INSERT INTO projects (project_id, profile_id, project_title, description, github_url, live_url, technologies, start_date, end_date) VALUES
(1, 1, 'E-Commerce Sales Performance Dashboard', 'Processed 50,000+ retail records to compute sales volume, churn rates, and category revenue.', 'https://github.com/johndoe/sales-dashboard', 'https://sales-dashboard.demo', 'Python, Pandas, SQL, Excel', '2025-08-01', '2025-11-30'),
(2, 2, 'Healthcare Patient Wait-Time Optimization', 'Analyzed hospital admission bottlenecks and produced executive Excel summaries.', 'https://github.com/priyasharma/wait-time-analysis', 'https://healthcare-analytics.demo', 'Excel, Power BI, Communication', '2025-09-01', '2025-12-20'),
(3, 3, 'Customer Churn Prediction Model', 'Developed a classification model predicting customer cancellations with 88% precision.', 'https://github.com/rahulverma/churn-ml', 'https://churn-predictor.demo', 'Python, Pandas, Scikit-learn, Statistics', '2025-10-01', '2026-01-15');

TRUNCATE TABLE certifications;
INSERT INTO certifications (certification_id, profile_id, certificate_name, issuer, issue_date, credential_url) VALUES
(1, 1, 'Google Data Analytics Professional Certificate', 'Coursera / Google', '2025-12-10', 'https://coursera.org/verify/SAMPLE123'),
(2, 2, 'Microsoft Certified: Power BI Data Analyst Associate', 'Microsoft', '2025-11-20', 'https://learn.microsoft.com/credentials/PL300'),
(3, 3, 'Machine Learning Specialization by Andrew Ng', 'DeepLearning.AI / Coursera', '2026-01-05', 'https://coursera.org/verify/MLNG2026');

TRUNCATE TABLE resumes;
INSERT INTO resumes (resume_id, profile_id, file_name, storage_path, extracted_text, parser_status) VALUES
(1, 1, 'John_Doe_MCA_Resume.pdf', '/uploads/resumes/john_doe_resume_2026.pdf', 'John Doe - MCA Graduate. Skills: Python, SQL, Excel, Pandas, MySQL, Git, Data Analysis, Communication. Experience: Data Analyst Intern at DataSphere Solutions.', 'success'),
(2, 2, 'Priya_Sharma_MBA_Resume.pdf', '/uploads/resumes/priya_sharma_resume_2026.pdf', 'Priya Sharma - MBA Business Analytics. Skills: Excel, SQL, Power BI, Communication, Problem Solving, Data Visualization. Experience: Business Analyst Intern at Nexa Consulting.', 'success'),
(3, 3, 'Rahul_Verma_AI_Resume.pdf', '/uploads/resumes/rahul_verma_resume_2026.pdf', 'Rahul Verma - B.Tech CS AI. Skills: Python, SQL, Pandas, Statistics, Machine Learning, Scikit-learn, Deep Learning, Git. Experience: Data Science Intern at AI Labs India.', 'success');

-- -----------------------------------------------------------------------------
-- 10. CANDIDATE SKILLS (Verified Skill Inventory for Candidates)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE candidate_skills;
-- Candidate 1 (John Doe - Targeted at Data Analyst)
INSERT INTO candidate_skills (candidate_skill_id, profile_id, skill_id, proficiency_level, experience_months, source, extraction_confidence) VALUES
(1, 1, 1, 4, 18, 'resume', 95.00), -- Python (Level 4, 95%)
(2, 1, 2, 4, 14, 'resume', 88.00), -- SQL (Level 4, 88%)
(3, 1, 4, 4, 24, 'resume', 92.00), -- Excel (Level 4, 92%)
(4, 1, 5, 3, 10, 'resume', 80.00), -- Pandas (Level 3, 80%)
(5, 1, 13, 3, 12, 'resume', 85.00), -- MySQL (Level 3)
(6, 1, 11, 4, 24, 'manual', 90.00), -- Communication (Level 4)
(7, 1, 16, 3, 12, 'resume', 75.00); -- Git (Level 3)

-- Candidate 2 (Priya Sharma - Targeted at Business Analyst)
INSERT INTO candidate_skills (candidate_skill_id, profile_id, skill_id, proficiency_level, experience_months, source, extraction_confidence) VALUES
(8, 2, 4, 5, 28, 'resume', 96.00),  -- Excel (Level 5)
(9, 2, 11, 5, 30, 'manual', 95.00), -- Communication (Level 5)
(10, 2, 12, 4, 20, 'manual', 90.00),-- Problem Solving (Level 4)
(11, 2, 2, 3, 12, 'resume', 82.00), -- SQL (Level 3)
(12, 2, 3, 4, 18, 'resume', 89.00), -- Power BI (Level 4)
(13, 2, 10, 3, 14, 'resume', 84.00);-- Data Visualization (Level 3)

-- Candidate 3 (Rahul Verma - Targeted at Junior Data Scientist)
INSERT INTO candidate_skills (candidate_skill_id, profile_id, skill_id, proficiency_level, experience_months, source, extraction_confidence) VALUES
(14, 3, 1, 5, 24, 'resume', 98.00), -- Python (Level 5)
(15, 3, 5, 4, 18, 'resume', 92.00), -- Pandas (Level 4)
(16, 3, 9, 4, 20, 'resume', 90.00), -- Statistics (Level 4)
(17, 3, 7, 4, 16, 'resume', 88.00), -- Machine Learning (Level 4)
(18, 3, 8, 4, 14, 'resume', 86.00), -- Scikit-learn (Level 4)
(19, 3, 2, 3, 12, 'resume', 80.00); -- SQL (Level 3)

-- -----------------------------------------------------------------------------
-- 11. SAMPLE ANALYSIS RUNS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE analysis_runs;
INSERT INTO analysis_runs (analysis_id, profile_id, resume_id, algorithm_version, status, started_at, completed_at) VALUES
(1, 1, 1, 'v1.0-explainable-weighted', 'completed', NOW(), NOW()),
(2, 2, 2, 'v1.0-explainable-weighted', 'completed', NOW(), NOW()),
(3, 3, 3, 'v1.0-explainable-weighted', 'completed', NOW(), NOW());

-- -----------------------------------------------------------------------------
-- 12. CAREER RECOMMENDATIONS (Ranked with Explanations)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE career_recommendations;
-- For Candidate 1 (John Doe)
INSERT INTO career_recommendations (career_recommendation_id, analysis_id, career_role_id, match_percentage, recommendation_rank, summary_explanation) VALUES
(1, 1, 1, 89.00, 1, 'Top alignment with SQL, Excel, Python, and Pandas data foundations.'),
(2, 1, 2, 82.00, 2, 'Strong match with Excel, SQL, and communication competencies.'),
(3, 1, 3, 79.00, 3, 'High potential; requires Power BI mastery to achieve top match score.'),
(4, 1, 4, 65.00, 4, 'Foundational Python/SQL present; missing Scikit-learn and Machine Learning.');

-- For Candidate 2 (Priya Sharma)
INSERT INTO career_recommendations (career_recommendation_id, analysis_id, career_role_id, match_percentage, recommendation_rank, summary_explanation) VALUES
(5, 2, 2, 94.00, 1, 'Exceptional fit across Excel, Communication, Problem Solving, SQL, and Power BI.'),
(6, 2, 3, 88.00, 2, 'High competency in Power BI, SQL, and Excel reporting.'),
(7, 2, 1, 84.00, 3, 'Solid data analytics foundation; add Python for advanced analytical workflows.');

-- For Candidate 3 (Rahul Verma)
INSERT INTO career_recommendations (career_recommendation_id, analysis_id, career_role_id, match_percentage, recommendation_rank, summary_explanation) VALUES
(8, 3, 4, 93.00, 1, 'Superb alignment with Python, Pandas, Statistics, and Scikit-learn ML toolchains.'),
(9, 3, 5, 87.00, 2, 'Strong Machine Learning skills; add FastAPI deployment wrappers.'),
(10, 3, 1, 82.00, 3, 'Exceeds analytical requirements for traditional Data Analyst roles.');

-- -----------------------------------------------------------------------------
-- 13. JOB MATCHES (Ranked Curated Jobs)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE job_matches;
-- For Candidate 1
INSERT INTO job_matches (job_match_id, analysis_id, job_id, match_percentage, match_rank, summary_explanation) VALUES
(1, 1, 1, 92.00, 1, 'Meets SQL and Excel requirements for Junior Data Analyst at Insight Analytics.'),
(2, 1, 2, 88.00, 2, 'Satisfies Python and Pandas requirements for Data Analyst Intern at DataSphere Solutions.'),
(3, 1, 3, 80.00, 3, 'Good match for Business Analyst Trainee at Nexa Consulting.');

-- -----------------------------------------------------------------------------
-- 14. MATCH EXPLANATIONS (Explainable AI Factors)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE match_explanations;
INSERT INTO match_explanations (explanation_id, analysis_id, job_match_id, career_recommendation_id, skill_id, factor_type, contribution, explanation_text) VALUES
(1, 1, NULL, 1, 2, 'matched', 32.50, 'Candidate has Advanced SQL (Level 4), satisfying mandatory role requirement (+32.5%).'),
(2, 1, NULL, 1, 1, 'matched', 28.00, 'Candidate possesses strong Python proficiency (Level 4) matching analytical scope (+28.0%).'),
(3, 1, NULL, 1, 4, 'matched', 25.00, 'Advanced Excel proficiency (Level 4) provides rapid operational reporting readiness (+25.0%).'),
(4, 1, NULL, 1, 3, 'missing', -11.00, 'Missing Power BI dashboarding expertise required for comprehensive reporting (-11.0%).');

-- -----------------------------------------------------------------------------
-- 15. READINESS SCORES (Multi-Pillar Preparation Scores)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE readiness_scores;
INSERT INTO readiness_scores (readiness_score_id, analysis_id, career_role_id, overall_score, skills_score, education_score, experience_score, projects_score) VALUES
(1, 1, 1, 78.00, 84.00, 86.00, 65.00, 78.00),
(2, 2, 2, 92.00, 94.00, 88.00, 85.00, 90.00),
(3, 3, 4, 90.00, 93.00, 89.00, 82.00, 91.00);

-- -----------------------------------------------------------------------------
-- 16. SKILL GAPS (Missing & Weak Skills)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE skill_gaps;
INSERT INTO skill_gaps (skill_gap_id, analysis_id, career_role_id, skill_id, current_level, required_level, priority_score, status) VALUES
(1, 1, 1, 3, 0, 3, 85.00, 'missing'), -- Power BI (Priority 85, missing)
(2, 1, 1, 10, 1, 3, 70.00, 'weak'),    -- Data Visualization (Priority 70, weak)
(3, 1, 1, 9, 1, 3, 65.00, 'weak');     -- Statistics (Priority 65, weak)

-- -----------------------------------------------------------------------------
-- 17. LEARNING ROADMAPS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE learning_roadmaps;
INSERT INTO learning_roadmaps (roadmap_id, analysis_id, career_role_id, roadmap_title, status) VALUES
(1, 1, 1, 'Targeted 30-Day Data Analyst Readiness Acceleration Roadmap', 'in_progress'),
(2, 2, 2, '21-Day Business Intelligence Leadership Roadmap', 'not_started'),
(3, 3, 4, '45-Day Machine Learning Production Mastery Roadmap', 'in_progress');

-- -----------------------------------------------------------------------------
-- 18. ROADMAP STEPS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE roadmap_steps;
INSERT INTO roadmap_steps (roadmap_step_id, roadmap_id, skill_id, resource_id, step_number, expected_days, completion_status) VALUES
(1, 1, 3, 1, 1, 10, 'in_progress'), -- Step 1: Learn Power BI (Resource 1: Microsoft Learn)
(2, 1, 10, 8, 2, 7, 'not_started'), -- Step 2: Data Visualization Masterclass (Resource 8: YouTube)
(3, 1, 9, 5, 3, 8, 'not_started'),  -- Step 3: Statistics Foundations (Resource 5: Khan Academy)
(4, 1, 5, 3, 4, 5, 'completed');    -- Step 4: Python Pandas Data Cleaning (Resource 3: FreeCodeCamp)

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Extended Seed Data Insertion Completed Successfully
-- =============================================================================
