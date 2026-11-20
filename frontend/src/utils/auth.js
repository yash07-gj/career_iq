// =============================================================================
// CareerIQ Auth Helper — Manages logged-in user session in localStorage
// =============================================================================

import { resetTheme } from './theme';

const USER_KEY = 'careeriq_user';
const TOKEN_KEY = 'careeriq_token';

export const auth = {
  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
    }
    return null;
  },

  setUser: (userData, token = null) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Failed to store user session', e);
    }
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  logout: async () => {
    try {
      const user = auth.getUser();
      if (user && user.user_id) {
        await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.user_id }),
        });
      }
    } catch (e) {
      console.warn('Backend logout call failed:', e);
    } finally {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      resetTheme(); // next person starts with the default (dark) theme
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(USER_KEY);
  },

  validateWithBackend: async (api) => {
    const user = auth.getUser();
    if (!user || !user.user_id) return null;

    try {
      const validUser = await api.getCurrentUser(user.user_id);
      if (validUser && validUser.user_id) {
        auth.setUser({ ...user, ...validUser });
        return validUser;
      }
    } catch (err) {
      console.warn('User session invalid or deleted from database:', err.message);
      auth.logout();
      return null;
    }
  },
};

export default auth;
