import React, { useEffect, useState } from 'react';
import { Target, Award, BrainCircuit, ShieldAlert, ArrowRight, TrendingUp, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { mockMarketSkills } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';
import { Link } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

export default function Dashboard() {
  const currentUser = auth.getUser();
  const [data, setData] = useState({
    metrics: {
      career_readiness: 0,
      top_career_match: 'No Resume Uploaded',
      top_match_percentage: 0,
      total_skills: 0,
      missing_skills: 0,
    },
    recommendations: [],
    market_skills: mockMarketSkills,
    missing_skills_list: [],
    matched_skills_list: [],
    user_name: currentUser?.full_name || 'Candidate',
    has_resume: false,
    resume_filename: null,
  });
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentUser?.user_id) {
        setLoading(false);
        return;
      }
      try {
        const [res, apps] = await Promise.all([
          api.getDashboard(currentUser.user_id).catch(() => null),
          api.getUserApplications(currentUser.user_id).catch(() => [])
        ]);

        let missingSkills = res?.missing_skills_list || [];
        let missingCount = res?.metrics?.missing_skills ?? 0;
        let matchedSkills = res?.matched_skills_list || [];
        let matchedCount = res?.metrics?.total_skills ?? 0;

        // Fetch exact target role skills and gaps from gap-analysis to ensure 100% synchronization
        const topRoleId = res?.recommendations?.[0]?.career_role_id || 1;
        try {
          const gapRes = await api.getGapAnalysis(topRoleId, currentUser.user_id);
          if (gapRes) {
            if (Array.isArray(gapRes.missing_skills)) {
              missingSkills = gapRes.missing_skills.map((m) => (typeof m === 'string' ? m : m.name));
              missingCount = missingSkills.length;
            }
            if (Array.isArray(gapRes.matched_skills)) {
              matchedSkills = gapRes.matched_skills.map((m) => (typeof m === 'string' ? m : m.name || m));
              matchedCount = matchedSkills.length;
            }
          }
        } catch (e) {
          console.warn('Gap analysis sync fallback:', e);
        }

        if (res && res.metrics) {
          setData({
            ...res,
            metrics: {
              ...res.metrics,
              total_skills: matchedCount,
              missing_skills: missingCount,
            },
            missing_skills_list: missingSkills,
            matched_skills_list: matchedSkills,
            user_name: currentUser.full_name || res.user_name,
          });
        }
        if (Array.isArray(apps)) {
          setUserApplications(apps);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [currentUser?.user_id, currentUser?.full_name]);

  const metrics = data.metrics || {
    career_readiness: 0,
    top_career_match: 'No Resume Uploaded',
    top_match_percentage: 0,
    total_skills: 0,
    missing_skills: 0,
  };
  const recommendations = data.recommendations || [];
  const marketSkills = data.market_skills || mockMarketSkills;
  const missingSkillsList = data.missing_skills_list || [];
  const matchedSkillsList = data.matched_skills_list || [];
  const hasResume = Boolean(data.has_resume);

  return (
    <Layout>
      <Page 
        title={`Welcome back, ${currentUser?.full_name || data.user_name}`} 
        subtitle="AI-driven career path analysis, skill gap assessment, and tailored milestones"
      >
        {/* RESUME ONBOARDING BANNER (WHEN NO RESUME UPLOADED YET) */}
        {!hasResume && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: '#ffffff',
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UploadCloud size={28} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                  Upload Your Resume to Unlock AI Insights
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9, maxWidth: 620, lineHeight: 1.5 }}>
                  Your dashboard currently shows 0 data. Upload your resume (PDF or DOCX) to automatically calculate your Career Readiness Score, extract your verified skills, identify role gaps, and build a tailored learning roadmap.
                </p>
              </div>
            </div>
            <Link
              to="/resume"
              className="btn"
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 800,
                padding: '10px 22px',
                borderRadius: 8,
                fontSize: 13,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              Upload Resume Now <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ACTIVE RESUME STATUS BADGE (WHEN RESUME IS ALREADY UPLOADED) */}
        {hasResume && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 10,
              padding: '10px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 13,
              color: '#065f46',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>
                Active Resume: <strong>{data.resume_filename || 'Uploaded Resume'}</strong>
              </span>
            </div>
            <Link
              to="/resume"
              style={{ fontSize: 12, fontWeight: 700, color: '#059669', textDecoration: 'underline' }}
            >
              Update / Re-analyze Resume
            </Link>
          </div>
        )}

        {/* TOP METRIC CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[
            [
              Target,
              'Career Readiness',
              `${metrics.career_readiness}%`,
              metrics.career_readiness > 0 ? 'green' : 'blue',
              hasResume ? 'Calculated from your resume' : 'Upload resume to calculate',
              '/gap-analysis'
            ],
            [
              Award,
              'Top Career Match',
              metrics.top_match_percentage > 0 ? `${metrics.top_match_percentage}% Match` : '0% Match',
              metrics.top_match_percentage > 0 ? 'orange' : 'blue',
              metrics.top_career_match,
              '/recommendations'
            ],
            [
              BrainCircuit,
              'Total Skills Found',
              `${metrics.total_skills}`,
              'blue',
              hasResume
                ? (matchedSkillsList.length > 0 ? matchedSkillsList.slice(0, 3).join(', ') : 'Verified acquired skills')
                : '0 skills detected',
              '/gap-analysis'
            ],
            [
              ShieldAlert,
              'Missing Skills',
              `${metrics.missing_skills}`,
              metrics.missing_skills > 0 ? 'red' : 'blue',
              hasResume
                ? (missingSkillsList.length > 0 ? missingSkillsList.slice(0, 3).join(', ') : '0 gaps for target role')
                : 'Pending resume upload',
              '/gap-analysis'
            ],
          ].map(([Icon, label, val, color, sub, link]) => (
            <Link
              to={link}
              className="card metric"
              key={label}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
              title={label === 'Missing Skills' ? 'View exact gaps in Skill Gap Analysis' : undefined}
            >
              <div
                className="metric-icon"
                style={{
                  background:
                    color === 'green'
                      ? '#ecfdf5'
                      : color === 'red'
                      ? '#fef2f2'
                      : color === 'orange'
                      ? '#fffbeb'
                      : '#eff6ff',
                }}
              >
                <Icon
                  size={24}
                  color={
                    color === 'green'
                      ? '#10b981'
                      : color === 'red'
                      ? '#ef4444'
                      : color === 'orange'
                      ? '#f59e0b'
                      : '#2563eb'
                  }
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span className="metric-label">{label}</span>
                <strong className={`metric-value ${color}`}>{val}</strong>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    color: '#94a3b8',
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={sub}
                >
                  {sub}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="grid grid-2">
          {/* RECOMMENDED CAREERS */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Top Career Matches</h3>
              {recommendations.length > 0 && (
                <Link
                  to="/recommendations"
                  style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  View Details <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                <FileText size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#334155' }}>No Career Recommendations Yet</h4>
                <p style={{ margin: '0 0 16px', fontSize: 13 }}>
                  Upload your resume to discover your personalized AI career recommendations and role rankings.
                </p>
                <Link to="/resume" className="btn small">
                  Upload Resume
                </Link>
              </div>
            ) : (
              recommendations.slice(0, 4).map((c, i) => (
                <div className="reco-item" key={c.career_recommendation_id || c.id || i}>
                  <div className="role-icon">
                    <Award size={18} />
                  </div>
                  <div className="reco-main">
                    <strong>{c.role}</strong>
                    <span>{c.desc || c.summary_explanation}</span>
                  </div>
                  <div className="match">{c.match}%</div>
                </div>
              ))
            )}
          </div>

          {/* SKILL DISTRIBUTION */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Market Skill Demand</h3>
              <Link
                to="/gap-analysis"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Gap Analysis <ArrowRight size={13} />
              </Link>
            </div>

            {marketSkills.slice(0, 5).map((s, i) => (
              <div className="bar-row" key={s.name}>
                <span className="bar-label">{s.name}</span>
                <div className="bar-bg">
                  <div
                    className={`bar ${i === 0 ? 'green' : i === 2 ? 'purple' : ''}`}
                    style={{ width: `${s.demand}%` }}
                  />
                </div>
                <b className="bar-num">{s.demand}%</b>
              </div>
            ))}

            {/* Target Role Missing Skills from Gap Analysis */}
            {hasResume && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#be123c', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ShieldAlert size={14} color="#ef4444" /> Missing Skills ({metrics.top_career_match}):
                  </span>
                  <Link to="/gap-analysis" style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>
                    Skill Gap Analysis →
                  </Link>
                </div>
                {missingSkillsList.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {missingSkillsList.map((skillName) => (
                      <span
                        key={skillName}
                        className="pill red"
                        style={{ fontSize: 11, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        ✕ {skillName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                    ✓ No missing skills for this role!
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                padding: 14,
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: 10,
                fontSize: 12,
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <TrendingUp size={16} />
              <span>
                <strong>Live AI Tip:</strong>{' '}
                {hasResume && missingSkillsList.length > 0
                  ? `Master top missing skills for ${metrics.top_career_match} (${missingSkillsList.join(', ')}) in your roadmap to boost role readiness!`
                  : hasResume
                  ? 'All core prerequisites met for your top career role!'
                  : 'Upload your resume to receive custom AI tips and tailored skill gaps.'}
              </span>
            </div>
          </div>
        </div>

        {/* CANDIDATE'S SUBMITTED JOB APPLICATIONS */}
        {userApplications.length > 0 && (
          <div className="card card-pad" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} color="#2563eb" />
                <h3 className="card-title" style={{ margin: 0 }}>
                  My Submitted Applications ({userApplications.length})
                </h3>
              </div>
              <Link
                to="/job-matching"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Explore More Jobs <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {userApplications.map((app) => {
                const isIntern = (app.job_type || '').toLowerCase().includes('intern');
                const appDate = app.created_at
                  ? new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Recent';

                const statusColor =
                  app.status === 'Shortlisted' || app.status === 'Hired'
                    ? 'green'
                    : app.status === 'Rejected'
                    ? 'red'
                    : app.status === 'Under Review'
                    ? 'orange'
                    : 'blue';

                return (
                  <div
                    key={app.application_id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <strong style={{ fontSize: 15, color: 'var(--navy, #0f172a)', display: 'block' }}>
                            {app.job_title}
                          </strong>
                          <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                            {app.company_name}
                          </span>
                        </div>
                        <span
                          className={`pill ${statusColor}`}
                          style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px' }}
                        >
                          {app.status || 'Applied'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span className={`pill ${isIntern ? 'orange' : 'blue'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                          {app.job_type || 'Full-time'}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          📍 {app.location}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 11,
                        color: '#94a3b8',
                        paddingTop: 10,
                        borderTop: '1px solid #e2e8f0'
                      }}
                    >
                      <span>Applied on: <strong style={{ color: '#475569' }}>{appDate}</strong></span>
                      <Link
                        to={`/job-details/${app.job_id}`}
                        style={{ color: 'var(--blue, #2563eb)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Page>
    </Layout>
  );
}

