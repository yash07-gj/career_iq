import React, { useState } from 'react';
import { TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, Gauge } from '../components/ui';

const skills = ['Machine Learning', 'Scikit-learn', 'Deep Learning', 'TensorFlow', 'Data Visualization'];

export default function Simulation() {
  const [selected, setSelected] = useState(['Machine Learning', 'Scikit-learn']);
  const [score, setScore] = useState(65);
  const toggle = (s) => setSelected(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);
  const predicted = Math.min(95, score + 13);

  return (
    <Layout>
      <Page title="What-If Career Simulation" subtitle="See how adding new skills can improve your career chances">
        <JourneyBar current="simulation" />

        <div className="ui-grid cols-2">
          <div className="card card-pad stack">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label" htmlFor="sim-target">Target Career</label>
              <select id="sim-target" className="select">
                <option>Data Scientist</option>
                <option>Data Analyst</option>
              </select>
            </div>

            <div>
              <h3 className="card-title" style={{ marginBottom: 10 }}>Current Skills</h3>
              <div className="chips">
                {['Python', 'SQL', 'Pandas', 'Excel'].map((s) => (
                  <span className="pill good" key={s}>
                    <CheckCircle2 size={12} /> {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="card-title" style={{ marginBottom: 10 }}>
                Add Skills <span className="muted text-sm" style={{ fontWeight: 400 }}>(Select skills to simulate)</span>
              </h3>
              <div className="stack" style={{ gap: 8 }}>
                {skills.map((s) => (
                  <label className={`chk ${selected.includes(s) ? 'on' : ''}`} key={s}>
                    <input type="checkbox" checked={selected.includes(s)} onChange={() => toggle(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn block" onClick={() => setScore(Math.min(95, 65 + selected.length * 5))}>
              Simulate
            </button>
          </div>

          <div className="card card-pad stack">
            <h3 className="card-title">Career Readiness</h3>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}
            >
              <div style={{ flex: '1 1 140px', maxWidth: 200 }}>
                <Gauge value={score} label="Career Readiness" color="var(--warn)" />
              </div>
              <span className="muted" aria-hidden="true"><ArrowRight size={22} /></span>
              <div style={{ flex: '1 1 140px', maxWidth: 200 }}>
                <Gauge value={predicted} label="Predicted Readiness" color="var(--good)" />
              </div>
            </div>
            <div className="notice good">
              <TrendingUp size={18} />
              <div className="notice-main">
                <strong>Your readiness could improve by 13%</strong>
              </div>
            </div>
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
