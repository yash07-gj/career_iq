import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { mockSkillGaps } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';
import { Link } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

export default function GapAnalysis() {
  const currentUser = auth.getUser();
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(1);
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await api.getCareerRoles();
        if (res && res.length > 0) {
          setRoles(res);
          const defaultRoleId = currentUser?.target_role_id || res[0].career_role_id;
          // check if defaultRoleId actually exists in res
          const roleExists = res.find(r => r.career_role_id === defaultRoleId);
          setSelectedRoleId(roleExists ? defaultRoleId : res[0].career_role_id);
        }
      } catch (e) {
        console.warn('Roles fetch fallback:', e);
      }
    }
    loadRoles();
  }, []);

  useEffect(() => {
    async function loadGaps() {
      setLoading(true);
      try {
        const res = await api.getGapAnalysis(selectedRoleId, currentUser?.user_id);
        if (res) {
          setGapData(res);
        }
      } catch (e) {
        console.warn('Gap analysis fallback:', e);
      } finally {
        setLoading(false);
      }
    }
    loadGaps();
  }, [selectedRoleId, currentUser?.user_id]);

  const rawMatchedSkills = gapData?.matched_skills || [];
  const missingSkills = gapData?.missing_skills || [];
  const readinessScore = gapData?.readiness_score || 0;

  // Strict Mutual Exclusivity: Skills mentioned in Missing / Skill Deficiencies must NOT appear in Verified Acquired Skills
  const missingNamesSet = new Set(
    missingSkills.map((m) => (typeof m === 'string' ? m : m.name || '').trim().toLowerCase())
  );
  const matchedSkills = rawMatchedSkills.filter((s) => {
    const name = (typeof s === 'string' ? s : s.name || '').trim().toLowerCase();
    return name && !missingNamesSet.has(name);
  });

  return (
    <Layout>
      <Page
        title="Skill Gap Analysis"
        subtitle="Identify exact missing skills and critical prerequisites for your target career role"
      >
        <div className="card card-pad">
          {/* Target Role Selector & Readiness Badge */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div>
              <div className="label" style={{ marginBottom: 6, fontWeight: 700, color: '#475569' }}>
                Select Target Career Role
              </div>
              <select
                className="select"
                style={{ width: 280, padding: '9px 12px', fontSize: 14 }}
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              >
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <option key={r.career_role_id} value={r.career_role_id}>
                      {r.role_name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={1}>Data Analyst</option>
                    <option value={2}>Data Scientist</option>
                    <option value={3}>Machine Learning Engineer</option>
                    <option value={4}>Full Stack Developer</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="pill blue" style={{ fontSize: 13, padding: '6px 14px' }}>
                Role Readiness: <strong>{readinessScore}%</strong>
              </span>
              <span className={`pill ${missingSkills.length > 0 ? 'orange' : 'green'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                {missingSkills.length} Skills to Develop
              </span>
            </div>
          </div>

          {/* If No Resume Uploaded Yet Prompt */}
          {matchedSkills.length === 0 && missingSkills.length === 0 && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: '24px',
                textAlign: 'center',
                color: '#1e40af',
                marginBottom: 20,
              }}
            >
              <Sparkles size={32} style={{ margin: '0 auto 10px', color: '#2563eb' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No Skills Detected Yet</h4>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#3b82f6', maxWidth: 480, marginInline: 'auto' }}>
                Upload your resume so our AI engine can compare your verified skills against industry role benchmarks.
              </p>
              <Link to="/resume" className="btn small">
                Upload Resume Now <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* 2-Column Skill Comparison Grid */}
          <div className="grid grid-2">
            {/* Matched Skills */}
            <div className="card" style={{ background: '#f8fafc', padding: 18 }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f766e', marginBottom: 14 }}>
                <CheckCircle2 size={18} color="#10b981" /> Verified Acquired Skills ({matchedSkills.length})
              </h3>
              {matchedSkills.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>0 skills matched from resume.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {matchedSkills.map((s) => (
                    <div
                      key={s}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills / Deficiencies */}
            <div className="card" style={{ background: '#f8fafc', padding: 18 }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#be123c', marginBottom: 14 }}>
                <XCircle size={18} color="#ef4444" /> Missing / Skill Deficiencies ({missingSkills.length})
              </h3>
              {missingSkills.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No missing skills found for this role!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {missingSkills.map((s) => (
                    <div
                      key={s.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <XCircle size={16} color="#ef4444" />
                        <strong>{s.name}</strong>
                      </div>
                      <span className={`pill ${s.priority === 'High' ? 'red' : s.priority === 'Medium' ? 'orange' : 'green'}`}>
                        {s.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skill Priority Roadmap preview */}
          {missingSkills.length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  Recommended Skill Learning Priorities
                </h3>
                <Link to="/roadmap" style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Open Roadmap <ArrowRight size={14} />
                </Link>
              </div>

              {missingSkills.map((s, i) => (
                <div className="bar-row" key={s.name} style={{ marginBottom: 12 }}>
                  <span className="bar-label" style={{ width: 140 }}>
                    {i + 1}. {s.name}
                  </span>
                  <div className="bar-bg">
                    <div
                      className={`bar ${s.priority === 'High' ? 'red' : s.priority === 'Medium' ? 'orange' : 'green'}`}
                      style={{ width: `${Math.max(30, 100 - i * 18)}%` }}
                    />
                  </div>
                  <span className={`pill ${s.priority === 'High' ? 'red' : s.priority === 'Medium' ? 'orange' : 'green'}`}>
                    {s.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Page>
    </Layout>
  );
}
