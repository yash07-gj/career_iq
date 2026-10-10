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
    user_name: currentUser?.full_name || 'Candidate',
    has_resume: false,
    resume_filename: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentUser?.user_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getDashboard(currentUser.user_id);
        if (res && res.metrics) {
          setData({
            ...res,
            user_name: currentUser.full_name || res.user_name,
          });
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
              hasResume ? 'Calculated from your resume' : 'Upload resume to calculate'
            ],
            [
              Award,
              'Top Career Match',
              metrics.top_match_percentage > 0 ? `${metrics.top_match_percentage}% Match` : '0% Match',
              metrics.top_match_percentage > 0 ? 'orange' : 'blue',
              metrics.top_career_match
            ],
            [
              BrainCircuit,
              'Total Skills Found',
              `${metrics.total_skills}`,
              'blue',
              hasResume ? 'Extracted from your resume' : '0 skills detected'
            ],
            [
              ShieldAlert,
              'Missing Skills',
              `${metrics.missing_skills}`,
              metrics.missing_skills > 0 ? 'red' : 'blue',
              hasResume ? 'Identified for target role' : 'Pending resume upload'
            ],
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
                <strong>Live AI Tip:</strong> {hasResume ? 'Master top missing skills in your roadmap to boost role readiness!' : 'Upload your resume to receive custom AI tips and tailored skill gaps.'}
              </span>
            </div>
          </div>
        </div>
      </Page>
    </Layout>
  );
}

