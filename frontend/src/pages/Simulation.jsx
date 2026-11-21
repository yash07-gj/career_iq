import React, { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle2, ArrowRight, FileText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, Gauge, EmptyState } from '../components/ui';
import { toneFor } from '../utils/career';
import api from '../services/api';
import auth from '../utils/auth';

/**
 * What-If simulation based on the uploaded resume:
 * - Target career list comes from the resume's recommendations (resume role first)
 * - Current skills are the skills found in the resume
 * - "Add Skills" lists the skills the chosen role still needs, biggest readiness gain first
 * - The predicted score is calculated by the backend with the same formula as Career Readiness
 */
export default function Simulation() {
  const currentUser = auth.getUser();
  const [options, setOptions] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');

  // Load roles / skills for the chosen role (first load picks the resume's role)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.getSimulationOptions(currentUser?.user_id, roleId);
        if (cancelled || !res) return;
        setOptions(res);
        if (roleId == null) setRoleId(res.selected_role_id);
        // Pre-select the two skills with the biggest gain
        setSelected((res.addable_skills || []).slice(0, 2).map((s) => s.skill_id));
        setResult(null);
      } catch (err) {
        if (!cancelled) setError('Could not load simulation data. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentUser?.user_id, roleId]);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setResult(null);
  };

  const runSimulation = async () => {
    if (!options) return;
    setSimulating(true);
    setError('');
    try {
      const res = await api.simulate(options.selected_role_id, selected, currentUser?.user_id);
      setResult(res);
    } catch (err) {
      setError('Simulation failed. Please try again.');
    } finally {
      setSimulating(false);
    }
  };

  const currentScore = result ? result.current_score : options?.current_score || 0;
  const predicted = result ? result.simulated_score : currentScore;
  const delta = result ? result.score_delta : 0;
  const addable = options?.addable_skills || [];
  const roleName = options?.selected_role || 'target role';

  return (
    <Layout>
      <Page title="What-If Career Simulation" subtitle="See how adding new skills can improve your career chances">
        <JourneyBar current="simulation" />

        {!loading && options && !options.has_resume && (
          <div className="notice info">
            <FileText size={20} />
            <div className="notice-main text-sm">
              Upload your resume so the simulation can use your real skills and the career that fits your resume.
            </div>
            <Link to="/resume" className="btn small">Upload Resume <ArrowRight size={14} /></Link>
          </div>
        )}
        {error && <div className="notice bad text-sm">{error}</div>}

        <div className="ui-grid cols-2">
          <div className="card card-pad stack">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label" htmlFor="sim-target">Target Career</label>
              <select
                id="sim-target"
                className="select"
                value={options?.selected_role_id || ''}
                onChange={(e) => setRoleId(Number(e.target.value))}
                disabled={loading || !options}
              >
                {(options?.roles || []).map((r) => (
                  <option key={r.career_role_id} value={r.career_role_id}>
                    {r.role_name}
                    {r.fit === 'resume' ? ' (from your resume)' : ''}
                    {r.match != null ? ` — ${Math.round(r.match)}% match` : ''}
                  </option>
                ))}
              </select>
              {options?.resume_role && (
                <span className="muted text-xs" style={{ marginTop: 4, display: 'block' }}>
                  Your resume is for <strong>{options.resume_role}</strong>.
                </span>
              )}
            </div>

            <div>
              <h3 className="card-title" style={{ marginBottom: 10 }}>Current Skills</h3>
              <div className="chips">
                {loading ? (
                  <span className="muted text-sm">Loading…</span>
                ) : (options?.current_skills || []).length === 0 ? (
                  <span className="muted text-sm">No skills found yet — upload your resume.</span>
                ) : (
                  options.current_skills.map((s) => (
                    <span className="pill good" key={s}>
                      <CheckCircle2 size={12} /> {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="card-title" style={{ marginBottom: 10 }}>
                Add Skills <span className="muted text-sm" style={{ fontWeight: 400 }}>(Skills {roleName} needs that your resume is missing)</span>
              </h3>
              {loading ? (
                <span className="muted text-sm">Loading…</span>
              ) : addable.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nothing to add"
                  text={`Your resume already covers every skill ${roleName} needs.`}
                />
              ) : (
                <div className="stack" style={{ gap: 8 }}>
                  {addable.map((s) => (
                    <label className={`chk ${selected.includes(s.skill_id) ? 'on' : ''}`} key={s.skill_id}>
                      <input type="checkbox" checked={selected.includes(s.skill_id)} onChange={() => toggle(s.skill_id)} />
                      <span style={{ flex: 1 }}>
                        {s.name}
                        <span className="muted text-xs">
                          {' '}· {s.status === 'missing' ? 'not in resume' : `improve level ${s.current_level} → ${s.required_level}`}
                        </span>
                      </span>
                      <span className="text-xs text-good" style={{ fontWeight: 700 }}>+{s.gain}%</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn block"
              onClick={runSimulation}
              disabled={loading || simulating || !options || selected.length === 0}
            >
              {simulating ? <><RefreshCw size={15} className="animate-spin" /> Simulating…</> : 'Simulate'}
            </button>
          </div>

          <div className="card card-pad stack">
            <h3 className="card-title">Career Readiness for {roleName}</h3>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}
            >
              <div style={{ flex: '1 1 140px', maxWidth: 200 }}>
                <Gauge value={currentScore} label="Career Readiness" color={`var(--${toneFor(currentScore)})`} />
              </div>
              <span className="muted" aria-hidden="true"><ArrowRight size={22} /></span>
              <div style={{ flex: '1 1 140px', maxWidth: 200 }}>
                <Gauge value={predicted} label="Predicted Readiness" color="var(--good)" />
              </div>
            </div>
            {result ? (
              <div className="notice good">
                <TrendingUp size={18} />
                <div className="notice-main">
                  <strong>
                    {delta > 0
                      ? `Your readiness could improve by ${delta}%`
                      : 'These skills would not change your readiness for this role'}
                  </strong>
                  {result.added_skills?.length > 0 && (
                    <p className="muted text-sm" style={{ margin: '2px 0 0' }}>
                      By learning {result.added_skills.join(', ')}.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="muted text-sm" style={{ margin: 0 }}>
                Select the skills you plan to learn and press <strong>Simulate</strong> to see your predicted readiness.
              </p>
            )}
          </div>
        </div>

        <NextStep
          title="Next: find jobs that match you"
          text="Apply to roles where your match is strongest."
          to="/job-matching"
          cta="Find matching jobs"
        />
      </Page>
    </Layout>
  );
}
