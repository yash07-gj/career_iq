// =============================================================================
// CareerIQ — Shared UI components
// Small, reusable building blocks used across pages. Styling lives in
// src/styles/design-system.css (sections 6–11).
// =============================================================================
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { JOURNEY_STEPS } from '../utils/career';

/**
 * Journey progress bar shown at the top of each journey page.
 * Steps before the current one are shown as passed; the current one is highlighted.
 */
export function JourneyBar({ current }) {
  const index = JOURNEY_STEPS.findIndex((s) => s.key === current);
  return (
    <div className="card journey-bar">
      <div className="card-head" style={{ marginBottom: 10 }}>
        <h3 className="card-title" style={{ fontSize: 14 }}>Your career journey</h3>
        {index >= 0 && <span className="muted text-xs">Step {index + 1} of {JOURNEY_STEPS.length}</span>}
      </div>
      <div className="journey-steps">
        {JOURNEY_STEPS.map((s, i) => (
          <Link
            key={s.key}
            to={s.path}
            className={`journey-step ${i === index ? 'current' : i < index ? 'passed' : ''}`}
            aria-current={i === index ? 'step' : undefined}
          >
            <div className="journey-line" />
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** "Next step" banner placed at the bottom of a journey page. */
export function NextStep({ title, text, to, cta }) {
  return (
    <div className="next-step">
      <div>
        <strong>{title}</strong>
        {text && <p>{text}</p>}
      </div>
      <Link to={to} className="btn">
        {cta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/** Circular progress gauge (0–100). The arc animates from empty to the value. */
export function Gauge({ value = 0, label, color = 'var(--accent)', size = 180 }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const C = 2 * Math.PI * 42;
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(C * (1 - safe / 100)));
    return () => cancelAnimationFrame(id);
  }, [safe, C]);

  const shown = Number.isInteger(safe) ? safe : safe.toFixed(1);
  return (
    <div className="gauge" style={{ maxWidth: size, width: '100%', margin: '0 auto' }}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label || 'Score'} ${shown} percent`}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
        <circle
          className="gauge-arc"
          cx="50" cy="50" r="42" fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50" y="55" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ink)"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {shown}%
        </text>
      </svg>
      {label && <span className="gauge-cap">{label}</span>}
    </div>
  );
}

/**
 * "Why this score?" breakdown.
 * matched: [string]   missing: [{ name, current_level, required_level, priority }]
 */
export function ScoreBreakdown({ score, matched = [], missing = [], loading = false }) {
  if (loading) {
    return (
      <div className="why-box">
        <div className="skeleton" style={{ height: 14, width: '70%' }} />
        <div className="skeleton" style={{ height: 14, width: '55%' }} />
        <div className="skeleton" style={{ height: 14, width: '62%' }} />
      </div>
    );
  }
  return (
    <div className="why-box">
      {matched.map((name) => (
        <div className="why-row" key={`m-${name}`}>
          <span>{name}</span>
          <span className="muted text-xs">meets requirement</span>
          <span className="pill good">✓ Have</span>
        </div>
      ))}
      {missing.map((m) => {
        const partial = (m.current_level || 0) > 0;
        return (
          <div className="why-row" key={`x-${m.name}`}>
            <span>{m.name}</span>
            <span className="muted text-xs num">level {m.current_level || 0} / {m.required_level}</span>
            <span className={`pill ${partial ? 'warn' : 'bad'}`}>{partial ? '◐ Partial' : '✗ Missing'}</span>
          </div>
        );
      })}
      <div className="why-total">
        <span>Weighted skill match</span>
        <span className="num">{score}%</span>
      </div>
    </div>
  );
}

/** Friendly empty state with an optional action. */
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={24} />
        </div>
      )}
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/** Stat tile. Pass `to` to make it a link. tone: good | warn | bad */
export function StatTile({ label, value, sub, tone, to, title }) {
  const body = (
    <>
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${tone ? `is-${tone}` : ''}`}>{value}</span>
      {sub && <span className="stat-sub" title={typeof sub === 'string' ? sub : undefined}>{sub}</span>}
    </>
  );
  return to ? (
    <Link to={to} className="card stat-tile" title={title}>{body}</Link>
  ) : (
    <div className="card stat-tile" title={title}>{body}</div>
  );
}
