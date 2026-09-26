import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CircleCheck,
  FileText,
  Search,
  BarChart3,
  Brain,
  UserRound,
  Upload,
  Target,
  LineChart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Award,
  Layers,
  ChevronRight,
  Users,
  Compass,
} from "lucide-react";

export default function Home() {
  return (
    <div className="home-container">
      {/* =====================================================
          HEADER / NAVBAR
      ===================================================== */}
      <header className="home-nav">
        <div className="nav-inner">
          {/* LOGO */}
          <Link to="/" className="home-logo">
            <div className="logo-icon-box">
              <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <div className="logo-text">
              Career<span>IQ</span>
            </div>
          </Link>

          {/* NAVIGATION LINKS */}
          <nav className="nav-menu">
            <a href="#hero" className="nav-item active">Home</a>
            <a href="#features" className="nav-item">Features</a>
            <a href="#how-it-works" className="nav-item">How It Works</a>
            <a href="#benefits" className="nav-item">Why CareerIQ</a>
          </nav>

          {/* RIGHT AUTH BUTTONS */}
          <div className="nav-actions">
            <Link to="/login" className="nav-btn-login">
              Login
            </Link>
            <Link to="/register" className="nav-btn-primary">
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section id="hero" className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="hero-bg-grid"></div>

        <div className="hero-content-wrapper">
          {/* LEFT HERO COLUMN */}
          <div className="hero-left">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>AI-Powered Career Intelligence</span>
              <span className="badge-pulse"></span>
            </div>

            <h1 className="hero-title">
              Build Your Career <br />
              <span className="text-gradient">With Intelligence.</span>
            </h1>

            <p className="hero-subtitle">
              Discover suitable career opportunities, understand your skill gaps,
              measure your career readiness, and get a personalized roadmap powered by AI.
            </p>

            {/* HERO CTA BUTTONS */}
            <div className="hero-cta-group">
              <Link to="/register" className="btn-hero-primary">
                <span>Get Started Free</span>
                <ArrowRight size={17} />
              </Link>
              <a href="#how-it-works" className="btn-hero-secondary">
                <span>How It Works</span>
              </a>
            </div>

            {/* MINI FEATURE PILLS */}
            <div className="hero-mini-features">
              <div className="mini-pill">
                <CheckCircle2 size={16} className="pill-icon" />
                <span>AI Skill Analysis</span>
              </div>
              <div className="mini-pill">
                <CheckCircle2 size={16} className="pill-icon" />
                <span>Smart Job Matching</span>
              </div>
              <div className="mini-pill">
                <CheckCircle2 size={16} className="pill-icon" />
                <span>Personalized Roadmap</span>
              </div>
            </div>
          </div>

          {/* RIGHT HERO COLUMN - INTERACTIVE PREVIEW CARD */}
          <div className="hero-right">
            <div className="hero-card-container">
              {/* Decorative floating badges */}
              <div className="floating-badge badge-top-right">
                <Zap size={14} className="icon-pulse" />
                <div>
                  <strong>AI Match Score</strong>
                  <span>94% Fit Identified</span>
                </div>
              </div>

              <div className="floating-badge badge-bottom-left">
                <TrendingUp size={14} />
                <div>
                  <strong>Market Demand</strong>
                  <span>+28% High Growth</span>
                </div>
              </div>

              {/* MAIN HERO CARD */}
              <div className="hero-card">
                {/* READINESS HEADER */}
                <div className="card-header-flex">
                  <div>
                    <span className="card-sub-label">Career Readiness</span>
                    <div className="readiness-score-val">78%</div>
                  </div>
                  <div className="readiness-circle-badge">
                    <div className="circle-inner">78</div>
                  </div>
                </div>

                {/* TOP CAREER MATCH SECTION */}
                <div className="career-match-box">
                  <div className="match-title-row">
                    <Target size={15} className="match-icon" />
                    <span>Top Career Match</span>
                  </div>

                  <div className="match-role-row">
                    <strong className="role-title">Data Analyst</strong>
                    <div className="match-tag-container">
                      <span className="match-badge">89% Match</span>
                      <span className="match-sub-text">Excellent</span>
                    </div>
                  </div>
                </div>

                {/* SKILLS CHIP LIST */}
                <div className="skill-chips-row">
                  <span className="skill-chip">Python</span>
                  <span className="skill-chip">SQL</span>
                  <span className="skill-chip">Power BI</span>
                  <span className="skill-chip">Excel</span>
                  <span className="skill-chip more">+3 More</span>
                </div>

                {/* SKILL PROGRESS SECTION */}
                <div className="skill-progress-section">
                  <div className="progress-section-header">
                    <LineChart size={15} />
                    <span>Skill Progress</span>
                  </div>

                  <div className="skill-bar-item">
                    <div className="bar-info">
                      <span>Python</span>
                      <strong>95%</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill blue" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div className="skill-bar-item">
                    <div className="bar-info">
                      <span>SQL</span>
                      <strong>88%</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill cyan" style={{ width: "88%" }}></div>
                    </div>
                  </div>

                  <div className="skill-bar-item">
                    <div className="bar-info">
                      <span>Power BI</span>
                      <strong>78%</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill indigo" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM QUICK ACTION */}
                <div className="card-bottom-pill">
                  <Sparkles size={13} />
                  <span>Next recommendation: Complete Power BI Advanced Module</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS / IMPACT BAR (BRIDGES THE HERO GAP)
      ===================================================== */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Resumes Analyzed</div>
            <div className="stat-sub">Across 40+ Tech Disciplines</div>
          </div>
          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-number">94%</div>
            <div className="stat-label">Match Accuracy</div>
            <div className="stat-sub">Validated against live market data</div>
          </div>
          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Career Roadmaps</div>
            <div className="stat-sub">Curated step-by-step learning paths</div>
          </div>
          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-number">2.5x</div>
            <div className="stat-label">Faster Career Growth</div>
            <div className="stat-sub">From skill gap to job readiness</div>
          </div>
        </div>
      </section>

      {/* =====================================================
          POWERFUL FEATURES SECTION
      ===================================================== */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">POWERFUL FEATURES</div>
            <h2 className="section-title">
              Everything You Need to <br />
              <span className="text-gradient">Plan Your Career.</span>
            </h2>
            <p className="section-description">
              CareerIQ combines AI, resume analysis, and real-time job-market intelligence
              to help you make data-driven career choices.
            </p>
          </div>

          <div className="features-grid">
            {/* FEATURE 1 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-blue">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">Resume Analysis</h3>
              <p className="feature-text">
                Upload your resume and let advanced NLP extract skills, experience levels,
                and project depth within seconds.
              </p>
              <div className="feature-footer">
                <span>Instant extraction</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* FEATURE 2 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-indigo">
                <Search size={24} />
              </div>
              <h3 className="feature-title">AI Job Matching</h3>
              <p className="feature-text">
                Find optimal career matches tailored to your exact skillset, background,
                and target industry preferences.
              </p>
              <div className="feature-footer">
                <span>Smart ranking</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* FEATURE 3 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-purple">
                <BarChart3 size={24} />
              </div>
              <h3 className="feature-title">Skill Gap Analysis</h3>
              <p className="feature-text">
                Identify critical missing proficiencies and receive targeted suggestions
                to close the gap for your dream role.
              </p>
              <div className="feature-footer">
                <span>Direct gap map</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* FEATURE 4 */}
            <div className="feature-card">
              <div className="feature-icon-box icon-cyan">
                <Brain size={24} />
              </div>
              <h3 className="feature-title">Career Intelligence</h3>
              <p className="feature-text">
                Explore live industry trends, salary benchmarks, and demand shifts
                to stay ahead in a fast-moving job market.
              </p>
              <div className="feature-footer">
                <span>Market analytics</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS SECTION
      ===================================================== */}
      <section id="how-it-works" className="how-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">HOW IT WORKS</div>
            <h2 className="section-title">
              From Resume to <span className="text-gradient">Career Roadmap.</span>
            </h2>
            <p className="section-description">
              Four simple steps to transform your career trajectory with data and intelligence.
            </p>
          </div>

          <div className="steps-container">
            <div className="steps-connector-line"></div>

            <div className="steps-grid">
              {/* STEP 1 */}
              <div className="step-card">
                <div className="step-num-badge">01</div>
                <div className="step-icon-wrapper">
                  <UserRound size={22} />
                </div>
                <h3 className="step-title">Build Your Profile</h3>
                <p className="step-text">
                  Set up your student or professional profile with your career goals and aspirations.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="step-card">
                <div className="step-num-badge">02</div>
                <div className="step-icon-wrapper">
                  <Upload size={22} />
                </div>
                <h3 className="step-title">Upload Resume</h3>
                <p className="step-text">
                  Upload your CV in PDF or DOCX format for instant semantic parsing and evaluation.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="step-card">
                <div className="step-num-badge">03</div>
                <div className="step-icon-wrapper">
                  <Brain size={22} />
                </div>
                <h3 className="step-title">Analyze Your Career</h3>
                <p className="step-text">
                  Our AI measures your readiness score, validates match percentages, and maps gaps.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="step-card">
                <div className="step-num-badge">04</div>
                <div className="step-icon-wrapper">
                  <Target size={22} />
                </div>
                <h3 className="step-title">Get Your Roadmap</h3>
                <p className="step-text">
                  Receive step-by-step milestones, top learning resources, and simulator actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CAREERIQ / HIGHLIGHT SECTION
      ===================================================== */}
      <section id="benefits" className="benefits-section">
        <div className="section-container">
          <div className="benefits-grid-layout">
            <div className="benefits-left">
              <div className="section-badge">THE CAREERIQ ADVANTAGE</div>
              <h2 className="section-title text-left">
                Why Top Performers Choose <br />
                <span className="text-gradient">CareerIQ.</span>
              </h2>
              <p className="section-description text-left">
                Traditional career guidance is generic and outdated. CareerIQ utilizes
                continuous market telemetry and AI modeling to give you an unfair advantage.
              </p>

              <div className="benefit-list">
                <div className="benefit-row">
                  <div className="benefit-check">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Precision NLP Skill Extraction</strong>
                    <p>Detects hidden skills, libraries, frameworks, and domain expertise automatically.</p>
                  </div>
                </div>

                <div className="benefit-row">
                  <div className="benefit-check">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Interactive "What-If" Simulation</strong>
                    <p>Experiment with new certifications or skills to see your readiness surge in real time.</p>
                  </div>
                </div>

                <div className="benefit-row">
                  <div className="benefit-check">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Targeted Learning Resource Directory</strong>
                    <p>Curated documentation, courses, and tutorials linked directly to each gap node.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="benefits-right">
              <div className="simulation-preview-card">
                <div className="sim-header">
                  <div className="sim-pill">
                    <Sparkles size={13} />
                    <span>Real-time What-If Simulation</span>
                  </div>
                  <span className="sim-status">Live Dynamic Engine</span>
                </div>

                <div className="sim-body">
                  <div className="sim-stat-box">
                    <span className="sim-label">Target Role</span>
                    <strong className="sim-val">Full Stack AI Developer</strong>
                  </div>

                  <div className="sim-meter-box">
                    <div className="sim-meter-header">
                      <span>Simulated Career Readiness</span>
                      <strong className="text-green">+14% Growth (88%)</strong>
                    </div>
                    <div className="sim-bar-bg">
                      <div className="sim-bar-fill" style={{ width: "88%" }}></div>
                    </div>
                  </div>

                  <div className="sim-tags">
                    <div className="sim-tag active">✓ React & TypeScript (+5%)</div>
                    <div className="sim-tag active">✓ FastApi & Python (+6%)</div>
                    <div className="sim-tag pending">+ Vector Databases (+3%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CALL TO ACTION (CTA)
      ===================================================== */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <div className="cta-bg-glow"></div>
            <div className="cta-content">
              <div className="cta-badge">
                <GraduationCap size={16} />
                <span>Ready to level up?</span>
              </div>
              <h2 className="cta-title">
                Understand Your Career Path. <br />
                Start Your Journey Today.
              </h2>
              <p className="cta-description">
                Join thousands of students and professionals using CareerIQ to master their
                skills, beat the competition, and land their dream roles.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn-cta-primary">
                  <span>Get Started for Free</span>
                  <ArrowRight size={17} />
                </Link>
                <Link to="/dashboard" className="btn-cta-secondary">
                  <span>Explore Dashboard Preview</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="home-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="home-logo">
              <div className="logo-icon-box">
                <GraduationCap size={20} strokeWidth={2.5} />
              </div>
              <div className="logo-text">
                Career<span>IQ</span>
              </div>
            </div>
            <p className="footer-about">
              Empowering next-generation professionals with AI-driven skill gap intelligence,
              personalized roadmaps, and career matching.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/resume-analysis">Resume Analysis</Link>
              <Link to="/gap-analysis">Skill Gap Analyzer</Link>
              <Link to="/roadmap">Career Roadmap</Link>
            </div>

            <div className="footer-col">
              <h4>Intelligence</h4>
              <Link to="/job-matching">Job Matching</Link>
              <Link to="/market-intelligence">Market Trends</Link>
              <Link to="/simulation">What-If Simulator</Link>
              <Link to="/learning-resources">Learning Resources</Link>
            </div>

            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create Account</Link>
              <Link to="/profile">User Profile</Link>
              <Link to="/admin">Admin Portal</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 CareerIQ — AI Career Intelligence Platform. All rights reserved.</div>
          <div className="footer-status">
            <span className="status-dot"></span>
            <span>All AI systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}