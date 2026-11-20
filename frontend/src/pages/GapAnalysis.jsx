import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, EmptyState } from '../components/ui';
import { SkillDonut, SkillLevelBars } from '../components/charts';
import { toneFor } from '../utils/career';
import { Link } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

const priorityTone = (p) => (p === 'High' ? 'bad' : p === 'Medium' ? 'warn' : 'good');

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

  const rawMatched = gapData?.matched_skills || [];
  const rawMissing = gapData?.missing_skills || [];
  const readinessScore = gapData?.readiness_score || 0;

  // STRICT RULE: Any skill mentioned in Missing / Skill Deficiencies
  // must NOT be mentioned in Verified Acquired Skills!
  const missingSkillNamesSet = new Set(
    rawMissing.map((m) => (typeof m === 'string' ? m : m.name)?.toLowerCase().trim()).filter(Boolean)
  );

  const matchedSkills = rawMatched.filter((s) => {
    const name = (typeof s === 'string' ? s : s.name)?.toLowerCase().trim();
    return name && !missingSkillNamesSet.has(name);
  });
  const missingSkills = rawMissing;

  // Chart data: missing skills first, then matched skills (matched = meets the requirement)
  const levelMax = Math.max(5, ...missingSkills.map((m) => Number(m.required_level) || 0));
  const levelSkills = [
    ...missingSkills.map((m) => ({
      name: typeof m === 'string' ? m : m.name,
      current: Number(m.current_level) || 0,
      required: Number(m.required_level) || 4,
    })),
    ...matchedSkills.map((s) => ({ name: typeof s === 'string' ? s : s.name, current: 4, required: 4 })),
  ].slice(0, 10);
  const partialCount = missingSkills.filter((m) => (Number(m.current_level) || 0) > 0).length;
  const coverage = {
    have: matchedSkills.length,
    partial: partialCount,
    missing: missingSkills.length - partialCount,
  };

  const tone = toneFor(readinessScore);
  const noData = matchedSkills.length === 0 && missingSkills.length === 0;

  return (
    <Layout>
      <Page
        title="Skill Gap Analysis"
        subtitle="Identify exact missing skills and critical prerequisites for your target career role"
        action={
          <div className="form-group" style={{ margin: 0, minWidth: 240 }}>
            <label className="label" htmlFor="gap-role">Select Target Career Role</label>
            <select
              id="gap-role"
              className="select"
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
        }
      >
        <JourneyBar current="gap" />

        {/* If No Resume Uploaded Yet Prompt */}
        {noData && !loading && (
          <div className="card card-pad">
            <EmptyState
              icon={Sparkles}
              title="No Skills Detected Yet"
              text="Upload your resume so our AI engine can compare your verified skills against industry role benchmarks."
              action={
                <Link to="/resume" className="btn small">
                  Upload Resume Now <ArrowRight size={14} />
                </Link>
              }
            />
          </div>
        )}

        <div className="ui-grid split">
          {/* Skill coverage donut + readiness */}
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Skill coverage</h3>
              <div className="row-gap">
                <span className={`pill ${tone}`}>
                  Role Readiness: <strong>{readinessScore}%</strong>
                </span>
                <span className={`pill ${missingSkills.length > 0 ? 'warn' : 'good'}`}>
                  {missingSkills.length} Skills to Develop
                </span>
              </div>
            </div>
            <SkillDonut
              counts={coverage}
              score={readinessScore}
              title={`Skill coverage for ${gapData?.target_role || 'target role'}`}
            />
          </div>

          {/* Missing + matched skills */}
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title row-gap">
                <XCircle size={18} className="text-bad" /> Missing / Skill Deficiencies ({missingSkills.length})
              </h3>
            </div>
            {missingSkills.length === 0 ? (
              <p className="muted text-sm">No missing skills found for this role!</p>
            ) : (
              <div>
                {missingSkills.map((s) => (
                  <div className="list-row" key={s.name}>
                    <span className="list-icon bad"><XCircle size={18} /></span>
                    <div className="list-main">
                      <strong>{s.name}</strong>
                      <span className="num">Level {s.current_level || 0} of {s.required_level}</span>
                    </div>
                    <div className="list-end">
                      <span className={`pill ${priorityTone(s.priority)}`}>{s.priority} Priority</span>
                      <Link to="/learning-resources" className="btn outline small" aria-label={`Learn ${s.name}`}>
                        <BookOpen size={14} /> Learn
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card-head" style={{ marginTop: 18 }}>
              <h3 className="card-title row-gap">
                <CheckCircle2 size={18} className="text-good" /> Verified Acquired Skills ({matchedSkills.length})
              </h3>
            </div>
            {matchedSkills.length === 0 ? (
              <p className="muted text-sm">0 skills matched from resume.</p>
            ) : (
              <div className="chips">
                {matchedSkills.map((s) => (
                  <span className="pill good" key={s}>✓ {s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Your level vs required level */}
        {levelSkills.length > 0 && (
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Your level vs required level</h3>
              <span className="muted text-xs">Hover a skill for details</span>
            </div>
            <SkillLevelBars
              skills={levelSkills}
              max={levelMax}
              title={`Skill levels for ${gapData?.target_role || 'target role'}`}
            />
          </div>
        )}

        {/* Skill Priority preview */}
        {missingSkills.length > 0 && (
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Recommended Skill Learning Priorities</h3>
              <Link to="/roadmap" className="link-btn">
                Open Roadmap <ArrowRight size={14} />
              </Link>
            </div>
            {missingSkills.map((s, i) => (
              <div className="bar-row" key={s.name} style={{ gridTemplateColumns: 'minmax(0, 150px) minmax(0, 1fr) auto' }}>
                <span className="bar-label">{i + 1}. {s.name}</span>
                <div className="bar-bg">
                  <div
                    className={`bar ${s.priority === 'High' ? 'red' : s.priority === 'Medium' ? 'orange' : 'green'}`}
                    style={{ width: `${Math.max(30, 100 - i * 18)}%` }}
                  />
                </div>
                <span className={`pill ${priorityTone(s.priority)}`}>{s.priority}</span>
              </div>
            ))}
          </div>
        )}

        <NextStep
          title="Next: close the gap with a plan"
          text="Your roadmap turns these gaps into milestones."
          to="/roadmap"
          cta="Build my roadmap"
        />
      </Page>
    </Layout>
  );
}
