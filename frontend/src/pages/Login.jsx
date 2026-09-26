import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Login() {
  const nav = useNavigate();
  const [remember, setRemember] = useState(true);

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-side">
          <div className="logo-icon-box" style={{ width: 48, height: 48, marginBottom: 24, background: 'rgba(255,255,255,0.2)' }}>
            <GraduationCap size={28} />
          </div>
          <h1>Welcome Back!</h1>
          <p>Login to your account and continue your personalized career journey.</p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Personalized AI career recommendations',
              'Real-time skill gap tracking',
              'Targeted learning resource directory',
              'Dynamic step-by-step career roadmaps',
            ].map((x) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }} key={x}>
                <CheckCircle2 size={16} color="#6ee7b7" />
                <span>{x}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            nav('/dashboard');
          }}
        >
          <div className="auth-logo">
            <div className="logo-icon-box" style={{ width: 34, height: 34 }}>
              <GraduationCap size={20} />
            </div>
            <strong>CareerIQ</strong>
          </div>
          <h2>Sign In</h2>
          <p>Access your AI Career Intelligence Dashboard</p>

          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="john@example.com" required />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px', fontSize: 13, color: '#475569' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--blue)', width: 16, height: 16 }}
              />
              <span>Remember me</span>
            </label>
            <a href="#" style={{ color: 'var(--blue)', fontWeight: 600 }}>Forgot password?</a>
          </div>

          <button className="btn" style={{ width: '100%', padding: '12px', fontSize: 14 }}>
            <span>Sign In to Dashboard</span>
            <ArrowRight size={16} />
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700 }}>
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
