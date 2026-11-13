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
  ShieldCheck,
  User,
} from 'lucide-react';
import api from '../services/api';
import auth from '../utils/auth';

export default function Login() {
  const nav = useNavigate();
  const [panel, setPanel] = useState('candidate'); // 'candidate' | 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSwitchPanel = (targetPanel) => {
    setPanel(targetPanel);
    setError('');
    setPassword('');
    if (targetPanel === 'admin') {
      setIdentifier('admin');
    } else {
      setIdentifier('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginIdentifier = identifier.trim();
      const res = await api.login(loginIdentifier, password);

      if (res && res.user) {
        // If logging in via admin panel, verify account role is admin
        if (panel === 'admin' && res.user.account_role !== 'admin') {
          setError('Access denied. This portal is strictly for authorized admin members.');
          setLoading(false);
          return;
        }

        auth.setUser(res.user, res.access_token);

        // Redirect admin to /admin, candidates to /dashboard
        if (res.user.account_role === 'admin' || panel === 'admin') {
          nav('/admin');
        } else {
          nav('/dashboard');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (panel === 'admin') {
        setError(err.message || 'Invalid admin credentials. Use username "admin" and password "admin123".');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        {/* Left Side */}
        <div className="auth-side">
          <div
            className="logo-icon-box"
            style={{ width: 48, height: 48, marginBottom: 24, background: 'rgba(255,255,255,0.2)' }}
          >
            {panel === 'admin' ? <ShieldCheck size={28} /> : <GraduationCap size={28} />}
          </div>
          <h1>{panel === 'admin' ? 'Administrator Portal' : 'Welcome Back!'}</h1>
          <p>
            {panel === 'admin'
              ? 'Secure administrative management portal for CareerIQ system administrators.'
              : 'Login to your account and continue your personalized career journey.'}
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(panel === 'admin'
              ? [
                  'Centralized job & internship management',
                  'User verification and candidate management',
                  'Curated skills and learning directory control',
                  'System health & telemetry analytics',
                ]
              : [
                  'Personalized AI career recommendations',
                  'Real-time skill gap tracking',
                  'Targeted learning resource directory',
                  'Dynamic step-by-step career roadmaps',
                ]
            ).map((x) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }} key={x}>
                <CheckCircle2 size={16} color={panel === 'admin' ? '#93c5fd' : '#6ee7b7'} />
                <span>{x}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-logo">
            <div className="logo-icon-box" style={{ width: 34, height: 34 }}>
              {panel === 'admin' ? <ShieldCheck size={20} /> : <GraduationCap size={20} />}
            </div>
            <strong>CareerIQ {panel === 'admin' && <span style={{ color: 'var(--blue)', fontSize: 12 }}>ADMIN</span>}</strong>
          </div>

          {/* Login Panel Switch Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              padding: 4,
              borderRadius: 10,
              margin: '12px 0 20px',
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchPanel('candidate')}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: panel === 'candidate' ? '#ffffff' : 'transparent',
                color: panel === 'candidate' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: panel === 'candidate' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <User size={15} />
              <span>Candidate Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPanel('admin')}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: panel === 'admin' ? '#ffffff' : 'transparent',
                color: panel === 'admin' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: panel === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={15} />
              <span>Admin Panel</span>
            </button>
          </div>

          <h2>{panel === 'admin' ? 'Admin Login' : 'Login'}</h2>
          <p>
            {panel === 'admin'
              ? 'Authorized personnel login for CareerIQ platform management'
              : 'Access your AI Career Intelligence Dashboard'}
          </p>

          {panel === 'admin' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              <ShieldCheck size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Restricted Admin Portal:</strong> Login with admin username <code>admin</code> and password <code>admin123</code>.
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="label">{panel === 'admin' ? 'Admin Username or Email' : 'Email Address'}</label>
            <input
              className="input"
              type={panel === 'admin' ? 'text' : 'email'}
              placeholder={panel === 'admin' ? 'admin' : 'e.g. yash@example.com'}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">{panel === 'admin' ? 'Admin Password' : 'Password'}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder={panel === 'admin' ? 'admin123' : '••••••••'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: password ? '42px' : undefined, width: '100%' }}
              />
              {password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '16px 0 20px',
              fontSize: 13,
              color: '#475569',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--blue)', width: 16, height: 16 }}
              />
              <span>Remember me</span>
            </label>
            {panel === 'candidate' && (
              <Link to="/forgot-password" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              background: panel === 'admin' ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : undefined,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{panel === 'admin' ? 'Authenticating Admin...' : 'Logging In...'}</span>
              </>
            ) : panel === 'admin' ? (
              <>
                <ShieldCheck size={16} />
                <span>Login as Administrator</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {panel === 'candidate' ? (
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                Create Account
              </Link>
            </p>
          ) : (
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              Sign up is restricted for administrative accounts. Admin members only.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
