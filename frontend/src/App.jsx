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
import PlaceholderAdmin from './pages/PlaceholderAdmin';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import './App.css';

export default function App() {
  useEffect(() => {
    // Initialize Theme globally
    try {
      const savedTheme = JSON.parse(localStorage.getItem('careerIQ_theme') || '"light"');
      const root = document.documentElement;
      if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else if (savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', 'light');
      }

      // Initialize Compact Mode globally
      const savedCompact = JSON.parse(localStorage.getItem('careerIQ_compactMode') || 'false');
      root.setAttribute('data-compact', savedCompact ? 'true' : 'false');
      if (savedCompact) {
        root.classList.add('compact-mode');
      } else {
        root.classList.remove('compact-mode');
      }
    } catch {}
  }, []);
  return (
    <Router>
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
        <Route path="/admin/jobs" element={<PlaceholderAdmin title="Jobs" />} />
        <Route path="/admin/skills" element={<PlaceholderAdmin title="Skills" />} />
        <Route path="/admin/resources" element={<PlaceholderAdmin title="Resources" />} />
        <Route path="/admin/settings" element={<PlaceholderAdmin title="Settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
