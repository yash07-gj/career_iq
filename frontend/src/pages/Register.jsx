import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Register() {
  const nav = useNavigate();
  const [done, setDone] = useState(false);

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-side">
          <div className="logo-icon-box" style={{ width: 48, height: 48, marginBottom: 24, background: 'rgba(255,255,255,0.2)' }}>
            <GraduationCap size={28} />
          </div>
          <h1>Create Your Account</h1>
          <p>Join thousands of students and professionals advancing their careers with CareerIQ.</p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'AI-powered resume parsing and analysis',
              'Personalized matching algorithms',
              'Real-time skill gap analysis',
              'Tailored learning milestones and roadmaps',
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
            setDone(true);
            setTimeout(() => nav('/dashboard'), 800);
          }}
        >
          <div className="auth-logo">
            <div className="logo-icon-box" style={{ width: 34, height: 34 }}>
              <GraduationCap size={20} />
            </div>
            <strong>CareerIQ</strong>
          </div>
          <h2>Get Started Free</h2>
          <p>Create your account in seconds</p>

          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" required type="text" placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" required type="email" placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" required type="password" placeholder="Create a strong password" />
          </div>

          <button className="btn" style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 10 }}>
            <span>{done ? 'Account Created ✓' : 'Create Free Account'}</span>
            <ArrowRight size={16} />
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
