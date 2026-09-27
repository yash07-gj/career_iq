import React from 'react';
import { GraduationCap, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import auth from '../utils/auth';

export const Layout = ({ children, admin = false }) => {
  const user = auth.getUser();
  const displayName = user?.full_name || 'Student';
  const initial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="app">
      <Sidebar admin={admin} />
      <main className="main">
        <div className="topbar">
          <Bell size={15} color="#7890aa" />
          <span className="hello">Hi, {displayName}</span>
          <div className="avatar">{initial}</div>
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
