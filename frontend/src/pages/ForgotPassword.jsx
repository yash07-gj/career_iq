import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Target, Award, TrendingUp
} from 'lucide-react';
import api from '../services/api';
import '../styles/public.css';

const RECOVERY_POINTS = [
  'Direct and secure password recovery',
  'Enterprise-grade bcrypt password hashing',
  'Real-time MySQL database credential update',
  'Instant account restoration without delay',
];

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Submit Direct Password Reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.resetPassword(
        email.trim(),
        newPassword.trim()
      );

      if (res && res.success) {
        setSuccess(res.message || 'Password updated successfully in database!');
        setTimeout(() => {
          nav('/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update password. Please verify your email.');
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
            <h1>Account Recovery</h1>
            <p>Reset your password to regain access to your CareerIQ career intelligence profile.</p>
            <div className="au-checks">
              {RECOVERY_POINTS.map((x) => (
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
              <span className="lp-logo-mark"><KeyRound size={18} strokeWidth={2.5} /></span>
              <span>Career<b>IQ</b></span>
            </Link>

            <div className="au-title">
              <h2>Change Password</h2>
              <p>Enter your registered email and choose a new password</p>
            </div>

            {error && (
              <div className="notice bad" role="alert">
                <AlertCircle size={16} />
                <span className="notice-main">{error}</span>
              </div>
            )}

            {success && (
              <div className="notice good" role="status">
                <CheckCircle2 size={16} />
                <span className="notice-main">{success} Redirecting to login...</span>
              </div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label className="label" htmlFor="fp-email">Registered Email Address</label>
              <div className="input-icon">
                <Mail size={16} />
                <input
                  id="fp-email"
                  className="input"
                  type="email"
                  placeholder="e.g. yash@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="label" htmlFor="fp-new">New Password</label>
              <div className="input-icon">
                <input
                  id="fp-new"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPassword.length > 0 && (
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

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="label" htmlFor="fp-confirm">Confirm New Password</label>
              <div className="input-icon">
                <input
                  id="fp-confirm"
                  className="input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword.length > 0 && (
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowConfirm(!showConfirm)}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" className="lp-btn primary" disabled={loading || !!success}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Password in Database...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Password Reset Completed!</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="au-foot">
              Remembered your password?{' '}
              <Link to="/login" className="link-btn">
                <ArrowLeft size={13} /> Back to Login
              </Link>
            </p>
          </form>
      </main>
    </div>
  );
}
