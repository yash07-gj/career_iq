import React, { useEffect, useState } from 'react';
import { Award, ShieldAlert, ArrowRight, TrendingUp, UploadCloud, FileText, CheckCircle2, Sparkles, Trash2, RefreshCw, X } from 'lucide-react';
import { mockMarketSkills } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';
import { Gauge, StatTile, EmptyState } from '../components/ui';
import { toneFor } from '../utils/career';
import useToast from '../hooks/useToast';
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
    user_name: currentUser?.full_name || 'Candidate',
    has_resume: false,
    resume_filename: null,
  });
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Remove-resume flow (confirmation dialog + reload after removal)
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, showToast] = useToast();

  const handleRemoveResume = async () => {
    setRemoving(true);
    setRemoveError('');
    try {
      await api.deleteResume(currentUser.user_id);
      setConfirmRemove(false);
      setReloadKey((k) => k + 1);
      showToast('Resume removed');
    } catch (err) {
      setRemoveError(err.message || 'Could not remove the resume. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

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

        // Fetch exact target role gaps from gap-analysis to ensure 100% synchronization
        const topRoleId = res?.recommendations?.[0]?.career_role_id || 1;
        try {
          const gapRes = await api.getGapAnalysis(topRoleId, currentUser.user_id);
          if (gapRes && Array.isArray(gapRes.missing_skills)) {
            missingSkills = gapRes.missing_skills.map((m) => (typeof m === 'string' ? m : m.name));
            missingCount = missingSkills.length;
          }
        } catch (e) {
          console.warn('Gap analysis sync fallback:', e);
        }

        if (res && res.metrics) {
          setData({
            ...res,
            metrics: {
              ...res.metrics,
              missing_skills: missingCount,
            },
            missing_skills_list: missingSkills,
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
  }, [currentUser?.user_id, currentUser?.full_name, reloadKey]);

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
  const hasResume = Boolean(data.has_resume);

  const nextSkill = missingSkillsList[0];
  const liveTip =
    hasResume && missingSkillsList.length > 0
      ? `Master top missing skills for ${metrics.top_career_match} (${missingSkillsList.join(', ')}) in your roadmap to boost role readiness!`
      : hasResume
      ? 'All core prerequisites met for your top career role!'
      : 'Upload your resume to receive custom AI tips and tailored skill gaps.';

  const readinessColor =
    metrics.career_readiness > 0 ? `var(--${toneFor(metrics.career_readiness)})` : 'var(--accent)';

  const statusTone = (status) =>
    status === 'Shortlisted' || status === 'Hired'
      ? 'good'
      : status === 'Rejected'
      ? 'bad'
      : status === 'Under Review'
      ? 'warn'
      : 'info';

  return (
    <Layout>
      <Page
        title={`Welcome back, ${currentUser?.full_name || data.user_name}`}
        subtitle="AI-driven career path analysis, skill gap assessment, and tailored milestones"
      >
        {/* RESUME ONBOARDING BANNER (WHEN NO RESUME UPLOADED YET) */}
        {!hasResume && (
          <div className="notice info">
            <UploadCloud size={22} />
            <div className="notice-main">
              <strong>Upload Your Resume to Unlock AI Insights</strong>
              <p className="muted text-sm" style={{ margin: '2px 0 0' }}>
                Your dashboard currently shows 0 data. Upload your resume (PDF or DOCX) to automatically calculate your Career Readiness Score, extract your verified skills, identify role gaps, and build a tailored learning roadmap.
              </p>
            </div>
            <Link to="/resume" className="btn">
              Upload Resume Now <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ACTIVE RESUME STATUS BADGE (WHEN RESUME IS ALREADY UPLOADED) */}
        {hasResume && (
          <div className="notice good">
            <CheckCircle2 size={18} />
            <span className="notice-main text-sm">
              Active Resume: <strong>{data.resume_filename || 'Uploaded Resume'}</strong>
            </span>
            <div className="row-gap" style={{ gap: 16 }}>
              <Link to="/resume" className="link-btn">
                <RefreshCw size={14} /> Update / Re-analyze Resume
              </Link>
              <button type="button" className="link-btn text-bad" onClick={() => { setRemoveError(''); setConfirmRemove(true); }}>
                <Trash2 size={14} /> Remove Resume
              </button>
            </div>
          </div>
        )}

        {/* REMOVE RESUME CONFIRMATION */}
        {confirmRemove && (
          <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget && !removing) setConfirmRemove(false); }}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="remove-resume-title">
              <div className="modal-head">
                <h3 id="remove-resume-title">Remove your resume?</h3>
                <button type="button" className="icon-btn" aria-label="Close" onClick={() => setConfirmRemove(false)} disabled={removing}>
                  <X size={18} />
                </button>
              </div>
              <p className="muted text-sm" style={{ margin: 0 }}>
                <strong style={{ color: 'var(--ink)' }}>{data.resume_filename || 'Your resume'}</strong> will be deleted along with
                the skills extracted from it, your career recommendations, skill gaps and roadmap. Your profile details stay.
                You can upload a new resume at any time.
              </p>
              {removeError && <div className="notice bad text-sm">{removeError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn outline" onClick={() => setConfirmRemove(false)} disabled={removing}>Cancel</button>
                <button type="button" className="btn danger" onClick={handleRemoveResume} disabled={removing}>
                  <Trash2 size={15} /> {removing ? 'Removing…' : 'Remove Resume'}
                </button>
              </div>
            </div>
          </div>
        )}
        {toast}

        {/* FOCUS: READINESS GAUGE + NEXT BEST STEP, AND TOP MATCHES */}
        <div className="ui-grid split">
          <div className="card card-pad focus-card">
            <Gauge value={metrics.career_readiness} label="Career readiness" color={readinessColor} />
            <div className="stack" style={{ gap: 10 }}>
              <span className="pill info" style={{ alignSelf: 'flex-start' }}>
                <Sparkles size={13} /> Your next best step
              </span>
              {!hasResume ? (
                <>
                  <h2 style={{ margin: 0, fontSize: 21 }}>Upload your resume</h2>
                  <p className="muted text-sm" style={{ margin: 0 }}>{liveTip}</p>
                  <div className="row-gap">
                    <Link to="/resume" className="btn">
                      Upload Resume <ArrowRight size={15} />
                    </Link>
                  </div>
                </>
              ) : nextSkill ? (
                <>
                  <h2 style={{ margin: 0, fontSize: 21 }}>Learn {nextSkill}</h2>
                  <p className="muted text-sm" style={{ margin: 0 }}>{liveTip}</p>
                  <div className="row-gap">
                    <Link to="/roadmap" className="btn">
                      Open roadmap <ArrowRight size={15} />
                    </Link>
                    <Link to="/simulation" className="btn outline">
                      Simulate it
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ margin: 0, fontSize: 21 }}>You are ready for {metrics.top_career_match}</h2>
                  <p className="muted text-sm" style={{ margin: 0 }}>{liveTip}</p>
                  <div className="row-gap">
                    <Link to="/job-matching" className="btn">
                      Find jobs <ArrowRight size={15} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RECOMMENDED CAREERS */}
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Top Career Matches</h3>
              {recommendations.length > 0 && (
                <Link to="/recommendations" className="link-btn">
                  View Details <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {recommendations.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Career Recommendations Yet"
                text="Upload your resume to discover your personalized AI career recommendations and role rankings."
                action={
                  <Link to="/resume" className="btn small">
                    Upload Resume
                  </Link>
                }
              />
            ) : (
              recommendations.slice(0, 4).map((c, i) => (
                <div className="list-row" key={c.career_recommendation_id || c.id || i}>
                  <div className="list-icon">
                    <Award size={18} />
                  </div>
                  <div className="list-main">
                    <strong>{c.role}</strong>
                    <span>{c.desc || c.summary_explanation}</span>
                  </div>
                  <div className="list-end">
                    <span className="match-num" style={{ color: `var(--${toneFor(c.match)})` }}>{c.match}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TOP METRIC TILES */}
        <div className="ui-grid cols-4">
          <StatTile
            label="Career Readiness"
            value={`${metrics.career_readiness}%`}
            tone={metrics.career_readiness > 0 ? toneFor(metrics.career_readiness) : undefined}
            sub={hasResume ? 'Calculated from your resume' : 'Upload resume to calculate'}
            to="/gap-analysis"
          />
          <StatTile
            label="Top Career Match"
            value={metrics.top_match_percentage > 0 ? `${metrics.top_match_percentage}% Match` : '0% Match'}
            tone={metrics.top_match_percentage > 0 ? toneFor(metrics.top_match_percentage) : undefined}
            sub={metrics.top_career_match}
            to="/recommendations"
          />
          <StatTile
            label="Total Skills Found"
            value={`${metrics.total_skills}`}
            sub={hasResume ? 'Extracted from your resume' : '0 skills detected'}
            to="/resume"
          />
          <StatTile
            label="Missing Skills"
            value={`${metrics.missing_skills}`}
            tone={metrics.missing_skills > 0 ? 'bad' : undefined}
            sub={
              hasResume
                ? missingSkillsList.length > 0
                  ? missingSkillsList.slice(0, 3).join(', ')
                  : '0 gaps for target role'
                : 'Pending resume upload'
            }
            to="/gap-analysis"
            title="View exact gaps in Skill Gap Analysis"
          />
        </div>

        {/* MARKET DEMAND + MISSING SKILLS */}
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title">Market Skill Demand</h3>
            <Link to="/gap-analysis" className="link-btn">
              Gap Analysis <ArrowRight size={13} />
            </Link>
          </div>

          <div className="ui-grid cols-2" style={{ alignItems: 'start' }}>
            <div>
              {marketSkills.slice(0, 5).map((s, i) => (
                <div className="bar-row" key={s.name}>
                  <span className="bar-label">{s.name}</span>
                  <div className="bar-bg">
                    <div className={`bar ${i === 0 ? 'green' : i === 2 ? 'purple' : ''}`} style={{ width: `${s.demand}%` }} />
                  </div>
                  <b className="bar-num">{s.demand}%</b>
                </div>
              ))}
            </div>

            <div className="stack">
              {/* Target Role Missing Skills from Gap Analysis */}
              {hasResume && (
                <div className="stack" style={{ gap: 8 }}>
                  <div className="row-between">
                    <span className="text-sm text-bad" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <ShieldAlert size={15} /> Missing Skills ({metrics.top_career_match}):
                    </span>
                    <Link to="/gap-analysis" className="link-btn text-xs">
                      Skill Gap Analysis →
                    </Link>
                  </div>
                  {missingSkillsList.length > 0 ? (
                    <div className="chips">
                      {missingSkillsList.map((skillName) => (
                        <span key={skillName} className="pill bad">
                          ✕ {skillName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-good" style={{ fontWeight: 600 }}>
                      ✓ No missing skills for this role!
                    </span>
                  )}
                </div>
              )}

              <div className="notice info">
                <TrendingUp size={18} />
                <span className="notice-main text-sm">
                  <strong>Live AI Tip:</strong> {liveTip}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CANDIDATE'S SUBMITTED JOB APPLICATIONS */}
        {userApplications.length > 0 && (
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={19} color="var(--accent)" />
                My Submitted Applications ({userApplications.length})
              </h3>
              <Link to="/job-matching" className="link-btn">
                Explore More Jobs <ArrowRight size={13} />
              </Link>
            </div>

            <div className="ui-grid cols-2">
              {userApplications.map((app) => {
                const isIntern = (app.job_type || '').toLowerCase().includes('intern');
                const appDate = app.created_at
                  ? new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Recent';

                return (
                  <div
                    key={app.application_id}
                    className="stack"
                    style={{ gap: 10, padding: 16, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  >
                    <div className="row-between" style={{ alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: 15 }}>{app.job_title}</strong>
                        <span className="muted text-xs" style={{ fontWeight: 600 }}>{app.company_name}</span>
                      </div>
                      <span className={`pill ${statusTone(app.status)}`}>{app.status || 'Applied'}</span>
                    </div>

                    <div className="row-gap">
                      <span className={`pill ${isIntern ? 'warn' : 'info'}`}>{app.job_type || 'Full-time'}</span>
                      <span className="muted text-xs">📍 {app.location}</span>
                    </div>

                    <div className="row-between text-xs muted" style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                      <span>
                        Applied on: <strong style={{ color: 'var(--ink)' }}>{appDate}</strong>
                      </span>
                      <Link to={`/job-details/${app.job_id}`} className="link-btn text-xs">
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
