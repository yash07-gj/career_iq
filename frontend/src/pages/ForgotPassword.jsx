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
} from 'lucide-react';
import api from '../services/api';

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
    <div className="auth">
      <div className="auth-card">
        {/* Left Side Info Panel */}
        <div className="auth-side">
          <div
            className="logo-icon-box"
            style={{ width: 48, height: 48, marginBottom: 24, background: 'rgba(255,255,255,0.2)' }}
          >
            <GraduationCap size={28} />
          </div>
          <h1>Account Recovery</h1>
          <p>Reset your password to regain access to your CareerIQ career intelligence profile.</p>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Direct and secure password recovery',
              'Enterprise-grade bcrypt password hashing',
              'Real-time MySQL database credential update',
              'Instant account restoration without delay',
            ].map((text) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }} key={text}>
                <CheckCircle2 size={16} color="#6ee7b7" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="auth-form" style={{ maxWidth: 460 }}>
          <div className="auth-logo">
            <div className="logo-icon-box" style={{ width: 34, height: 34 }}>
              <KeyRound size={20} />
            </div>
            <strong>CareerIQ</strong>
          </div>

          <h2>Change Password</h2>
          <p>Enter your registered email and choose a new password</p>

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

          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#10b981' }} />
              <span>{success} Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label">Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type="email"
                  placeholder="e.g. yash@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '36px', width: '100%' }}
                />
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label">New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '42px', width: '100%' }}
                />
                {newPassword.length > 0 && (
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
                      color: '#64748b',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Confirm New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: '42px', width: '100%' }}
                />
                {confirmPassword.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'transparent',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="btn"
              disabled={loading || !!success}
              style={{ width: '100%', padding: '12px', fontSize: 14 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Password in Database...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} color="#ffffff" />
                  <span>Password Reset Completed!</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text-muted)' }}>
            Remembered your password?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--blue)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ArrowLeft size={13} /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
