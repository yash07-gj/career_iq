import React, { useState, useEffect } from 'react';
import { Eye, FileText, ArrowRight, Briefcase, MapPin, FileSearch, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, ScoreBreakdown, EmptyState } from '../components/ui';
import { toneFor } from '../utils/career';
import api from '../services/api';
import auth from '../utils/auth';

// Maps a score tone to the bar colour class used by .bar
const BAR_CLASS = { good: 'green', warn: 'orange', bad: 'red' };

// How a role relates to the job title written on the resume
const FIT_PILL = {
  resume: { cls: 'good', text: 'From your resume' },
  related: { cls: 'info', text: 'Related to your resume' },
};
const INITIAL_ROLES = 6;

export default function Recommendations() {
  const currentUser = auth.getUser();
  const [recommendations, setRecommendations] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [loading, setLoading] = useState(true);

  // "Why this score?" breakdowns: which card is open, and cached gap data per role
  const [openWhy, setOpenWhy] = useState(null);
  const [breakdowns, setBreakdowns] = useState({}); // { [roleId]: { loading, data, error } }

  useEffect(() => {
    async function loadRecs() {
      if (!currentUser?.user_id) {
        setLoading(false);
        return;
      }
      try {
        const [res, jobs] = await Promise.all([
          api.getRecommendations(currentUser.user_id),
          api.getJobMatches(currentUser.user_id, 6).catch(() => []),
        ]);
        if (res) {
          setRecommendations(res);
        }
        if (Array.isArray(jobs)) {
          setJobMatches(jobs);
        }
      } catch (err) {
        console.warn('Recommendations fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, [currentUser?.user_id]);

  // Toggle the breakdown for a role; load it from the gap-analysis API the first time
  const toggleWhy = async (roleId) => {
    if (openWhy === roleId) {
      setOpenWhy(null);
      return;
    }
    setOpenWhy(roleId);
    if (breakdowns[roleId]?.data) return;

    setBreakdowns((prev) => ({ ...prev, [roleId]: { loading: true } }));
    try {
      const gap = await api.getGapAnalysis(roleId, currentUser?.user_id);
      setBreakdowns((prev) => ({ ...prev, [roleId]: { loading: false, data: gap } }));
    } catch (err) {
      console.warn('Breakdown fetch error:', err);
      setBreakdowns((prev) => ({ ...prev, [roleId]: { loading: false, error: true } }));
    }
  };

  const resumeRole = recommendations.find((r) => r.fit === 'resume')?.role;
  const visibleRoles = showAllRoles ? recommendations : recommendations.slice(0, INITIAL_ROLES);

  return (
    <Layout>
      <Page title="Recommended Careers" subtitle="AI role recommendations tailored from your verified resume skills">
        <JourneyBar current="recommendations" />

        {recommendations.length === 0 ? (
          <div className="card card-pad">
            <EmptyState
              icon={FileText}
              title={loading ? 'Loading recommendations…' : 'No Career Recommendations Generated Yet'}
              text={
                loading
                  ? undefined
                  : 'Upload your resume to discover your tailored AI career recommendations, alignment percentages, and target roles.'
              }
              action={
                !loading && (
                  <Link to="/resume" className="btn">
                    Upload Resume Now <ArrowRight size={15} />
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
          <div className="notice info">
            <FileSearch size={20} />
            <div className="notice-main text-sm">
              {resumeRole ? (
                <>
                  Your resume is for <strong>{resumeRole}</strong>. Roles are ranked by how well they fit that job title
                  and by the skills found in your resume.
                </>
              ) : (
                <>We could not find a job title in your resume, so roles are ranked by the skills found in it.</>
              )}
            </div>
          </div>

          <div className="ui-grid cols-2">
            {visibleRoles.map((c) => {
              const roleId = c.career_role_id;
              const tone = toneFor(c.match);
              const bd = breakdowns[roleId];
              const isOpen = openWhy === roleId;
              return (
                <div className="card card-pad stack" key={c.career_recommendation_id || roleId} style={{ gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span className="list-icon" style={{ width: 44, height: 44 }}>#{c.rank}</span>
                    <div className="list-main">
                      <h3 className="card-title" style={{ fontSize: 17 }}>{c.role}</h3>
                      <span className="muted text-sm">{c.desc || c.summary_explanation}</span>
                      {c.desc && c.summary_explanation && (
                        <span className="text-xs" style={{ marginTop: 4 }}>{c.summary_explanation}</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="match-num" style={{ fontSize: 24, color: `var(--${tone})` }}>{c.match}%</div>
                      <span className="muted text-xs">Match</span>
                    </div>
                  </div>

                  <div className="bar-bg">
                    <div className={`bar ${BAR_CLASS[tone]}`} style={{ width: `${c.match}%` }} />
                  </div>

                  <div className="row-between">
                    <div className="row-gap" style={{ gap: 6 }}>
                      <span className="pill neutral">Rank #{c.rank}</span>
                      {FIT_PILL[c.fit] && <span className={`pill ${FIT_PILL[c.fit].cls}`}>{FIT_PILL[c.fit].text}</span>}
                    </div>
                    <div className="row-gap">
                      <button
                        type="button"
                        className="btn outline small"
                        onClick={() => toggleWhy(roleId)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? 'Hide breakdown' : `Why ${c.match}%?`}
                      </button>
                      <Link to={`/career-details/${roleId}`} className="btn small">
                        <Eye size={13} />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>

                  {isOpen &&
                    (bd?.error ? (
                      <p className="muted text-sm" style={{ margin: 0 }}>
                        Could not load the score breakdown right now. Please try again.
                      </p>
                    ) : (
                      <ScoreBreakdown
                        loading={!bd || bd.loading}
                        score={c.match}
                        matched={bd?.data?.matched_skills || []}
                        missing={bd?.data?.missing_skills || []}
                      />
                    ))}
                </div>
              );
            })}
          </div>

          {recommendations.length > INITIAL_ROLES && (
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn outline small" onClick={() => setShowAllRoles((v) => !v)}>
                <ChevronDown size={14} style={{ transform: showAllRoles ? 'rotate(180deg)' : 'none' }} />
                {showAllRoles ? 'Show top roles only' : `Show all ${recommendations.length} roles`}
              </button>
            </div>
          )}

          {/* POSITIONS RELATED TO THE RESUME */}
          <div className="card card-pad">
            <div className="card-head">
              <div>
                <h3 className="card-title">Positions related to your resume</h3>
                <span className="muted text-xs">
                  {resumeRole ? `Open positions for ${resumeRole} and related roles` : 'Open positions that match your skills'}
                </span>
              </div>
              <Link to="/job-matching" className="link-btn">
                All jobs <ArrowRight size={13} />
              </Link>
            </div>
            {jobMatches.length === 0 ? (
              <p className="muted text-sm" style={{ margin: 0 }}>No matching positions right now.</p>
            ) : (
              <div className="ui-grid cols-2">
                {jobMatches.map((j) => (
                  <Link
                    to={`/job-details/${j.job_id}`}
                    key={j.job_id}
                    className="card card-pad stack"
                    style={{ gap: 8, color: 'inherit', boxShadow: 'none' }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span className="list-icon"><Briefcase size={18} /></span>
                      <div className="list-main">
                        <strong>{j.job_title}</strong>
                        <span className="muted text-sm">{j.company_name}</span>
                      </div>
                      <span className="match-num" style={{ color: `var(--${toneFor(j.match)})` }}>{Math.round(j.match)}%</span>
                    </div>
                    <div className="row-gap" style={{ gap: 6, flexWrap: 'wrap' }}>
                      {j.location && <span className="pill neutral"><MapPin size={12} /> {j.location}</span>}
                      {j.job_type && <span className="pill neutral">{j.job_type}</span>}
                      {j.work_mode && <span className="pill neutral">{j.work_mode}</span>}
                      {FIT_PILL[j.fit] && <span className={`pill ${FIT_PILL[j.fit].cls}`}>{FIT_PILL[j.fit].text}</span>}
                    </div>
                    {j.salary_range && <span className="text-xs muted">{j.salary_range}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
          </>
        )}

        <NextStep
          title="Next: find out what you are missing"
          text="See the exact skill gaps for your top match."
          to="/gap-analysis"
          cta="View my skill gaps"
        />
      </Page>
    </Layout>
  );
}
