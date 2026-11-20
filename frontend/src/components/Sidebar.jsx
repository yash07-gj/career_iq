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
  FileCheck,
} from 'lucide-react';
import auth from '../utils/auth';

const Sidebar = ({ admin = false, open = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  // Navigation groups shown in the sidebar.
  const groups = admin
    ? [
        {
          title: 'Admin Console',
          items: [
            { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { name: 'Users Table', path: '/admin/users', icon: Users },
            { name: 'Jobs Manager', path: '/admin/jobs', icon: Briefcase },
            { name: 'Applications', path: '/admin/applications', icon: FileCheck },
          ],
        },
      ]
    : [
        {
          title: 'Overview',
          items: [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'My Profile', path: '/profile', icon: User },
          ],
        },
        {
          title: 'Career Journey',
          items: [
            { name: 'Resume Analysis', path: '/resume-analysis', icon: FileText },
            { name: 'Career Recommendations', path: '/recommendations', icon: Award },
            { name: 'Skill Gap Analysis', path: '/gap-analysis', icon: ShieldAlert },
            { name: 'Career Roadmap', path: '/roadmap', icon: GitBranch },
            { name: 'Learning Resources', path: '/learning-resources', icon: BookOpen },
            { name: 'What-If Simulation', path: '/simulation', icon: TrendingUp },
            { name: 'Job Matching', path: '/job-matching', icon: Briefcase },
          ],
        },
        {
          title: 'Insights',
          items: [{ name: 'Job Market Intelligence', path: '/market-intelligence', icon: BarChart3 }],
        },
      ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
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
        {groups.map((group) => (
          <React.Fragment key={group.title}>
            <div className="nav-section">{group.title}</div>
            {group.items.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/admin'}
                onClick={onClose}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="sidebar-nav-icon" />
                <span>{name}</span>
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* BOTTOM ACTION BUTTONS (SETTINGS & LOGOUT) */}
      <div className="sidebar-bottom">
        {!admin && (
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `sidebar-bottom-btn settings-btn ${isActive ? 'active' : ''}`}
          >
            <Settings size={18} className="bottom-icon settings-icon" />
            <span>Settings</span>
          </NavLink>
        )}

        <button
          type="button"
          onClick={async () => {
            await auth.logout();
            navigate('/login');
          }}
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
