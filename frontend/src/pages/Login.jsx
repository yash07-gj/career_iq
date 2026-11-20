import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, Target, Award, TrendingUp } from 'lucide-react';
import api from '../services/api';
import '../styles/public.css';
import auth from '../utils/auth';

const LOGIN_POINTS = [
  'Personalized AI career recommendations',
  'Real-time skill gap tracking',
  'Targeted learning resource directory',
  'Dynamic step-by-step career roadmaps',
];

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      if (res && res.user) {
        auth.setUser(res.user, res.access_token);
        const isAdmin =
          res.user.account_role === 'admin' ||
          res.user.role === 'admin' ||
          email.trim().toLowerCase() === 'admin' ||
          email.trim().toLowerCase() === 'admin@careeriq.com';
        if (isAdmin) {
          nav('/admin');
        } else {
          nav('/dashboard');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
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
            <h1>Welcome Back!</h1>
            <p>Login to your account and continue your personalized career journey.</p>
            <div className="au-checks">
              {LOGIN_POINTS.map((x) => (
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
          <form className="au-form" onSubmit={handleSubmit}>
            <Link to="/" className="au-brand">
              <span className="lp-logo-mark"><GraduationCap size={18} strokeWidth={2.5} /></span>
              <span>Career<b>IQ</b></span>
            </Link>
            <div className="au-title">
              <h2>Login</h2>
              <p>Access your AI Career Intelligence Dashboard</p>
            </div>

            {error && (
              <div className="notice bad" role="alert">
                <AlertCircle size={16} />
                <span className="notice-main">{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="label" htmlFor="login-email">Username or Email Address</label>
              <input
                id="login-email"
                className="input"
                type="text"
                placeholder="e.g. admin or name@example.com"
                required
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <div className="input-icon">
                <input
                  id="login-password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
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

            <div className="au-row">
              <label className="au-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="link-btn">Forgot password?</Link>
            </div>

            <button type="submit" className="lp-btn primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="au-foot">
              Don't have an account?{' '}
              <Link to="/register" className="link-btn">
                Create Account
              </Link>
            </p>
          </form>
      </main>
    </div>
  );
}
