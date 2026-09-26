import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  FileText,
  Award,
  ShieldAlert,
  GitBranch,
  TrendingUp,
  BookOpen,
  Briefcase,
  Settings,
  LogOut,
  Users,
  BarChart3,
} from 'lucide-react';

const Sidebar = ({ admin = false }) => {
  const navigate = useNavigate();

  const items = admin
    ? [
        { name: 'Users', path: '/admin', icon: Users },
        { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
        { name: 'Skills', path: '/admin/skills', icon: BarChart3 },
        { name: 'Resources', path: '/admin/resources', icon: BookOpen },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', path: '/profile', icon: User },
        { name: 'Resume Analysis', path: '/resume-analysis', icon: FileText },
        { name: 'Career Recommendations', path: '/recommendations', icon: Award },
        { name: 'Job Matching', path: '/job-matching', icon: Briefcase },
        { name: 'Skill Gap Analysis', path: '/gap-analysis', icon: ShieldAlert },
        { name: 'Learning Resources', path: '/learning-resources', icon: BookOpen },
        { name: 'Career Roadmap', path: '/roadmap', icon: GitBranch },
        { name: 'What-If Simulation', path: '/simulation', icon: TrendingUp },
        { name: 'Job Market Intelligence', path: '/market-intelligence', icon: BarChart3 },
      ];

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="brand">
        <div className="sidebar-brand-icon">
          <GraduationCap size={22} strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <div className="brand-title">Career<span>IQ</span></div>
          <div className="brand-sub">Career Intelligence</div>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="nav">
        <div className="nav-section">{admin ? 'Admin Console' : 'Career Workspace'}</div>
        {items.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} className="sidebar-nav-icon" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* BOTTOM ACTION BUTTONS (SETTINGS & LOGOUT) */}
      <div className="sidebar-bottom">
        <NavLink
          to={admin ? '/admin/settings' : '/profile'}
          className="sidebar-bottom-btn settings-btn"
        >
          <Settings size={18} className="bottom-icon settings-icon" />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="sidebar-bottom-btn logout-btn"
        >
          <LogOut size={18} className="bottom-icon logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
