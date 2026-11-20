// =============================================================================
// CareerIQ — Chart components (pure React + SVG + CSS, no chart library)
//   SkillDonut     : glowing ring chart of skills you Have / Partly have / Miss
//   SkillLevelBars : "Your level vs Required" horizontal bars per skill
// Styles: src/styles/charts.css
// =============================================================================
import React, { useState } from 'react';
import '../styles/charts.css';

const SEGMENTS = [
  { key: 'have', label: 'Have', color: 'var(--good)' },
  { key: 'partial', label: 'Partial', color: 'var(--warn)' },
  { key: 'missing', label: 'Missing', color: 'var(--bad)' },
];

/**
 * Donut chart with the readiness % in the centre.
 * counts: { have, partial, missing }   score: readiness 0–100
 */
export function SkillDonut({ counts, score = 0, title = 'Skill coverage' }) {
  const [active, setActive] = useState(null);
  const total = SEGMENTS.reduce((t, s) => t + (counts[s.key] || 0), 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  const gap = total > 1 ? 4 : 0; // small gap between segments

  // Each segment starts where the previous one ended
  const arcs = SEGMENTS.filter((s) => counts[s.key] > 0).reduce((list, s) => {
    const len = (counts[s.key] / total) * C;
    const prev = list[list.length - 1];
    const start = prev ? prev.start + prev.full : 0;
    return [...list, { ...s, value: counts[s.key], full: len, len: Math.max(len - gap, 1), start }];
  }, []);

  const current = arcs.find((a) => a.key === active);
  const shownScore = Number.isInteger(Number(score)) ? Number(score) : Number(score).toFixed(1);
  const summary = SEGMENTS.map((s) => `${counts[s.key] || 0} ${s.label.toLowerCase()}`).join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 200 200" role="img" aria-label={`${title}: readiness ${shownScore} percent; ${summary}`}>
          <defs>
            <filter id="donutGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="18" />
          {total === 0 && <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth="18" />}
          {arcs.map((a, i) => (
            <circle
              key={a.key}
              className={`donut-seg ${active === a.key ? 'is-active' : ''} ${active && active !== a.key ? 'is-dim' : ''}`}
              cx="100" cy="100" r={R} fill="none"
              stroke={a.color}
              strokeWidth="18"
              strokeLinecap="butt"
              strokeDasharray={`${a.len} ${C}`}
              strokeDashoffset={-a.start}
              transform="rotate(-90 100 100)"
              filter={active === a.key ? 'url(#donutGlow)' : undefined}
              style={{ '--len': a.len, '--c': C, animationDelay: `${i * 0.15}s` }}
              onMouseEnter={() => setActive(a.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(a.key)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              aria-label={`${a.label}: ${a.value} skill${a.value === 1 ? '' : 's'}`}
            />
          ))}
          <text x="100" y="98" textAnchor="middle" className="donut-value" fill="var(--ink)">
            {current ? current.value : `${shownScore}%`}
          </text>
          <text x="100" y="120" textAnchor="middle" className="donut-cap" fill="var(--muted)">
            {current ? `${current.label} skill${current.value === 1 ? '' : 's'}` : 'Role readiness'}
          </text>
        </svg>
      </div>

      <ul className="donut-legend">
        {SEGMENTS.map((s) => (
          <li
            key={s.key}
            className={active === s.key ? 'is-active' : ''}
            onMouseEnter={() => counts[s.key] > 0 && setActive(s.key)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="legend-dot" style={{ background: s.color, color: s.color }} />
            <span className="legend-label">{s.label}</span>
            <strong className="num">{counts[s.key] || 0}</strong>
            <span className="legend-pct muted num">{total ? Math.round(((counts[s.key] || 0) / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Horizontal bars comparing the candidate's level with the required level.
 * skills: [{ name, current, required }]   max: top of the scale
 */
export function SkillLevelBars({ skills = [], max = 5, title = 'Your level vs required level' }) {
  const [active, setActive] = useState(null);
  if (skills.length === 0) return null;

  return (
    <div className="lvl" role="img" aria-label={`${title}: ${skills.map((s) => `${s.name} ${s.current} of ${s.required}`).join('; ')}`}>
      <div className="lvl-legend" aria-hidden="true">
        <span><i className="lvl-swatch good" /> Meets</span>
        <span><i className="lvl-swatch warn" /> Partial</span>
        <span><i className="lvl-swatch bad" /> Missing</span>
        <span><i className="lvl-marker-key" /> Required level</span>
      </div>
      {skills.map((s, i) => {
        const status = s.current >= s.required ? 'good' : s.current > 0 ? 'warn' : 'bad';
        const pct = Math.max((s.current / max) * 100, status === 'bad' ? 2 : 0);
        const req = (s.required / max) * 100;
        const statusText = status === 'good' ? 'Meets requirement' : status === 'warn' ? 'Partially there' : 'Not started';
        return (
          <div
            key={s.name}
            className={`lvl-row ${active === s.name ? 'is-active' : ''}`}
            onMouseEnter={() => setActive(s.name)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="lvl-name" title={s.name}>{s.name}</span>
            <div className="lvl-track">
              <div className={`lvl-fill ${status}`} style={{ width: `${pct}%`, animationDelay: `${0.1 + i * 0.05}s` }} />
              <span className="lvl-marker" style={{ left: `${req}%` }} />
              {active === s.name && (
                <div className={`lvl-tip ${req > 60 ? 'left' : ''}`} style={{ left: `${Math.min(Math.max(req, 8), 92)}%` }}>
                  <strong>{s.name}</strong>
                  <span>Level {s.current} of {s.required} · {statusText}</span>
                </div>
              )}
            </div>
            <span className={`lvl-val num text-${status}`}>{s.current}/{s.required}</span>
          </div>
        );
      })}
    </div>
  );
}
