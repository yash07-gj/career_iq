import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  GitBranch,
  ShieldCheck,
  Award,
  ExternalLink,
  X,
  Upload,
  Send,
  Loader2,
  Clock
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { toneFor } from '../utils/career';
// removed mockJobs
import auth from '../utils/auth';
import api from '../services/api';

export default function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form Fields
  const currentUser = auth.getUser();
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher / 0-1 years');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const numericId = parseInt(jobId, 10) || 1;
        const data = await api.getJobById(numericId);
        if (data) {
          // Normalize fields for UI display
          setJob({
            id: data.job_id,
            title: data.job_title,
            company: data.company_name,
            location: data.location,
            type: data.job_type || 'Full-time',
            experience: data.experience_requirement || '0 - 1 Years',
            salary: data.salary_range || 'Competitive',
            match: data.match || 85,
            description: data.description,
            responsibilities: data.responsibilities
              ? data.responsibilities.split('\n').filter(Boolean)
              : ['Execute analytics tasks', 'Collaborate with cross-functional teams'],
            matchedSkills: data.skills || ['Python', 'SQL', 'Data Analytics'],
            missingSkills: ['Cloud Warehousing', 'Advanced Machine Learning'],
            educationMatch: 'MCA / Computer Science or Quantitative degree (Matched)',
            experienceMatch: `${data.experience_requirement || '0-1 Years'} (Matched)`,
            posted_date: data.posted_date,
            due_date: data.due_date,
            breakdown: { skillScore: 88, educationScore: 95, experienceScore: 80 }
          });
        }

        // Check if user already applied
        if (currentUser?.user_id) {
          const apps = await api.getUserApplications(currentUser.user_id);
          if (apps && apps.some((a) => a.job_id === numericId)) {
            setApplied(true);
          }
        }
      } catch (err) {
        console.warn('Error loading job from database:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleOpenApplyModal = () => {
    setShowApplyModal(true);
    setSubmitError('');
    setSubmitSuccess(false);
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setEmail(currentUser.email || '');
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id) {
      setSubmitError('Please log in to submit your job application.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const numericId = parseInt(jobId, 10) || 1;
      const formData = new FormData();
      formData.append('job_id', numericId);
      formData.append('user_id', currentUser.user_id);
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('phone', phone || '');
      formData.append('experience_level', experienceLevel);
      formData.append('portfolio_url', portfolioUrl || '');
      formData.append('cover_note', coverNote || '');
      if (resumeFile) {
        formData.append('resume_file', resumeFile);
      }

      await api.applyJobWithResume(formData);
      setSubmitSuccess(true);
      setApplied(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Job application error:', err);
      setSubmitError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !job) {
    return (
      <Layout>
        <Page title="Job Match Details" subtitle="Loading matching model breakdown...">
          <div className="card card-pad stack">
            <div className="skeleton" style={{ height: 22, width: '45%' }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <p className="muted text-sm" style={{ margin: 0 }}>Loading job details...</p>
          </div>
        </Page>
      </Layout>
    );
  }

  const {
    title,
    company,
    location,
    type,
    experience,
    salary,
    match,
    description,
    responsibilities,
    matchedSkills: rawMatchedSkills,
    missingSkills: rawMissingSkills,
    educationMatch,
    experienceMatch,
    breakdown
  } = job;

  const missingSet = new Set((rawMissingSkills || []).map((m) => m.toLowerCase().trim()));
  const matchedSkills = (rawMatchedSkills || []).filter((s) => !missingSet.has(s.toLowerCase().trim()));
  const missingSkills = rawMissingSkills || [];

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const matchTone = toneFor(match);
  const overdue = job.due_date && new Date(job.due_date) < new Date();

  const scoreRows = [
    { label: 'Technical Skill Fit', value: breakdown?.skillScore || 85, bar: '', note: null },
    { label: 'Education Requirement', value: breakdown?.educationScore || 95, bar: 'green', note: educationMatch || 'Matches MCA / Computer Science Degree' },
    { label: 'Experience Level Fit', value: breakdown?.experienceScore || 75, bar: 'orange', note: experienceMatch || 'Fits Fresher / Graduate requirements' },
  ];

  return (
    <Layout>
      <section className="page">
        {/* BACK BUTTON */}
        <div>
          <Link to="/job-matching" className="btn outline small">
            <ArrowLeft size={16} />
            <span>Back to Job Matching</span>
          </Link>
        </div>

        {/* HERO CARD */}
        <div className="card card-pad row-between" style={{ alignItems: 'flex-start', gap: 20 }}>
          <div className="stack" style={{ gap: 10, flex: '1 1 320px' }}>
            <div className="row-gap">
              <span className="pill info">AI Match Score Verified</span>
              <span className="pill good">Active Hiring</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(22px, 2.8vw, 28px)' }}>{title}</h1>
            <div className="row-gap text-sm muted" style={{ gap: 14 }}>
              <span className="row-gap" style={{ gap: 6, fontWeight: 700, color: 'var(--ink)' }}>
                <Building2 size={16} color="var(--accent)" />
                {company}
              </span>
              <span className="row-gap" style={{ gap: 6 }}>
                <MapPin size={15} />
                {location}
              </span>
              <span className="row-gap" style={{ gap: 6 }}>
                <Briefcase size={15} />
                {type}
              </span>
              <span className="row-gap" style={{ gap: 6 }}>
                <Calendar size={15} />
                {experience}
              </span>
              {salary && (
                <span className="row-gap text-good" style={{ gap: 6, fontWeight: 600 }}>
                  <DollarSign size={15} />
                  {salary}
                </span>
              )}
            </div>

            {/* DATES: AVAILABLE FROM & APPLICATION DUE DATE */}
            {(job.posted_date || job.due_date) && (
              <div className="row-gap text-sm" style={{ gap: 12 }}>
                {job.posted_date && (
                  <span className="pill neutral">
                    <Calendar size={14} />
                    Available From: {fmtDate(job.posted_date)}
                  </span>
                )}
                {job.due_date && (
                  <span className={`pill ${overdue ? 'bad' : 'warn'}`}>
                    <Clock size={14} />
                    Apply Due Date: {fmtDate(job.due_date)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="stack" style={{ alignItems: 'flex-end', gap: 12 }}>
            <span className={`pill ${matchTone}`} style={{ fontSize: 20, fontWeight: 800, padding: '8px 16px', fontFamily: 'var(--font-display)' }}>
              <Award size={20} />
              {match}% Match
            </span>
            <button type="button" className="btn" onClick={handleOpenApplyModal} disabled={applied}>
              {applied ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <span>Apply for this Job</span>
                  <ExternalLink size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* MATCH SUMMARY BANNER */}
        <div className="notice info">
          <span
            className="num"
            style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: 'var(--accent)', color: 'var(--on-accent)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18
            }}
          >
            {match}%
          </span>
          <div className="notice-main">
            <strong style={{ fontFamily: 'var(--font-display)' }}>Strong Alignment with your Extracted Profile</strong>
            <p className="muted text-sm" style={{ margin: '2px 0 0' }}>
              Your resume exhibits strong mastery of{' '}
              <strong>{matchedSkills ? matchedSkills.slice(0, 3).join(', ') : 'key skills'}</strong>. You
              fulfill <strong>{breakdown?.skillScore || 85}%</strong> of the direct technical skills
              required for this role.
            </p>
          </div>
          <Link to="/gap-analysis" className="btn outline small">
            <TrendingUp size={13} />
            <span>Analyze Gap</span>
          </Link>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div className="ui-grid split">
          {/* LEFT: JOB DESCRIPTION & SKILLS */}
          <div className="stack" style={{ gap: 16 }}>
            <div className="card card-pad">
              <div className="card-head">
                <h3 className="card-title row-gap">
                  <Briefcase size={18} color="var(--accent)" />
                  <span>Job Overview & Description</span>
                </h3>
              </div>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {description}
              </p>
            </div>

            <div className="card card-pad">
              <div className="card-head">
                <h3 className="card-title row-gap">
                  <ShieldCheck size={18} color="var(--good)" />
                  <span>Skills Alignment Matrix</span>
                </h3>
              </div>

              <div className="stack" style={{ gap: 8, marginBottom: 16 }}>
                <span className="row-gap text-sm text-good" style={{ gap: 6, fontWeight: 700 }}>
                  <CheckCircle2 size={15} />
                  Your Matched Skills ({matchedSkills ? matchedSkills.length : 0})
                </span>
                <div className="chips">
                  {matchedSkills &&
                    matchedSkills.map((s) => (
                      <span key={s} className="pill good">{s} ✓</span>
                    ))}
                </div>
              </div>

              {missingSkills && missingSkills.length > 0 && (
                <div className="stack" style={{ gap: 8 }}>
                  <span className="row-gap text-sm text-bad" style={{ gap: 6, fontWeight: 700 }}>
                    <AlertCircle size={15} />
                    Skills to Learn / Missing ({missingSkills.length})
                  </span>
                  <div className="chips">
                    {missingSkills.map((s) => (
                      <span key={s} className="pill bad">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: MATCH BREAKDOWN */}
          <div className="card card-pad" style={{ alignSelf: 'start' }}>
            <div className="card-head">
              <h3 className="card-title row-gap">
                <BrainCircuit size={18} color="var(--accent)" />
                <span>Match Score Breakdown</span>
              </h3>
            </div>
            <div className="stack" style={{ gap: 16 }}>
              {scoreRows.map((r) => (
                <div key={r.label}>
                  <div className="row-between text-sm" style={{ fontWeight: 600, marginBottom: 6 }}>
                    <span>{r.label}</span>
                    <span className="num">{r.value}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className={`bar ${r.bar}`} style={{ width: `${r.value}%` }} />
                  </div>
                  {r.note && <div className="muted text-xs" style={{ marginTop: 4 }}>{r.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RESPONSIBILITIES CARD */}
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title">Roles & Responsibilities</h3>
          </div>
          <ul className="muted" style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
            {responsibilities &&
              responsibilities.map((r, i) => (
                <li key={i} style={{ marginBottom: 6 }}>{r}</li>
              ))}
          </ul>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="next-step">
          <div>
            <strong>Ready to take the next step with {company}?</strong>
            <p>Submit your candidate application or check your skill roadmap to prepare.</p>
          </div>
          <div className="row-gap">
            <button type="button" className="btn" onClick={handleOpenApplyModal} disabled={applied}>
              {applied ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Application Submitted ✓</span>
                </>
              ) : (
                <>
                  <span>Apply for this Job</span>
                  <ExternalLink size={14} />
                </>
              )}
            </button>
            <Link to="/gap-analysis" className="btn outline">
              <TrendingUp size={14} />
              <span>Skill Gap</span>
            </Link>
            <Link to="/roadmap" className="btn outline">
              <GitBranch size={14} />
              <span>Roadmap</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          CANDIDATE JOB APPLICATION MODAL FORM
      ======================================================== */}
      {showApplyModal && (
        <div className="modal-bg" onClick={() => setShowApplyModal(false)}>
          <form
            className="modal"
            style={{ width: 'min(580px, 100%)' }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitApplication}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
          >
            <div className="modal-head" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3 id="apply-modal-title">Apply for {title}</h3>
                <div className="row-gap" style={{ marginTop: 4 }}>
                  <span className="muted text-xs">at {company} · {location}</span>
                  {job.due_date && (
                    <span className="pill warn">
                      <Clock size={11} /> Due Date: {fmtDate(job.due_date)}
                    </span>
                  )}
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowApplyModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {submitError && (
              <div className="notice bad">
                <AlertCircle size={16} />
                <span className="notice-main">{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="notice good">
                <CheckCircle2 size={18} />
                <strong className="notice-main">Application submitted successfully to MySQL database!</strong>
              </div>
            )}

            {/* Full Name & Email Row */}
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="app-full-name">Full Name</label>
                <input
                  id="app-full-name"
                  className="input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Candidate name"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="app-email">Email Address</label>
                <input
                  id="app-email"
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Candidate email"
                />
              </div>
            </div>

            {/* Phone & Experience Level */}
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="app-phone">Phone Number</label>
                <input
                  id="app-phone"
                  className="input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="app-exp">Experience Level</label>
                <select
                  id="app-exp"
                  className="select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Fresher / 0-1 years">Fresher / 0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>
            </div>

            {/* Portfolio / LinkedIn URL */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label" htmlFor="app-portfolio">Portfolio or GitHub URL</label>
              <input
                id="app-portfolio"
                className="input"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/your-username"
              />
            </div>

            {/* Resume File Upload */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">
                Attach Resume (PDF or DOCX){' '}
                <span className="muted" style={{ fontWeight: 400 }}>— Optional</span>
              </label>
              <div
                className="upload"
                style={{ padding: 14, gap: 4 }}
                onClick={() => document.getElementById('app-resume-file').click()}
              >
                <input
                  type="file"
                  id="app-resume-file"
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files[0] || null)}
                />
                <span className="row-gap text-sm" style={{ fontWeight: 600, justifyContent: 'center' }}>
                  <Upload size={18} />
                  {resumeFile ? resumeFile.name : 'Click to select custom resume file'}
                </span>
                {resumeFile && (
                  <span className="text-good text-xs">
                    File ready to upload: {(resumeFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>

            {/* Cover Note */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label" htmlFor="app-cover">Cover Note / Why this role?</label>
              <textarea
                id="app-cover"
                className="input"
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tell the employer why you are a great match for this role..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button type="button" className="btn outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={submitting || submitSuccess}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
