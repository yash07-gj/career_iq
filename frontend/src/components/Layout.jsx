import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Bell, User as UserIcon, FileText, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import auth from '../utils/auth';

export const Layout = ({ children, admin = false }) => {
  const nav = useNavigate();
  const user = auth.getUser();
  const displayName = user?.full_name || 'Student';
  const initial = displayName.charAt(0).toUpperCase() || 'S';
  const role = user?.target_role || 'Candidate';
  const email = user?.email || 'student@example.com';

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = () => {
    setProfileOpen(false);
    auth.logout();
    nav('/login');
  };

  const handleNavigate = (path) => {
    setProfileOpen(false);
    nav(path);
  };

  return (
    <div className="app">
      <Sidebar admin={admin} />
      <main className="main">
        <div className="topbar">
          <Bell size={15} color="#7890aa" />
          <span className="hello">Hi, {displayName}</span>
          
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
              className="avatar" 
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Profile menu"
            >
              {initial}
            </div>

            {profileOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '250px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >
                {/* User Header */}
                <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <div 
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '50%', 
                      background: '#dbeafe', 
                      color: 'var(--blue, #2563eb)', 
                      display: 'grid', 
                      placeItems: 'center', 
                      fontSize: '15px', 
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {initial}
                  </div>
                  <div style={{ overflow: 'hidden', lineHeight: 1.3 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy, #0f172a)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue, #2563eb)', marginTop: '2px' }}>
                      {role}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '1px' }}>
                      {email}
                    </div>
                  </div>
                </div>

                {/* Menu Actions */}
                <div style={{ padding: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/profile')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#334155',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                  >
                    <UserIcon size={16} color="#64748b" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/resume-analysis')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#334155',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                  >
                    <FileText size={16} color="#64748b" />
                    <span>Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/settings')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#334155',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                  >
                    <Settings size={16} color="#64748b" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }} />

                {/* Logout Action */}
                <div style={{ padding: '6px' }}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ef4444',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={16} color="#ef4444" />
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
