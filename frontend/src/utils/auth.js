// =============================================================================
// CareerIQ Auth Helper — Manages logged-in user session in localStorage
// =============================================================================

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
    return {
      user_id: 1,
      full_name: 'Yash',
      email: 'yash@example.com',
      account_role: 'candidate',
    };
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

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(USER_KEY);
  },
};

export default auth;
