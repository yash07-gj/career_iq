import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Target, Award, TrendingUp
} from 'lucide-react';
import api from '../services/api';
import '../styles/public.css';
import auth from '../utils/auth';

const REGISTER_POINTS = [
  'Instant account setup & secure login',
  'AI-powered resume parsing and analysis',
  'Personalized matching algorithms',
  'Real-time skill gap analysis',
  'Tailored learning milestones and roadmaps',
];

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register(fullName.trim(), email.trim(), password);
      if (res && res.user) {
        auth.setUser(res.user, res.access_token);
      } else {
        auth.setUser({
          full_name: fullName.trim(),
          email: email.trim(),
          account_role: 'candidate',
        });
      }
      setDone(true);
      setTimeout(() => nav('/dashboard'), 600);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="au">
      {/* Left: dark animated panel */}
      <aside className="au-side">
        <div className="lp-orb one" />
        <div className="lp-orb two" />
        <div className="lp-grid-bg" />
        <div className="au-side-in">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-mark"><GraduationCap size={20} strokeWidth={2.5} /></span>
            <span>Career<b>IQ</b></span>
          </Link>
          <div className="au-side-body">
            <h1>Create Your Account</h1>
            <p>Join thousands of students and professionals advancing their careers with CareerIQ.</p>
            <div className="au-checks">
              {REGISTER_POINTS.map((x) => (
                <div className="au-check" key={x}>
                  <CheckCircle2 size={17} />
                  <span>{x}</span>
                </div>
              ))}
            </div>
            <div className="au-cards" aria-hidden="true">
              <div className="au-card c1 lp-glass">
                <span className="ic"><Target size={18} /></span>
                <div><small>Career Readiness</small><strong>78%</strong></div>
              </div>
              <div className="au-card c2 good lp-glass">
                <span className="ic"><Award size={18} /></span>
                <div><small>Top Career Match</small><strong>Data Analyst · 89%</strong></div>
              </div>
              <div className="au-card c3 violet lp-glass">
                <span className="ic"><TrendingUp size={18} /></span>
                <div><small>Market Demand</small><strong>+28% High Growth</strong></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <main className="au-main">
          <form className="au-form" onSubmit={handleRegister}>
            <Link to="/" className="au-brand">
              <span className="lp-logo-mark"><GraduationCap size={18} strokeWidth={2.5} /></span>
              <span>Career<b>IQ</b></span>
            </Link>

            <div className="au-title">
              <h2>Get Started Free</h2>
              <p>Create your account in seconds</p>
            </div>

            {error && (
              <div className="notice bad" role="alert">
                <AlertCircle size={16} />
                <span className="notice-main">{error}</span>
              </div>
            )}

            {done && (
              <div className="notice good" role="status">
                <CheckCircle2 size={16} />
                <span className="notice-main">Account created successfully! Redirecting...</span>
              </div>
            )}

            <div className="form-group">
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className="input"
                required
                type="text"
                placeholder="e.g. Yash Shinde"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-email">Email Address</label>
              <div className="input-icon">
                <Mail size={16} />
                <input
                  id="reg-email"
                  className="input"
                  required
                  type="email"
                  placeholder="e.g. yash@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="input-icon">
                <input
                  id="reg-password"
                  className="input"
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="lp-btn primary" disabled={loading || done}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : done ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Account Created! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="au-foot">
              Already have an account?{' '}
              <Link to="/login" className="link-btn">
                Sign In
              </Link>
            </p>
          </form>
      </main>
    </div>
  );
}
