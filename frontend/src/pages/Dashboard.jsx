import React from 'react';
import { Target, Award, BrainCircuit, ShieldAlert, ArrowRight, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';
import { mockUserProfile, mockCareerRecommendations, mockMarketSkills } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <Layout>
      <Page title="Dashboard" subtitle="Comprehensive overview of your real-time AI career intelligence">
        {/* TOP METRIC CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[
            [Target, 'Career Readiness', '78%', 'green', 'Above average (+12%)'],
            [Award, 'Top Career Match', '89% Match', 'orange', 'Data Analyst'],
            [BrainCircuit, 'Total Skills Found', '12', 'blue', '4 Core & 8 Secondary'],
            [ShieldAlert, 'Missing Skills', '5', 'red', 'Critical for target role']
          ].map(([Icon, label, val, color, sub]) => (
            <div className="card metric" key={label}>
              <div 
                className="metric-icon" 
                style={{
                  background: color === 'green' ? '#ecfdf5' : color === 'red' ? '#fef2f2' : color === 'orange' ? '#fffbeb' : '#eff6ff'
                }}
              >
                <Icon size={24} color={color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : color === 'orange' ? '#f59e0b' : '#2563eb'} />
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
              <Link to="/recommendations" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <ArrowRight size={13} />
              </Link>
            </div>
            
            {mockCareerRecommendations.slice(0, 4).map((c) => (
              <div className="reco-item" key={c.id}>
                <div className="role-icon">
                  <Award size={18} />
                </div>
                <div className="reco-main">
                  <strong>{c.role}</strong>
                  <span>{c.desc}</span>
                </div>
                <div className="match">{c.match}%</div>
              </div>
            ))}
          </div>

          {/* SKILL DISTRIBUTION */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Market Skill Demand</h3>
              <Link to="/gap-analysis" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Gap Analysis <ArrowRight size={13} />
              </Link>
            </div>

            {mockMarketSkills.slice(0, 5).map((s, i) => (
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

            <div style={{ marginTop: 20, padding: 14, background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 10, fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrendingUp size={16} />
              <span><strong>AI Actionable Tip:</strong> Master Power BI and Pandas to increase readiness score to 86%.</span>
            </div>
          </div>
        </div>
      </Page>
    </Layout>
  );
}
