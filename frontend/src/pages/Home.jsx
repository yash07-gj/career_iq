import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  FileText,
  Search,
  BarChart3,
  Brain,
  UserRound,
  Upload,
  Target,
  LineChart,
  TrendingUp,
  CheckCircle2,
  Zap,
  ChevronRight,
} from "lucide-react";
import "../styles/public.css";

const FEATURES = [
  {
    icon: FileText, tone: "c1", title: "Resume Analysis", foot: "Instant extraction",
    text: "Upload your resume and let advanced NLP extract skills, experience levels, and project depth within seconds.",
  },
  {
    icon: Search, tone: "c2", title: "AI Job Matching", foot: "Smart ranking",
    text: "Find optimal career matches tailored to your exact skillset, background, and target industry preferences.",
  },
  {
    icon: BarChart3, tone: "c3", title: "Skill Gap Analysis", foot: "Direct gap map",
    text: "Identify critical missing proficiencies and receive targeted suggestions to close the gap for your dream role.",
  },
  {
    icon: Brain, tone: "c4", title: "Career Intelligence", foot: "Market analytics",
    text: "Explore live industry trends, salary benchmarks, and demand shifts to stay ahead in a fast-moving job market.",
  },
];

const STEPS = [
  { num: "01", icon: UserRound, title: "Build Your Profile", text: "Set up your student or professional profile with your career goals and aspirations." },
  { num: "02", icon: Upload, title: "Upload Resume", text: "Upload your CV in PDF or DOCX format for instant semantic parsing and evaluation." },
  { num: "03", icon: Brain, title: "Analyze Your Career", text: "Our AI measures your readiness score, validates match percentages, and maps gaps." },
  { num: "04", icon: Target, title: "Get Your Roadmap", text: "Receive step-by-step milestones, top learning resources, and simulator actions." },
];

const BENEFITS = [
  { title: "Precision NLP Skill Extraction", text: "Detects hidden skills, libraries, frameworks, and domain expertise automatically." },
  { title: 'Interactive "What-If" Simulation', text: "Experiment with new certifications or skills to see your readiness surge in real time." },
  { title: "Targeted Learning Resource Directory", text: "Curated documentation, courses, and tutorials linked directly to each gap node." },
];

const STATS = [
  { num: "10,000+", label: "Resumes Analyzed", sub: "Across 40+ Tech Disciplines" },
  { num: "94%", label: "Match Accuracy", sub: "Validated against live market data" },
  { num: "500+", label: "Career Roadmaps", sub: "Curated step-by-step learning paths" },
  { num: "2.5x", label: "Faster Career Growth", sub: "From skill gap to job readiness" },
];

function Logo() {
  return (
    <Link to="/" className="lp-logo">
      <span className="lp-logo-mark"><GraduationCap size={20} strokeWidth={2.5} /></span>
      <span>Career<b>IQ</b></span>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="lp">
      {/* ================= NAVBAR ================= */}
      <header className="lp-nav">
        <div className="lp-nav-in">
          <Logo />
          <nav className="lp-nav-links" aria-label="Page sections">
            <a href="#hero">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#benefits">Why CareerIQ</a>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-nav-login">Login</Link>
            <Link to="/register" className="lp-btn primary small">
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="hero" className="lp-hero">
        <div className="lp-orb one" />
        <div className="lp-orb two" />
        <div className="lp-orb three" />
        <div className="lp-grid-bg" />

        <div className="lp-hero-in">
          <div className="lp-hero-left">
            <div className="lp-badge">
              <Sparkles size={14} />
              <span>AI-Powered Career Intelligence</span>
              <span className="lp-live-dot" />
            </div>

            <h1>
              Build Your Career <br />
              <span className="lp-grad-text">With Intelligence.</span>
            </h1>

            <p className="lp-hero-sub">
              Discover suitable career opportunities, understand your skill gaps,
              measure your career readiness, and get a personalized roadmap powered by AI.
            </p>

            <div className="lp-hero-cta">
              <Link to="/register" className="lp-btn primary">
                <span>Get Started Free</span>
                <ArrowRight size={17} />
              </Link>
              <a href="#how-it-works" className="lp-btn glass">
                <span>How It Works</span>
              </a>
            </div>

            <div className="lp-hero-pills">
              <span><CheckCircle2 size={15} /> AI Skill Analysis</span>
              <span><CheckCircle2 size={15} /> Smart Job Matching</span>
              <span><CheckCircle2 size={15} /> Personalized Roadmap</span>
            </div>
          </div>

          {/* Preview card */}
          <div className="lp-hero-right">
            <div className="lp-float tr lp-glass">
              <span className="ic"><Zap size={15} /></span>
              <div>
                <strong>AI Match Score</strong>
                <span>94% Fit Identified</span>
              </div>
            </div>

            <div className="lp-float bl lp-glass">
              <span className="ic"><TrendingUp size={15} /></span>
              <div>
                <strong>Market Demand</strong>
                <span>+28% High Growth</span>
              </div>
            </div>

            <div className="lp-preview lp-glass">
              <div className="lp-pv-head">
                <div>
                  <span className="lp-pv-label">Career Readiness</span>
                  <div className="lp-pv-big">78%</div>
                </div>
                <svg className="lp-ring" viewBox="0 0 100 100" role="img" aria-label="Career readiness 78">
                  <defs>
                    <linearGradient id="lpRingGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8fb0ff" />
                      <stop offset="100%" stopColor="#7ee0c3" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
                  <circle
                    className="arc" cx="50" cy="50" r="42" fill="none" stroke="url(#lpRingGrad)" strokeWidth="9"
                    strokeLinecap="round" strokeDasharray="264" strokeDashoffset="58" transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="57" textAnchor="middle" fontSize="22" fontWeight="800" fill="#ffffff">78</text>
                </svg>
              </div>

              <div className="lp-pv-match">
                <div>
                  <small><Target size={14} /> Top Career Match</small>
                  <strong>Data Analyst</strong>
                </div>
                <div className="lp-pv-tag">
                  <b>89% Match</b>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="lp-chips">
                <span>Python</span>
                <span>SQL</span>
                <span>Power BI</span>
                <span>Excel</span>
                <span className="more">+3 More</span>
              </div>

              <div className="lp-pv-bars">
                <div className="lp-pv-bars-title"><LineChart size={15} /> Skill Progress</div>
                {[["Python", 95, "a"], ["SQL", 88, "b"], ["Power BI", 78, "c"]].map(([name, val, tone]) => (
                  <div key={name}>
                    <div className="lp-bar-info"><span>{name}</span><strong>{val}%</strong></div>
                    <div className="lp-bar-track"><div className={`lp-bar-fill ${tone}`} style={{ width: `${val}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="lp-pv-next">
                <Sparkles size={14} />
                <span>Next recommendation: Complete Power BI Advanced Module</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <div className="lp-stats-wrap">
        <div className="lp-stats">
          {STATS.map((s) => (
            <div className="lp-stat" key={s.label}>
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
              <div className="lp-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">POWERFUL FEATURES</span>
            <h2>
              Everything You Need to <br />
              <span className="lp-accent">Plan Your Career.</span>
            </h2>
            <p>
              CareerIQ combines AI, resume analysis, and real-time job-market intelligence
              to help you make data-driven career choices.
            </p>
          </div>

          <div className="lp-features">
            {FEATURES.map(({ icon: Icon, tone, title, text, foot }) => (
              <div className="lp-feature" key={title}>
                <div className={`lp-feature-ic ${tone}`}><Icon size={24} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="lp-feature-foot">
                  <span>{foot}</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="lp-section alt">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">HOW IT WORKS</span>
            <h2>
              From Resume to <span className="lp-accent">Career Roadmap.</span>
            </h2>
            <p>Four simple steps to transform your career trajectory with data and intelligence.</p>
          </div>

          <div className="lp-steps">
            {STEPS.map(({ num, icon: Icon, title, text }) => (
              <div className="lp-step" key={num}>
                <div className="lp-step-ic">
                  <Icon size={24} />
                  <span className="lp-step-num">{num}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CAREERIQ ================= */}
      <section id="benefits" className="lp-section">
        <div className="lp-container lp-benefits">
          <div>
            <div className="lp-head left">
              <span className="lp-eyebrow">THE CAREERIQ ADVANTAGE</span>
              <h2>
                Why Top Performers Choose <br />
                <span className="lp-accent">CareerIQ.</span>
              </h2>
              <p>
                Traditional career guidance is generic and outdated. CareerIQ utilizes
                continuous market telemetry and AI modeling to give you an unfair advantage.
              </p>
            </div>

            <div className="lp-benefit-list">
              {BENEFITS.map((b) => (
                <div className="lp-benefit" key={b.title}>
                  <div className="lp-benefit-ic"><CheckCircle2 size={18} /></div>
                  <div>
                    <strong>{b.title}</strong>
                    <p>{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-sim">
            <div className="lp-orb two" style={{ width: 280, height: 280, bottom: -120, right: -80 }} />
            <div className="lp-sim-head">
              <span className="lp-sim-pill"><Sparkles size={13} /> Real-time What-If Simulation</span>
              <span className="lp-sim-status"><span className="lp-live-dot" /> Live Dynamic Engine</span>
            </div>

            <div className="lp-sim-box">
              <span>Target Role</span>
              <strong>Full Stack AI Developer</strong>
            </div>

            <div>
              <div className="lp-sim-meter-head">
                <span>Simulated Career Readiness</span>
                <strong>+14% Growth (88%)</strong>
              </div>
              <div className="lp-sim-track"><div className="lp-sim-fill" style={{ width: "88%" }} /></div>
            </div>

            <div className="lp-sim-tags">
              <div className="lp-sim-tag on">✓ React & TypeScript (+5%)</div>
              <div className="lp-sim-tag on">✓ FastApi & Python (+6%)</div>
              <div className="lp-sim-tag off">+ Vector Databases (+3%)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="lp-container">
        <div className="lp-cta">
          <div className="lp-orb one" style={{ top: -180, left: "10%" }} />
          <div className="lp-orb two" style={{ bottom: -200, right: "5%" }} />
          <div className="lp-grid-bg" />
          <div className="lp-cta-in">
            <span className="lp-badge">
              <GraduationCap size={15} />
              <span>Ready to level up?</span>
            </span>
            <h2>
              Understand Your Career Path. <br />
              Start Your Journey Today.
            </h2>
            <p>
              Join thousands of students and professionals using CareerIQ to master their
              skills, beat the competition, and land their dream roles.
            </p>
            <div className="lp-cta-actions">
              <Link to="/register" className="lp-btn primary">
                <span>Get Started for Free</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/dashboard" className="lp-btn glass">
                <span>Explore Dashboard Preview</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div>
              <Logo />
              <p className="lp-footer-about">
                Empowering next-generation professionals with AI-driven skill gap intelligence,
                personalized roadmaps, and career matching.
              </p>
            </div>

            <div className="lp-footer-cols">
              <div className="lp-footer-col">
                <h4>Platform</h4>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/resume-analysis">Resume Analysis</Link>
                <Link to="/gap-analysis">Skill Gap Analyzer</Link>
                <Link to="/roadmap">Career Roadmap</Link>
              </div>
              <div className="lp-footer-col">
                <h4>Intelligence</h4>
                <Link to="/job-matching">Job Matching</Link>
                <Link to="/market-intelligence">Market Trends</Link>
                <Link to="/simulation">What-If Simulator</Link>
                <Link to="/learning-resources">Learning Resources</Link>
              </div>
              <div className="lp-footer-col">
                <h4>Account</h4>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Create Account</Link>
                <Link to="/profile">User Profile</Link>
                <Link to="/admin">Admin Portal</Link>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div>© 2026 CareerIQ — AI Career Intelligence Platform. All rights reserved.</div>
            <div className="lp-footer-status">
              <span className="lp-live-dot" />
              <span>All AI systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
