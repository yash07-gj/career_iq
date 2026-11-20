// Shared career helpers used by pages and UI components.

/** Colour meaning for a score: green ≥ 75, orange ≥ 50, red below. */
export const toneFor = (value) => (value >= 75 ? 'good' : value >= 50 ? 'warn' : 'bad');

/** The six steps of the career journey, in order, with their routes. */
export const JOURNEY_STEPS = [
  { key: 'resume', label: 'Resume', path: '/resume-analysis' },
  { key: 'recommendations', label: 'Career matches', path: '/recommendations' },
  { key: 'gap', label: 'Skill gaps', path: '/gap-analysis' },
  { key: 'roadmap', label: 'Roadmap', path: '/roadmap' },
  { key: 'simulation', label: 'Simulation', path: '/simulation' },
  { key: 'jobs', label: 'Apply to jobs', path: '/job-matching' },
];
