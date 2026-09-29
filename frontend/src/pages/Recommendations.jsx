import React from 'react';
import { Award, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockCareerRecommendations } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';

export default function Recommendations() {
  return (
    <Layout>
      <Page title="Recommended Careers" subtitle="Based on your skills and profile">
        <div className="card card-pad">
          {mockCareerRecommendations.map((c) => (
            <div className="reco-item" key={c.id}>
              <div className="role-icon">
                <Award size={18} />
              </div>
              <div className="reco-main">
                <strong>{c.role}</strong>
                <span>{c.desc}</span>
                <div style={{ marginTop: 6 }}>
                  <span className="pill blue">{c.category}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                <div className="match">{c.match}%</div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Match</span>
              </div>
              <Link
                to={`/career-details/${c.id}`}
                className="btn small"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none'
                }}
              >
                <Eye size={13} />
                <span>View Details</span>
              </Link>
            </div>
          ))}
        </div>
      </Page>
    </Layout>
  );
}
