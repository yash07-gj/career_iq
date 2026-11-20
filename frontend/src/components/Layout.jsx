import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Bell, User as UserIcon, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import auth from '../utils/auth';
import api from '../services/api';
import { setTheme } from '../utils/theme';

export const Layout = ({ children, admin = false }) => {
  const nav = useNavigate();
  const [user, setUser] = useState(auth.getUser());
  const displayName = user?.full_name || (admin ? 'Admin Manager' : 'Student');
  const initial = displayName.charAt(0).toUpperCase() || 'A';
  const role = (user?.account_role === 'admin' || admin) ? 'Administrator' : (user?.target_role || 'Candidate');
  const email = user?.email || (admin ? 'admin@careeriq.com' : 'student@example.com');

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mobile / tablet sidebar drawer
  // (Each sidebar link also closes the drawer when clicked — see Sidebar.jsx)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the drawer with the Escape key
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);
  
  const photoUrl = user?.profile_picture_url ? `http://127.0.0.1:8000${user.profile_picture_url}` : null;

  // Protect workspace: If not logged in or deleted from database, redirect to /login
  useEffect(() => {
    const stored = auth.getUser();
    if (!stored || !stored.user_id) {
      nav('/login');
      return;
    }
    async function checkSession() {
      try {
        const liveUser = await api.getCurrentUser(stored.user_id);
        if (liveUser && liveUser.user_id) {
          // get profile data as well to fetch picture
          const liveProfile = await api.getProfile(stored.user_id);
          const updatedUser = { 
            ...stored, 
            ...liveUser, 
            profile_picture_url: liveProfile.profile_picture_url,
            target_role_id: liveProfile.target_role_id,
            target_role: liveProfile.target_role_name || stored.target_role 
          };
          setUser(updatedUser);
          auth.setUser(updatedUser);

          // Apply this account's theme (dark by default for new accounts)
          if (!admin) {
            api.getSettings(stored.user_id)
              .then((settings) => setTheme(settings?.theme || 'dark'))
              .catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Session expired or user deleted from database. Logging out...', err);
        auth.logout();
        setUser(null);
        nav('/login');
      }
    }
    checkSession();
  }, [nav, admin]);
  
  // Listen for custom authChange event (fired by profile updates)
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(auth.getUser());
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await auth.logout();
    setUser(null);
    nav('/login');
  };

  const handleNavigate = (path) => {
    setProfileOpen(false);
    nav(path);
  };

  return (
    <div className="app">
      <Sidebar admin={admin} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Dark overlay behind the sidebar drawer (tablet / mobile only) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <main className="main">
        <div className="topbar">
          {/* Hamburger button (visible only on tablet / mobile via CSS) */}
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {!admin && <Bell size={15} color="#7890aa" />}
          {!admin && <span className="hello">Hi, {displayName}</span>}

          <div ref={dropdownRef} className="profile-menu-wrap">
            <div
              className="avatar"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                backgroundImage: photoUrl ? `url(${photoUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: photoUrl ? 'transparent' : undefined
              }}
              title="Profile menu"
            >
              {!photoUrl && initial}
            </div>

            {profileOpen && (
              <div className="profile-menu">
                {/* User Header */}
                <div className="profile-menu-header">
                  <div
                    className="profile-menu-avatar"
                    style={{ backgroundImage: photoUrl ? `url(${photoUrl})` : undefined }}
                  >
                    {!photoUrl && initial}
                  </div>
                  <div className="profile-menu-info">
                    <div className="profile-menu-name">
                      {admin ? 'Administrator' : displayName}
                    </div>
                    {!admin && <div className="profile-menu-role">{role}</div>}
                    {!admin && <div className="profile-menu-email">{email}</div>}
                  </div>
                </div>

                {/* Menu Actions */}
                {!admin && (
                  <>
                    <div className="profile-menu-group">
                      <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/profile')}>
                        <UserIcon size={16} />
                        <span>My Profile</span>
                      </button>

                      <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/resume-analysis')}>
                        <FileText size={16} />
                        <span>Resume</span>
                      </button>

                      <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/settings')}>
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="profile-menu-divider" />
                  </>
                )}

                {/* Logout Action */}
                <div className="profile-menu-group">
                  <button type="button" className="profile-menu-item danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export const Page = ({ title, subtitle, children, action }) => (
  <section className="page">
    <div className="page-head">
      <div>
        <div className="eyebrow">CareerIQ</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const Logo = () => (
  <div className="auth-logo">
    <GraduationCap size={30} />
    <strong>CareerIQ</strong>
  </div>
);

export default Layout;
