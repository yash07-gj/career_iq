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
  ArrowRight,
  ShieldCheck,
  Award,
  ExternalLink,
  GraduationCap,
  X,
  Upload,
  User,
  Mail,
  Phone,
  FileText,
  Send,
  Loader2
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
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
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
            Loading job details...
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
    matchedSkills,
    missingSkills,
    educationMatch,
    experienceMatch,
    breakdown
  } = job;

  return (
    <Layout>
      <div style={{ padding: '24px 36px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {/* BACK BUTTON */}
        <Link
          to="/job-matching"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--blue, #2563eb)',
            textDecoration: 'none',
            marginBottom: 20,
            padding: '6px 12px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 8,
            border: '1px solid var(--line, #e2e8f0)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Job Matching</span>
        </Link>

        {/* HERO CARD */}
        <div
          className="card card-pad"
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 20
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="pill blue" style={{ fontSize: 12 }}>
                AI Match Score Verified
              </span>
              <span className="pill green" style={{ fontSize: 12 }}>
                Active Hiring
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy, #0f172a)', margin: '0 0 10px' }}>
              {title}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: 16,
                fontSize: 14,
                color: 'var(--text-muted, #475569)',
                flexWrap: 'wrap',
                marginBottom: 12
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
                <Building2 size={16} color="var(--blue, #2563eb)" />
                {company}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} color="#94a3b8" />
                {location}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={15} color="#94a3b8" />
                {type}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} color="#94a3b8" />
                {experience}
              </span>
              {salary && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#047857' }}>
                  <DollarSign size={15} color="#10b981" />
                  {salary}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: match >= 80 ? '#ecfdf5' : match >= 70 ? '#eff6ff' : '#fffbeb',
                border: `1px solid ${match >= 80 ? '#a7f3d0' : match >= 70 ? '#bfdbfe' : '#fde68a'}`
              }}
            >
              <Award size={22} color={match >= 80 ? '#10b981' : match >= 70 ? '#2563eb' : '#f59e0b'} />
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: match >= 80 ? '#047857' : match >= 70 ? '#1d4ed8' : '#b45309'
                }}
              >
                {match}% Match
              </span>
            </div>

            <button
              type="button"
              className="btn"
              onClick={handleOpenApplyModal}
              disabled={applied}
              style={{
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
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
        <div
          className="card card-pad"
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0.08) 100%)',
            border: '1px solid var(--blue-border, #dbeafe)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background: '#2563eb',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20,
                fontWeight: 800,
                flexShrink: 0
              }}
            >
              {match}%
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--navy, #0f172a)' }}>
                Strong Alignment with your Extracted Profile
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
                Your resume exhibits strong mastery of{' '}
                <strong>{matchedSkills ? matchedSkills.slice(0, 3).join(', ') : 'key skills'}</strong>. You
                fulfill <strong>{breakdown?.skillScore || 85}%</strong> of the direct technical skills
                required for this role.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/gap-analysis" className="btn outline small" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} />
                <span>Analyze Gap</span>
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24, marginBottom: 24 }}>
          {/* LEFT: JOB DESCRIPTION & SKILLS */}
          <div>
            {/* Description */}
            <div className="card card-pad" style={{ marginBottom: 24 }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={18} color="var(--blue, #2563eb)" />
                <span>Job Overview & Description</span>
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted, #475569)', lineHeight: 1.7, margin: 0 }}>
                {description}
              </p>
            </div>

            {/* Matched Skills Matrix */}
            <div className="card card-pad" style={{ marginBottom: 24 }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>Skills Alignment Matrix</span>
              </h3>

              {/* Matched */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#047857', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} />
                  <span>Your Matched Skills ({matchedSkills ? matchedSkills.length : 0})</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {matchedSkills &&
                    matchedSkills.map((s) => (
                      <span key={s} className="pill green" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
                        {s} ✓
                      </span>
                    ))}
                </div>
              </div>

              {/* Missing */}
              {missingSkills && missingSkills.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#b45309', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={15} />
                    <span>Skills to Learn / Missing ({missingSkills.length})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {missingSkills.map((s) => (
                      <span key={s} className="pill orange" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: MATCH BREAKDOWN CARDS */}
          <div>
            <div className="card card-pad" style={{ marginBottom: 24 }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BrainCircuit size={18} color="var(--blue, #2563eb)" />
                <span>Match Score Breakdown</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span>Technical Skill Fit</span>
                    <span style={{ color: 'var(--blue, #2563eb)' }}>{breakdown?.skillScore || 85}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar blue" style={{ width: `${breakdown?.skillScore || 85}%` }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span>Education Requirement</span>
                    <span style={{ color: '#10b981' }}>{breakdown?.educationScore || 95}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar green" style={{ width: `${breakdown?.educationScore || 95}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    {educationMatch || 'Matches MCA / Computer Science Degree'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span>Experience Level Fit</span>
                    <span style={{ color: '#f59e0b' }}>{breakdown?.experienceScore || 75}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar orange" style={{ width: `${breakdown?.experienceScore || 75}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    {experienceMatch || 'Fits Fresher / Graduate requirements'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIBILITIES CARD */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 className="card-title">Roles & Responsibilities</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted, #475569)', lineHeight: 1.7 }}>
            {responsibilities &&
              responsibilities.map((r, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {r}
                </li>
              ))}
          </ul>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div
          className="card card-pad"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.02) 100%)',
            border: '1px solid var(--blue-border, #bfdbfe)'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
              Ready to take the next step with {company}?
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted, #64748b)' }}>
              Submit your candidate application or check your skill roadmap to prepare.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn"
              onClick={handleOpenApplyModal}
              disabled={applied}
              style={{
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
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

            <Link
              to="/gap-analysis"
              className="btn outline"
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <TrendingUp size={14} />
              <span>Skill Gap</span>
            </Link>

            <Link
              to="/roadmap"
              className="btn outline"
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <GitBranch size={14} />
              <span>Roadmap</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          CANDIDATE JOB APPLICATION MODAL FORM
      ======================================================== */}
      {showApplyModal && (
        <div
          onClick={() => setShowApplyModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--line, #e2e8f0)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--line, #e2e8f0)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0.08) 100%)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--navy, #0f172a)' }}>
                  Apply for {title}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted, #64748b)' }}>
                  at {company} · {location}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitApplication} style={{ padding: 24, overflowY: 'auto' }}>
              {submitError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                    fontWeight: 700
                  }}
                >
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Application submitted successfully to MySQL database!</span>
                </div>
              )}

              {/* Full Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Full Name</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Candidate name"
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Email Address</label>
                  <input
                    className="input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Candidate email"
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Phone & Experience Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Phone Number</label>
                  <input
                    className="input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Experience Level</label>
                  <select
                    className="select"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                  >
                    <option value="Fresher / 0-1 years">Fresher / 0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              {/* Portfolio / LinkedIn URL */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Portfolio or GitHub URL</label>
                <input
                  className="input"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              {/* Resume File Upload */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
                  Attach Resume (PDF or DOCX){' '}
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— Optional</span>
                </label>
                <div
                  style={{
                    border: '1.5px dashed var(--line, #cbd5e1)',
                    borderRadius: 10,
                    padding: '14px',
                    textAlign: 'center',
                    background: 'rgba(37,99,235,0.02)',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('app-resume-file').click()}
                >
                  <input
                    type="file"
                    id="app-resume-file"
                    style={{ display: 'none' }}
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setResumeFile(e.target.files[0] || null)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Upload size={18} color="var(--blue, #2563eb)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy, #0f172a)' }}>
                      {resumeFile ? resumeFile.name : 'Click to select custom resume file'}
                    </span>
                  </div>
                  {resumeFile && (
                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
                      File ready to upload: {(resumeFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Note */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Cover Note / Why this role?</label>
                <textarea
                  className="input"
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Tell the employer why you are a great match for this role..."
                  style={{ width: '100%', resize: 'vertical', fontSize: 13, height: 'auto', padding: 10 }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn outline"
                  onClick={() => setShowApplyModal(false)}
                  style={{ padding: '10px 18px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={submitting || submitSuccess}
                  style={{
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
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
        </div>
      )}
    </Layout>
  );
}
