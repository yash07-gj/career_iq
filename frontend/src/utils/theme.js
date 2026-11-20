// =============================================================================
// CareerIQ — Theme helper
// Dark is the default. A user's own choice (Light / Dark / System) is stored
// with their account settings in the backend and cached in localStorage.
// =============================================================================

export const THEME_KEY = 'careerIQ_theme';
export const DEFAULT_THEME = 'dark';

/** Applies a theme ('light' | 'dark' | 'system') to the <html> element. */
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
}

/** Theme saved in this browser, or the default (dark). */
export function getSavedTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) || 'null');
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Saves and applies a theme (used after loading the user's settings). */
export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch {
    // storage unavailable — the theme still applies for this page view
  }
  applyTheme(theme);
}

/** Back to the default theme (used on logout, so the next person starts in dark). */
export function resetTheme() {
  try {
    localStorage.removeItem(THEME_KEY);
  } catch {
    // ignore
  }
  applyTheme(DEFAULT_THEME);
}
