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
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  // Submit state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Send OTP (Code is delivered exclusively to user's email inbox)
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your registered email address first.');
      return;
    }
    setError('');
    setInfoMsg('');
    setOtpLoading(true);

    try {
      const res = await api.sendForgotPasswordOtp(email.trim());
      if (res && res.success) {
        setOtpSent(true);
        setOtpCode(''); // Never auto-fill OTP, user must enter from their email
        setInfoMsg(res.message || 'A 6-digit verification code has been sent to your email address.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your email address.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit Password Reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    if (!otpSent) {
      setError('Please click "Get OTP" first to receive your verification code via email.');
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
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
        newPassword.trim(),
        otpCode.trim()
      );

      if (res && res.success) {
        setSuccess(res.message || 'Password updated successfully in database!');
        setTimeout(() => {
          nav('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your verification code.');
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
              'Secure email verification code (OTP)',
              'Enterprise-grade bcrypt password hashing',
              'Real-time MySQL database credential update',
              'Fast and seamless account recovery',
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
          <p>Verify your registered email and choose a new password</p>

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
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
              <span>{success} Redirecting to login...</span>
            </div>
          )}

          {infoMsg && !success && (
            <div
              style={{
                padding: '10px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email field + Get OTP button */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label">Registered Email Address</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    className="input"
                    type="email"
                    placeholder="e.g. yash@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !email.trim()}
                  className="btn outline"
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  title="Send 6-digit verification code to email"
                >
                  {otpLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Mail size={14} />
                  )}
                  <span>{otpSent ? 'Resend OTP' : 'Get OTP'}</span>
                </button>
              </div>
            </div>

            {/* 6-Digit OTP field (Only displayed when OTP is requested) */}
            {otpSent && (
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="label">
                  Verification Code (OTP){' '}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                    — check your email inbox
                  </span>
                </label>
                <input
                  className="input"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{ letterSpacing: '4px', fontWeight: 700, fontSize: 16 }}
                />
              </div>
            )}

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
                  <span>Updating in Database...</span>
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
