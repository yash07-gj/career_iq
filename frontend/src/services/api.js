// =============================================================================
// CareerIQ Frontend API Client — Connects to Python FastAPI (Port 8000) & MySQL
// =============================================================================

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Helper to perform HTTP requests with automatic JSON parsing and error handling
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[API] Fallback for ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName, email, password) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password }),
    }),

  getCurrentUser: () => fetchApi('/auth/me'),

  // Dashboard
  getDashboard: () => fetchApi('/dashboard'),

  // Skills & Career Roles
  getSkills: () => fetchApi('/skills'),
  getCareerRoles: () => fetchApi('/career-roles'),

  // Jobs
  getJobs: () => fetchApi('/jobs'),

  // Analysis & Recommendations
  getRecommendations: () => fetchApi('/analysis/recommendations'),
  getGapAnalysis: (roleId = 1) => fetchApi(`/analysis/gap-analysis?role_id=${roleId}`),
  runAnalysis: (profileId = 1) => fetchApi(`/analysis/run/${profileId}`, { method: 'POST' }),

  // Learning Roadmap
  getRoadmap: () => fetchApi('/roadmap'),
  updateRoadmapStep: (stepId, status) =>
    fetchApi(`/roadmap/step/${stepId}/status?status=${status}`, { method: 'PUT' }),

  // What-If Simulation
  simulate: (targetRoleId, selectedSkillIds) =>
    fetchApi('/simulation', {
      method: 'POST',
      body: JSON.stringify({
        target_role_id: targetRoleId,
        selected_skill_ids: selectedSkillIds,
      }),
    }),
};

export default api;
