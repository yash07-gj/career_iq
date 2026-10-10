import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, BookOpen, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { Link } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

export default function Roadmap() {
  const currentUser = auth.getUser();
  const [roadmap, setRoadmap] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      if (!currentUser?.user_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getRoadmap(currentUser.user_id);
        if (res) {
          setRoadmap(res);
        }
      } catch (err) {
        console.warn('Roadmap fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [currentUser?.user_id]);

  const steps = roadmap?.steps || [];
  const hasSteps = steps.length > 0;

  return (
    <Layout>
      <Page
        title="Your Career Roadmap"
        subtitle={roadmap?.title || "Step-by-step learning milestones to bridge your career skill gaps"}
      >
        {!hasSteps ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '56px 20px', color: '#64748b' }}>
            <Sparkles size={48} color="#93c5fd" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: 20, fontWeight: 800 }}>
              No Career Roadmap Generated Yet
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', maxWidth: 520, marginInline: 'auto', lineHeight: 1.6 }}>
              Upload your resume so our AI engine can calculate your specific skill deficiencies and generate an accelerated 30-day learning roadmap tailored to your dream career.
            </p>
            <Link to="/resume" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Upload Resume to Build Roadmap <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {/* Milestone Timeline */}
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 className="card-title" style={{ margin: 0 }}>Milestone Timeline</h3>
                <span className="pill blue">Target: {roadmap.target_role}</span>
              </div>

              <div className="timeline">
                {steps.map((s) => (
                  <div
                    className="step"
                    key={s.roadmap_step_id || s.step_number}
                    onClick={() => setActiveStep(s.step_number)}
                    style={{
                      cursor: 'pointer',
                      background: activeStep === s.step_number ? '#f8fafc' : 'transparent',
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      className="step-dot"
                      style={{
                        background:
                          s.completion_status === 'completed'
                            ? 'var(--green)'
                            : activeStep === s.step_number
                            ? 'var(--blue)'
                            : '#dce8f5',
                        color: activeStep === s.step_number || s.completion_status === 'completed' ? '#fff' : '#64748b',
                      }}
                    >
                      {s.completion_status === 'completed' ? <CheckCircle2 size={13} /> : s.step_number}
                    </div>
                    <div className="step-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>Master {s.skill_name}</strong>
                        <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {s.expected_days} Days
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                        Curated resource: {s.resource_title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Learning Resources mapped to selected step */}
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 6 }}>
                Curated Learning Resources
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>
                Recommended study material for Milestone {activeStep}.
              </p>

              {steps
                .filter((s) => s.step_number === activeStep)
                .map((s) => (
                  <div
                    className="resource"
                    key={s.roadmap_step_id || s.step_number}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 16,
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 8,
                          background: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563eb',
                        }}
                      >
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>{s.resource_title}</strong>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                          Provider: <strong>{s.provider}</strong> · Type: {s.resource_type}
                        </div>
                      </div>
                    </div>

                    <a
                      href={s.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn small"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      Study <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Page>
    </Layout>
  );
}
