import React, { useState, useEffect } from 'react';
import { Eye, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, ScoreBreakdown, EmptyState } from '../components/ui';
import { toneFor } from '../utils/career';
import api from '../services/api';
import auth from '../utils/auth';

// Maps a score tone to the bar colour class used by .bar
const BAR_CLASS = { good: 'green', warn: 'orange', bad: 'red' };

export default function Recommendations() {
  const currentUser = auth.getUser();
  const [recommendations, setRecommendations] = useState([]);
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
        const res = await api.getRecommendations(currentUser.user_id);
        if (res) {
          setRecommendations(res);
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
          <div className="ui-grid cols-2">
            {recommendations.map((c) => {
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
                    <span className="pill info">Rank #{c.rank}</span>
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
