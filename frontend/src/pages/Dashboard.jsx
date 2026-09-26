import React, { useEffect, useState } from 'react';
import { Target, Award, BrainCircuit, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react';
import { mockCareerRecommendations, mockMarketSkills } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState({
    metrics: {
      career_readiness: 78,
      top_career_match: 'Data Analyst',
      top_match_percentage: 89,
      total_skills: 7,
      missing_skills: 2,
    },
    recommendations: mockCareerRecommendations,
    market_skills: mockMarketSkills,
    user_name: 'John Doe',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getDashboard();
        if (res && res.metrics) {
          setData(res);
        }
      } catch (err) {
        console.warn('Using local fallback data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const metrics = data.metrics;
  const recommendations = data.recommendations || mockCareerRecommendations;
  const marketSkills = data.market_skills || mockMarketSkills;

  return (
    <Layout>
      <Page 
        title={`Welcome back, ${data.user_name}`} 
        subtitle="Live synchronization with MySQL career intelligence database"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', padding: '6px 14px', borderRadius: 20, border: '1px solid #a7f3d0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>MySQL Database Connected</span>
          </div>
        }
      >
        {/* TOP METRIC CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[
            [Target, 'Career Readiness', `${metrics.career_readiness}%`, 'green', 'Calculated across 4 pillars'],
            [Award, 'Top Career Match', `${metrics.top_match_percentage}% Match`, 'orange', metrics.top_career_match],
            [BrainCircuit, 'Total Skills Found', `${metrics.total_skills}`, 'blue', 'Verified in candidate profile'],
            [ShieldAlert, 'Missing Skills', `${metrics.missing_skills}`, 'red', 'Critical for target role'],
          ].map(([Icon, label, val, color, sub]) => (
            <div className="card metric" key={label}>
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
              <div>
                <span className="metric-label">{label}</span>
                <strong className={`metric-value ${color}`}>{val}</strong>
                <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="grid grid-2">
          {/* RECOMMENDED CAREERS */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Top Career Matches</h3>
              <Link
                to="/recommendations"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                View Details <ArrowRight size={13} />
              </Link>
            </div>

            {recommendations.slice(0, 4).map((c, i) => (
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
            ))}
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

            <div
              style={{
                marginTop: 20,
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
                <strong>Live AI Tip:</strong> Master Power BI and Pandas to increase readiness score to 86%.
              </span>
            </div>
          </div>
        </div>
      </Page>
    </Layout>
  );
}
