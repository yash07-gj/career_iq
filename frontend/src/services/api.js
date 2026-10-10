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

  sendOtp: (email, fullName = 'Student') =>
    fetchApi('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName }),
    }),

  verifyOtp: (email, otpCode) =>
    fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode }),
    }),

  registerWithOtp: (fullName, email, password, otpCode) =>
    fetchApi('/auth/register-with-otp', {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        otp_code: otpCode,
      }),
    }),

  getCurrentUser: (userId) =>
    fetchApi(`/auth/me${userId ? `?user_id=${userId}` : ''}`),

  // Dashboard
  getDashboard: (userId) => fetchApi(`/dashboard${userId ? `?user_id=${userId}` : ''}`),

  // Skills & Career Roles
  getSkills: () => fetchApi('/skills'),
  getCareerRoles: () => fetchApi('/career-roles'),

  // Jobs
  getJobs: () => fetchApi('/jobs'),

  // Analysis & Recommendations
  getRecommendations: (userId) =>
    fetchApi(`/analysis/recommendations${userId ? `?user_id=${userId}` : ''}`),
  getGapAnalysis: (roleId = 1, userId) =>
    fetchApi(`/analysis/gap-analysis?role_id=${roleId}${userId ? `&user_id=${userId}` : ''}`),
  runAnalysis: (profileId = 1) => fetchApi(`/analysis/run/${profileId}`, { method: 'POST' }),

  // Resume Upload & Status
  uploadResume: async (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const res = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }

    return await res.json();
  },

  getResumeStatus: (userId) => fetchApi(`/resume/status/${userId}`),

  // Profile
  getProfile: (userId) => fetchApi(`/profile/${userId}`),
  updateProfile: (userId, data) =>
    fetchApi(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadProfilePhoto: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/profile/${userId}/photo`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  },

  // Learning Roadmap
  getRoadmap: (userId) => fetchApi(`/roadmap${userId ? `?user_id=${userId}` : ''}`),
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
