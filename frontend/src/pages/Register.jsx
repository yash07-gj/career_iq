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
} from 'lucide-react';
import api from '../services/api';
import auth from '../utils/auth';

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
    <div className="auth">
      <div className="auth-card">
        {/* Left Informational Sidebar */}
        <div className="auth-side">
          <div
            className="logo-icon-box"
            style={{
              width: 48,
              height: 48,
              marginBottom: 24,
              background: 'rgba(255,255,255,0.2)',
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h1>Create Your Account</h1>
          <p>
            Join thousands of students and professionals advancing their careers with
            CareerIQ.
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Instant account setup & secure login',
              'AI-powered resume parsing and analysis',
              'Personalized matching algorithms',
              'Real-time skill gap analysis',
              'Tailored learning milestones and roadmaps',
            ].map((x) => (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}
                key={x}
              >
                <CheckCircle2 size={16} color="#6ee7b7" />
                <span>{x}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form" style={{ maxWidth: 420 }}>
          <div className="auth-logo">
            <div className="logo-icon-box" style={{ width: 34, height: 34 }}>
              <GraduationCap size={20} />
            </div>
            <strong>CareerIQ</strong>
          </div>

          <form onSubmit={handleRegister}>
            <h2>Get Started Free</h2>
            <p>Create your account in seconds</p>

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
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {done && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: '#ecfdf5',
                  color: '#065f46',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 16,
                  border: '1px solid #a7f3d0',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#10b981' }} />
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                required
                type="text"
                placeholder="e.g. Yash Shinde"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  required
                  type="email"
                  placeholder="e.g. yash@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="input"
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '42px', width: '100%' }}
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
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading || done}
              style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 12 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : done ? (
                <>
                  <CheckCircle2 size={16} color="#ffffff" />
                  <span>Account Created! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p
              style={{
                textAlign: 'center',
                marginTop: 20,
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
