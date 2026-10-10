import React, { useState, useEffect } from 'react';
import { Award, Eye, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';
import auth from '../utils/auth';

export default function Recommendations() {
  const currentUser = auth.getUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <Page title="Recommended Careers" subtitle="AI role recommendations tailored from your verified resume skills">
        <div className="card card-pad">
          {recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
              <FileText size={44} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#334155', fontSize: 18 }}>No Career Recommendations Generated Yet</h3>
              <p style={{ margin: '0 0 20px', fontSize: 14, maxWidth: 500, marginInline: 'auto' }}>
                Upload your resume to discover your tailored AI career recommendations, alignment percentages, and target roles.
              </p>
              <Link to="/resume" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Upload Resume Now <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            recommendations.map((c) => (
              <div className="reco-item" key={c.career_recommendation_id || c.career_role_id}>
                <div className="role-icon">
                  <Award size={18} />
                </div>
                <div className="reco-main">
                  <strong>{c.role}</strong>
                  <span>{c.desc || c.summary_explanation}</span>
                  <div style={{ marginTop: 6 }}>
                    <span className="pill blue">Rank #{c.rank}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div className="match">{c.match}%</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Match</span>
                </div>
                <Link
                  to={`/career-details/${c.career_role_id}`}
                  className="btn small"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: 'none',
                  }}
                >
                  <Eye size={13} />
                  <span>View Details</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </Page>
    </Layout>
  );
}
