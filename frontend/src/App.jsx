import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Recommendations from './pages/Recommendations';
import CareerDetails from './pages/CareerDetails';
import JobMatching from './pages/JobMatching';
import JobDetails from './pages/JobDetails';
import GapAnalysis from './pages/GapAnalysis';
import LearningResources from './pages/LearningResources';
import Roadmap from './pages/Roadmap';
import Simulation from './pages/Simulation';
import MarketIntelligence from './pages/MarketIntelligence';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import AdminJobs from './pages/AdminJobs';
import AdminApplications from './pages/AdminApplications';
import PlaceholderAdmin from './pages/PlaceholderAdmin';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ErrorBoundary from './components/ErrorBoundary';
import { applyTheme, getSavedTheme } from './utils/theme';
import './App.css';
import './styles/design-system.css'; // Modern UI layer (loaded after App.css so it can refine it)

export default function App() {
  useEffect(() => {
    // Initialize Theme globally
    try {
      // Dark is the default theme; a user's saved choice is applied after login (Layout.jsx)
      applyTheme(getSavedTheme());
      const root = document.documentElement;

      // Compact mode was removed from Settings: make sure it is always off
      root.setAttribute('data-compact', 'false');
      root.classList.remove('compact-mode');
      localStorage.removeItem('careerIQ_compactMode');
    } catch {}
  }, []);
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/resume-analysis" element={<ResumeAnalysis />} />
        <Route path="/resume" element={<ResumeAnalysis />} />
        <Route path="/recommendations" element={<Recommendations />} />

        <Route path="/career-details/:careerId" element={<CareerDetails />} />
        <Route path="/job-matching" element={<JobMatching />} />
        <Route path="/job-details/:jobId" element={<JobDetails />} />
        <Route path="/gap-analysis" element={<GapAnalysis />} />
        <Route path="/learning-resources" element={<LearningResources />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminManagement />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/skills" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/resources" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/settings" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  </Router>
  );
}
