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
  KeyRound,
  ArrowLeft,
  RotateCw,
} from 'lucide-react';
import api from '../services/api';
import auth from '../utils/auth';

export default function Register() {
  const nav = useNavigate();
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [done, setDone] = useState(false);

  // Step 1: Request OTP and validate email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await api.sendOtp(email, fullName);
      if (res && res.success) {
        setInfoMessage(res.message || 'Verification code sent to your email.');
        if (res.dev_otp) {
          setDevOtp(res.dev_otp);
        }
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setInfoMessage('');
    setResending(true);
    try {
      const res = await api.sendOtp(email, fullName);
      if (res && res.success) {
        setInfoMessage('A fresh verification code has been dispatched.');
        if (res.dev_otp) {
          setDevOtp(res.dev_otp);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP & complete registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.registerWithOtp(fullName, email, password, otpCode);
      if (res && res.user) {
        auth.setUser(res.user, res.access_token);
      } else {
        auth.setUser({
          full_name: fullName,
          email: email,
          account_role: 'candidate',
        });
      }
      setDone(true);
      setTimeout(() => nav('/dashboard'), 600);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your 6-digit code.');
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
              'Real-time email verification & security',
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

          {step === 1 ? (
            /* STEP 1: REGISTRATION FORM */
            <form onSubmit={handleRequestOtp}>
              <h2>Get Started Free</h2>
              <p>Create your account with a verified real email</p>

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
                    placeholder="Create a strong password"
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
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 12 }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Validating & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email & Continue</span>
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
          ) : (
            /* STEP 2: OTP VERIFICATION FORM */
            <form onSubmit={handleVerifyAndRegister}>
              <h2>Verify Your Email</h2>
              <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                We sent a 6-digit verification code to: <br />
                <strong style={{ color: 'var(--blue, #2563eb)' }}>{email}</strong>
              </p>

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

              {infoMessage && (
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
                  <span>{infoMessage}</span>
                </div>
              )}

              {devOtp && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#eff6ff',
                    border: '1px dashed #3b82f6',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1e40af',
                    marginBottom: 16,
                  }}
                >
                  <strong>Testing Mode Active:</strong> Your OTP is{' '}
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: 15,
                      background: '#dbeafe',
                      padding: '2px 6px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                    onClick={() => setOtpCode(devOtp)}
                    title="Click to auto-fill"
                  >
                    {devOtp} (Click to fill)
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="label">6-Digit Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    required
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 849201"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      paddingLeft: '36px',
                      letterSpacing: '4px',
                      fontSize: '18px',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                    autoFocus
                  />
                  <KeyRound
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn"
                disabled={loading || otpCode.length < 6}
                style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 12 }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : done ? (
                  <span>Verified & Created ✓</span>
                ) : (
                  <>
                    <span>Verify & Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 18,
                  fontSize: 13,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--blue, #2563eb)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                  }}
                >
                  <RotateCw size={14} className={resending ? 'animate-spin' : ''} />
                  <span>{resending ? 'Resending...' : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
