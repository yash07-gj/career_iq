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
  GraduationCap
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { mockJobs } from '../mockData/careerData';
import auth from '../utils/auth';

export default function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  const currentUser = auth.getUser();

  useEffect(() => {
    setLoading(true);
    try {
      const numericId = parseInt(jobId, 10) || 1;
      const found = mockJobs.find(
        (j) => j.id === numericId || String(j.id) === String(jobId)
      ) || mockJobs[0];

      setJob(found);
    } catch (err) {
      console.warn('Error loading job details:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

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
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid var(--line, #e2e8f0)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Job Matching</span>
        </Link>

        {/* JOB MATCH HEADER */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--line, #e2e8f0)',
            borderRadius: 14,
            padding: '28px 32px',
            marginBottom: 24,
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--blue, #2563eb)',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: 6
              }}
            >
              JOB MATCH ANALYSIS
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--navy, #0f172a)',
                margin: '0 0 10px',
                letterSpacing: '-0.5px'
              }}
            >
              {title}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 14,
                color: '#475569',
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

          <div style={{ textAlign: 'right' }}>
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
          </div>
        </div>

        {/* MATCH SUMMARY BANNER */}
        <div
          className="card card-pad"
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            border: '1px solid #dbeafe'
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
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
                Candidate Compatibility Score: {match}%
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Your extracted resume profile has high alignment with <strong>{company}</strong>'s
                position requirements, verified through skill matching, educational background, and
                domain criteria.
              </p>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN GRID FOR EVIDENCE & PROFILE COMPARISON */}
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          {/* PROFILE VS JOB MATCHING BREAKDOWN */}
          <div className="card card-pad">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
              <ShieldCheck size={18} color="var(--blue, #2563eb)" />
              Candidate Profile ↔ Job Requirements
            </h3>

            {/* Matched Skills */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Matched Required Skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {matchedSkills &&
                  matchedSkills.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 10px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: 16,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#065f46'
                      }}
                    >
                      <CheckCircle2 size={13} color="#10b981" />
                      {s}
                    </span>
                  ))}
              </div>
            </div>

            {/* Education Match */}
            {educationMatch && (
              <div style={{ marginBottom: 14, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                  <GraduationCap size={15} color="var(--blue, #2563eb)" />
                  <span>Education Requirement:</span>
                </div>
                <div style={{ color: '#475569', fontSize: 12 }}>{educationMatch}</div>
              </div>
            )}

            {/* Experience Match */}
            {experienceMatch && (
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                  <Briefcase size={15} color="var(--blue, #2563eb)" />
                  <span>Experience Requirement:</span>
                </div>
                <div style={{ color: '#475569', fontSize: 12 }}>{experienceMatch}</div>
              </div>
            )}
          </div>

          {/* MODEL SCORING BREAKDOWN */}
          <div className="card card-pad">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
              <TrendingUp size={18} color="var(--blue, #2563eb)" />
              Matching Model Scoring Breakdown
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              How the AI Job Matching Model weighted your candidate profile against this opening:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {breakdown &&
                breakdown.map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                      <strong style={{ color: 'var(--navy, #0f172a)' }}>{item.label}</strong>
                      <b style={{ color: '#475569' }}>{item.score}%</b>
                    </div>
                    <div className="bar-bg">
                      <div
                        className={`bar ${item.score >= 85 ? 'green' : ''}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* MISSING OR PREFERRED SKILLS */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
            <AlertCircle size={18} color="#f59e0b" />
            Skills That Could Boost Your Application Ranking
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px' }}>
            These skills are mentioned as preferred or supplementary qualifications in the job description:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {missingSkills &&
              missingSkills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#991b1b'
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                  {s}
                </span>
              ))}
          </div>
        </div>

        {/* JOB DESCRIPTION & RESPONSIBILITIES */}
        <div className="card card-pad" style={{ marginBottom: 28 }}>
          <h3 className="card-title" style={{ margin: '0 0 12px' }}>Role Overview & Key Responsibilities</h3>
          <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '0 0 16px' }}>
            {description}
          </p>

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy, #0f172a)', marginBottom: 8 }}>
            Key Duties:
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
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
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1px solid #bfdbfe'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
              Interested in applying to {company}?
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Submit your tailored resume or check your specific skill roadmap for this job.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn"
              onClick={() => setApplied(true)}
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {applied ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Application Submitted ✓</span>
                </>
              ) : (
                <>
                  <span>Apply Now</span>
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
    </Layout>
  );
}
