import React, { useEffect, useState } from 'react';
import { TrendingUp, Lightbulb, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { marketDataFor } from '../mockData/marketData';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';
import auth from '../utils/auth';

// The market figures are static reference data (see mockData/marketData.js).
// Only the choice of data set depends on the user's uploaded resume.
export default function MarketIntelligence() {
  const currentUser = auth.getUser();
  const [resumeRole, setResumeRole] = useState(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    api
      .getRecommendations(currentUser.user_id)
      .then((recs) => {
        if (Array.isArray(recs) && recs.length > 0) {
          setResumeRole((recs.find((r) => r.fit === 'resume') || recs[0]).role);
        }
      })
      .catch(() => {});
  }, [currentUser?.user_id]);

  const market = marketDataFor(resumeRole);

  return (
    <Layout>
      <Page title="Job Market Intelligence" subtitle="Explore in-demand skills and industry trends">
        <div className="notice info">
          <FileSearch size={20} />
          <div className="notice-main text-sm">
            {resumeRole ? (
              <>Showing the <strong>{market.label}</strong> job market, based on your resume: <strong>{resumeRole}</strong>.</>
            ) : (
              <>Showing the overall technology job market. Upload your resume to see the market for your career.</>
            )}
          </div>
          {!resumeRole && (
            <Link to="/resume" className="btn small">Upload Resume</Link>
          )}
        </div>

        <div className="ui-grid cols-2">
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Most In-Demand Skills</h3>
              <span className="muted text-xs">{market.label}</span>
            </div>
            {market.skills.map((s, i) => (
              <div className="bar-row" key={s.name}>
                <span className="bar-label">{s.name}</span>
                <div className="bar-bg">
                  <div className={'bar ' + (i < 2 ? 'green' : i < 4 ? '' : 'purple')} style={{ width: s.demand + '%' }} />
                </div>
                <b className="bar-num">{s.demand}%</b>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Trending Job Roles</h3>
            </div>
            {market.roles.map((x) => (
              <div className="list-row" key={x.name}>
                <span className="list-icon"><TrendingUp size={16} /></span>
                <div className="list-main">
                  <strong>{x.name}</strong>
                  <span>{x.note}</span>
                </div>
                <span className="pill good">+{x.growth}%</span>
              </div>
            ))}
            <div className="notice info" style={{ marginTop: 14 }}>
              <Lightbulb size={18} />
              <div className="notice-main">
                <span className="muted text-xs" style={{ display: 'block' }}>Market Insight</span>
                <strong>{market.insight}</strong>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </Layout>
  );
}
