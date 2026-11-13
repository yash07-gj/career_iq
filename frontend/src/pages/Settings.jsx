import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Briefcase,
  Brain,
  Shield,
  User,
  AlertTriangle,
  ChevronDown,
  Database,
  Download,
  Key,
  Trash2,
  X,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import auth from '../utils/auth';
import api from '../services/api';

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_THEME         = 'careerIQ_theme';
const LS_COMPACT       = 'careerIQ_compactMode';
const LS_NOTIFICATIONS = 'careerIQ_notifications';
const LS_PREFERENCES   = 'careerIQ_preferences';
const LS_AI_SETTINGS   = 'careerIQ_aiSettings';

// ─── helpers ──────────────────────────────────────────────────────────────────
const readLS = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const writeLS = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ─── sub-components ───────────────────────────────────────────────────────────

/** Section card wrapper */
const SettingsCard = ({ icon: Icon, iconColor = '#2563eb', iconBg = '#eff6ff', title, subtitle, children, danger = false }) => (
  <div style={{
    background: danger ? (document.documentElement.getAttribute('data-theme') === 'dark' ? '#2c0b0e' : '#fff5f5') : 'var(--bg-card, #ffffff)',
    border: `1px solid ${danger ? '#ef4444' : 'var(--line, #e2e8f0)'}`,
    borderRadius: '14px',
    boxShadow: 'var(--shadow)',
    marginBottom: '24px',
    overflow: 'hidden',
    transition: 'background 0.2s ease, border-color 0.2s ease',
  }}>
    {/* Card header */}
    <div style={{
      padding: '20px 28px',
      borderBottom: `1px solid ${danger ? '#ef4444' : 'var(--line, #f1f5f9)'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: danger ? '#fee2e2' : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : iconBg),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={danger ? '#ef4444' : iconColor} />
      </div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: danger ? '#ef4444' : 'var(--navy, #0f172a)', lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', marginTop: '3px' }}>{subtitle}</div>}
      </div>
    </div>
    {/* Card body */}
    <div style={{ padding: '20px 28px' }}>{children}</div>
  </div>
);

/** Row with label + description on the left, control on the right */
const SettingsRow = ({ label, description, children, noBorder = false }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '14px 0',
    borderBottom: noBorder ? 'none' : '1px solid var(--line, #f1f5f9)',
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '2px' }}>{label}</div>
      {description && <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>{description}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

/** Blue toggle switch */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      border: 'none',
      background: checked ? '#2563eb' : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#334155' : '#cbd5e1'),
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s ease',
      flexShrink: 0,
      outline: 'none',
    }}
  >
    <span style={{
      position: 'absolute',
      top: '2px',
      left: checked ? '22px' : '2px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: '#ffffff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      transition: 'left 0.2s ease',
    }} />
  </button>
);

/** Modal overlay */
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--line, #e2e8f0)',
          borderRadius: '14px',
          width: '100%', maxWidth: '480px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          color: 'var(--text, #1e293b)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line, #f1f5f9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy, #0f172a)' }}>{title}</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748b)', lineHeight: 1 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Main Settings component ──────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();
  const user = auth.getUser();
  const userId = user?.user_id;
  const userEmail = user?.email || '';

  // ── state ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => readLS(LS_THEME, 'light'));
  const [compactMode, setCompactMode] = useState(() => readLS(LS_COMPACT, false));

  const [notifications, setNotifications] = useState(() => readLS(LS_NOTIFICATIONS, {
    careerRecs: true,
    jobMatches: true,
    learningReminders: true,
    marketUpdates: false,
  }));

  const [preferences, setPreferences] = useState(() => readLS(LS_PREFERENCES, {
    workType: 'Any',
    location: 'Any',
    interests: [],
    remoteOk: true,
  }));

  const [aiSettings, setAiSettings] = useState(() => readLS(LS_AI_SETTINGS, {
    personalizedRecs: true,
    jobMatching: true,
    learningRecs: true,
  }));

  // sync status toast (only for non-theme updates)
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // modals
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [recDataModal, setRecDataModal]   = useState(false);
  const [pwModal, setPwModal]             = useState(false);
  const [deleteModal, setDeleteModal]     = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Delete Account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Recommendation Data state
  const [recDetails, setRecDetails] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recActionMsg, setRecActionMsg] = useState('');

  // ── theme application ──────────────────────────────────────────────────────
  const applyTheme = useCallback((t) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, []);

  // ── compact mode application ───────────────────────────────────────────────
  const applyCompact = useCallback((isCompact) => {
    const root = document.documentElement;
    root.setAttribute('data-compact', isCompact ? 'true' : 'false');
    if (isCompact) {
      root.classList.add('compact-mode');
      document.body.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
      document.body.classList.remove('compact-mode');
    }
  }, []);

  // apply theme & compact on mount
  useEffect(() => {
    applyTheme(theme);
    applyCompact(compactMode);

    // If system theme, listen for system theme changes dynamically
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mql.addEventListener('change', handleSystemChange);
      return () => mql.removeEventListener('change', handleSystemChange);
    }
  }, [theme, compactMode, applyTheme, applyCompact]);

  // ── fetch settings from backend on mount ───────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    async function loadSettings() {
      try {
        const data = await api.getSettings(userId);
        if (data) {
          if (data.theme) {
            setTheme(data.theme);
            writeLS(LS_THEME, data.theme);
            applyTheme(data.theme);
          }
          if (data.compact_mode !== undefined) {
            setCompactMode(data.compact_mode);
            writeLS(LS_COMPACT, data.compact_mode);
            applyCompact(data.compact_mode);
          }
          if (data.notifications) {
            setNotifications(data.notifications);
            writeLS(LS_NOTIFICATIONS, data.notifications);
          }
          if (data.preferences) {
            setPreferences(data.preferences);
            writeLS(LS_PREFERENCES, data.preferences);
          }
          if (data.ai_settings) {
            setAiSettings(data.ai_settings);
            writeLS(LS_AI_SETTINGS, data.ai_settings);
          }
        }
      } catch (err) {
        console.warn('[Settings] Cloud settings fallback to local:', err);
      }
    }
    loadSettings();
  }, [userId, applyTheme, applyCompact]);

  // ── backend sync handler ────────────────────────────────────────────────────
  const syncSettingsToBackend = useCallback(async (overrides = {}, showToast = false) => {
    if (!userId) return;
    if (showToast) setIsSyncing(true);
    try {
      const payload = {
        theme: overrides.theme !== undefined ? overrides.theme : theme,
        compact_mode: overrides.compactMode !== undefined ? overrides.compactMode : compactMode,
        notifications: overrides.notifications !== undefined ? overrides.notifications : notifications,
        preferences: overrides.preferences !== undefined ? overrides.preferences : preferences,
        ai_settings: overrides.aiSettings !== undefined ? overrides.aiSettings : aiSettings,
      };

      await api.updateSettings(userId, payload);
      if (showToast) {
        setSyncStatus('Preferences saved to MySQL database ✓');
        setTimeout(() => setSyncStatus(''), 2500);
      }
    } catch (err) {
      console.error('[Settings] Sync error:', err);
      if (showToast) {
        setSyncStatus('Saved locally');
        setTimeout(() => setSyncStatus(''), 2000);
      }
    } finally {
      if (showToast) setIsSyncing(false);
    }
  }, [userId, theme, compactMode, notifications, preferences, aiSettings]);

  // ── Theme Selection Trigger (SILENT SYNC, NO TOAST MSG) ─────────────────────
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    writeLS(LS_THEME, newTheme);
    applyTheme(newTheme);
    // Silent sync to backend without showing toast message
    syncSettingsToBackend({ theme: newTheme }, false);
  };

  // ── Compact Mode Selection Trigger (SILENT SYNC, NO TOAST MSG) ──────────────
  const handleCompactChange = (val) => {
    setCompactMode(val);
    writeLS(LS_COMPACT, val);
    applyCompact(val);
    // Silent sync to backend without showing toast message
    syncSettingsToBackend({ compactMode: val }, false);
  };

  const toggleNotif = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    writeLS(LS_NOTIFICATIONS, updated);
    syncSettingsToBackend({ notifications: updated }, true);
  };

  const toggleAI = (key) => {
    const updated = { ...aiSettings, [key]: !aiSettings[key] };
    setAiSettings(updated);
    writeLS(LS_AI_SETTINGS, updated);
    syncSettingsToBackend({ aiSettings: updated }, true);
  };

  const handleWorkTypeChange = (val) => {
    const updated = { ...preferences, workType: val };
    setPreferences(updated);
    writeLS(LS_PREFERENCES, updated);
    syncSettingsToBackend({ preferences: updated }, true);
  };

  const handleLocationChange = (val) => {
    const updated = { ...preferences, location: val };
    setPreferences(updated);
    writeLS(LS_PREFERENCES, updated);
    syncSettingsToBackend({ preferences: updated }, true);
  };

  const toggleInterest = (interest) => {
    const has = preferences.interests.includes(interest);
    const updatedInterests = has
      ? preferences.interests.filter(i => i !== interest)
      : [...preferences.interests, interest];
    const updated = { ...preferences, interests: updatedInterests };
    setPreferences(updated);
    writeLS(LS_PREFERENCES, updated);
    syncSettingsToBackend({ preferences: updated }, true);
  };

  const handleRemoteChange = (val) => {
    const updated = { ...preferences, remoteOk: val };
    setPreferences(updated);
    writeLS(LS_PREFERENCES, updated);
    syncSettingsToBackend({ preferences: updated }, true);
  };

  // ── Password Change Action ──────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword) {
      setPwError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.changePassword(userId, currentPassword, newPassword);
      setPwSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPwModal(false);
        setPwSuccess('');
      }, 1800);
    } catch (err) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Delete Account Action ───────────────────────────────────────────────────
  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setDeleteLoading(true);
    try {
      await api.deleteAccount(userId, deletePassword);
      auth.logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message || 'Incorrect password or deletion failed.');
      setDeleteLoading(false);
    }
  };

  // ── Download Data as PDF Action ─────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setDownloadLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/profile/${userId}/export-pdf`);
      if (!res.ok) {
        throw new Error('Failed to generate PDF document');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = (user?.full_name || 'Candidate').replace(/\s+/g, '_');
      link.download = `CareerIQ_Profile_${cleanName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadModal(false);
    } catch (err) {
      alert('Failed to download PDF: ' + err.message);
    } finally {
      setDownloadLoading(false);
    }
  };

  // ── Recommendation Data Action ──────────────────────────────────────────────
  const handleOpenRecModal = async () => {
    setRecDataModal(true);
    setRecLoading(true);
    setRecActionMsg('');
    try {
      const data = await api.getRecommendationData(userId);
      setRecDetails(data);
    } catch (err) {
      console.warn('Rec data fetch error:', err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleClearRecData = async () => {
    if (!window.confirm('Are you sure you want to reset your recommendation history? You will need to upload your resume again to re-analyze.')) {
      return;
    }
    setRecLoading(true);
    try {
      const res = await api.clearRecommendationData(userId);
      setRecActionMsg(res.message || 'Recommendation data has been reset.');
      setRecDetails({ has_data: false, recommendations: [] });
    } catch (err) {
      setRecActionMsg('Failed to reset: ' + err.message);
    } finally {
      setRecLoading(false);
    }
  };

  const themeOptions = [
    { id: 'light',  label: 'Light',  icon: Sun },
    { id: 'dark',   label: 'Dark',   icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const workTypes  = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Hybrid', 'Any'];
  const locations  = ['Ahmedabad', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Remote', 'Any'];
  const interestOptions = [
    'Data Analytics', 'Data Science', 'Business Intelligence',
    'Software Development', 'Web Development', 'Machine Learning', 'Cloud Computing',
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <Page
        title="Settings"
        subtitle="Manage your application preferences, appearance, and account security"
        action={
          syncStatus ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#065f46',
            }}>
              <Check size={14} color="#10b981" />
              {syncStatus}
            </div>
          ) : isSyncing ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: '#eff6ff',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#2563eb',
            }}>
              <RefreshCw size={13} className="spin" />
              Saving...
            </div>
          ) : null
        }
      >

        {/* ── 1. APPEARANCE ─────────────────────────────────────────────── */}
        <SettingsCard
          icon={Sun}
          title="Appearance"
          subtitle="Customize the theme and display density of CareerIQ"
        >
          {/* Theme selector */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '12px' }}>Theme</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {themeOptions.map(({ id, label, icon: Icon }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleThemeChange(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '9px',
                      border: active ? '2px solid #2563eb' : '1.5px solid var(--line, #e2e8f0)',
                      background: active ? '#2563eb' : 'var(--bg-card, #ffffff)',
                      color: active ? '#ffffff' : 'var(--text-muted, #64748b)',
                      fontSize: '13px',
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: active ? '0 0 0 3px rgba(37,99,235,0.25)' : 'none',
                    }}
                  >
                    <Icon size={16} />
                    {label}
                    {active && <Check size={14} style={{ marginLeft: '2px' }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginTop: '10px' }}>
              {theme === 'system' ? "CareerIQ dynamically matches your device operating system's color scheme." :
               theme === 'dark'   ? 'Dark mode is active. Dark surfaces and high contrast text are applied.' :
                                    'Light mode is active. Clean standard CareerIQ interface.'}
            </div>
          </div>

          {/* Compact mode */}
          <SettingsRow
            label="Compact Mode"
            description="Reduce layout padding, header sizes, and card spacing for a denser view"
            noBorder
          >
            <Toggle checked={compactMode} onChange={handleCompactChange} />
          </SettingsRow>
        </SettingsCard>

        {/* ── 2. NOTIFICATIONS ──────────────────────────────────────────── */}
        <SettingsCard
          icon={Bell}
          title="Notifications"
          subtitle="Manage the updates you receive"
        >
          <SettingsRow label="Career Recommendations" description="Get notified about new career recommendations">
            <Toggle checked={notifications.careerRecs} onChange={() => toggleNotif('careerRecs')} />
          </SettingsRow>
          <SettingsRow label="Job Matches" description="Receive notifications about relevant job opportunities">
            <Toggle checked={notifications.jobMatches} onChange={() => toggleNotif('jobMatches')} />
          </SettingsRow>
          <SettingsRow label="Learning Reminders" description="Get reminders about your personalised learning roadmap">
            <Toggle checked={notifications.learningReminders} onChange={() => toggleNotif('learningReminders')} />
          </SettingsRow>
          <SettingsRow label="Market Updates" description="Receive updates about job-market trends in your field" noBorder>
            <Toggle checked={notifications.marketUpdates} onChange={() => toggleNotif('marketUpdates')} />
          </SettingsRow>
        </SettingsCard>

        {/* ── 3. CAREER PREFERENCES ─────────────────────────────────────── */}
        <SettingsCard
          icon={Briefcase}
          title="Career Preferences"
          subtitle="Set preferences synced with MySQL database and recommendation algorithms"
        >
          {/* Work type */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '8px' }}>Preferred Work Type</div>
            <div style={{ position: 'relative', maxWidth: '280px' }}>
              <select
                className="select"
                value={preferences.workType}
                onChange={e => handleWorkTypeChange(e.target.value)}
                style={{ appearance: 'none', paddingRight: '36px', cursor: 'pointer', width: '100%' }}
              >
                {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748b)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Location */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)', paddingTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '8px' }}>Preferred Location</div>
            <div style={{ position: 'relative', maxWidth: '280px' }}>
              <select
                className="select"
                value={preferences.location}
                onChange={e => handleLocationChange(e.target.value)}
                style={{ appearance: 'none', paddingRight: '36px', cursor: 'pointer', width: '100%' }}
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748b)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Career interests */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)', paddingTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '4px' }}>Career Interests</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginBottom: '12px' }}>Select all that apply</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {interestOptions.map(interest => {
                const selected = preferences.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: selected ? '1.5px solid #2563eb' : '1.5px solid var(--line, #e2e8f0)',
                      background: selected ? '#2563eb' : 'var(--bg-card, #ffffff)',
                      color: selected ? '#ffffff' : 'var(--text-muted, #475569)',
                      fontSize: '13px',
                      fontWeight: selected ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {selected && <Check size={12} />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remote */}
          <SettingsRow label="Open to Remote Work" description="Include remote positions in your job matches and recommendations" noBorder>
            <Toggle checked={preferences.remoteOk} onChange={handleRemoteChange} />
          </SettingsRow>
        </SettingsCard>

        {/* ── 4. AI & RECOMMENDATIONS ───────────────────────────────────── */}
        <SettingsCard
          icon={Brain}
          title="AI & Recommendations"
          subtitle="Control how CareerIQ uses your profile for personalised recommendations"
        >
          <div style={{
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f2744' : '#f0f9ff',
            border: '1px solid #0284c7',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#38bdf8',
            lineHeight: 1.6,
          }}>
            <strong>Live AI Engine:</strong> Preferences are stored directly in MySQL and tune the matching and recommendation algorithms.
          </div>

          <SettingsRow label="Personalised Recommendations" description="Use my profile and skills to generate career recommendations">
            <Toggle checked={aiSettings.personalizedRecs} onChange={() => toggleAI('personalizedRecs')} />
          </SettingsRow>
          <SettingsRow label="Job Matching" description="Use my candidate profile when calculating job match scores">
            <Toggle checked={aiSettings.jobMatching} onChange={() => toggleAI('jobMatching')} />
          </SettingsRow>
          <SettingsRow label="Learning Recommendations" description="Use my skill gaps and career goals to recommend learning resources" noBorder>
            <Toggle checked={aiSettings.learningRecs} onChange={() => toggleAI('learningRecs')} />
          </SettingsRow>
        </SettingsCard>

        {/* ── 5. PRIVACY & DATA ─────────────────────────────────────────── */}
        <SettingsCard
          icon={Shield}
          title="Privacy & Data"
          subtitle="Manage your CareerIQ data, resume information, and PDF exports"
        >
          {/* Resume data */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '2px' }}>Resume Data</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Manage and upload information extracted from your resume</div>
            </div>
            <Link to="/resume-analysis" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Database size={14} />
              Manage Resume Data
            </Link>
          </div>

          {/* Download Data as PDF */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '2px' }}>Download My Data</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Export an official PDF report of your candidate profile, skills, and intelligence data</div>
            </div>
            <button type="button" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }} onClick={() => setDownloadModal(true)}>
              <Download size={14} />
              Download PDF
            </button>
          </div>

          {/* Recommendation data */}
          <div style={{ paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '2px' }}>Recommendation Data</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>View details and manage recommendations stored in MySQL</div>
            </div>
            <button type="button" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }} onClick={handleOpenRecModal}>
              <Database size={14} />
              Manage Data
            </button>
          </div>
        </SettingsCard>

        {/* ── 6. ACCOUNT ────────────────────────────────────────────────── */}
        <SettingsCard
          icon={User}
          title="Account"
          subtitle="Your account details and security settings"
        >
          {/* Email */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line, #f1f5f9)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy, #0f172a)' }}>
              {userEmail || <span style={{ color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>No email found — please log in again</span>}
            </div>
          </div>

          {/* Change password */}
          <div style={{ paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '2px' }}>Change Password</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Update your account password stored securely in MySQL</div>
            </div>
            <button type="button" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }} onClick={() => setPwModal(true)}>
              <Key size={14} />
              Change Password
            </button>
          </div>
        </SettingsCard>

        {/* ── 7. DANGER ZONE ────────────────────────────────────────────── */}
        <SettingsCard
          icon={AlertTriangle}
          title="Danger Zone"
          subtitle="Irreversible actions — proceed with caution"
          danger
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', marginBottom: '2px' }}>Delete Account</div>
              <div style={{ fontSize: '12px', color: '#f87171' }}>Permanently delete your CareerIQ account, resume, and MySQL records</div>
            </div>
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1.5px solid #fca5a5',
                background: '#fff5f5',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#fca5a5'; }}
            >
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>
        </SettingsCard>

        {/* ════════════════════════════════════════════════════════════════
            MODALS
        ════════════════════════════════════════════════════════════════ */}

        {/* Download Data as PDF modal */}
        <Modal show={downloadModal} onClose={() => setDownloadModal(false)} title="Download My Data (PDF Report)">
          <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '14px',
              background: '#eff6ff', color: '#2563eb', margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy, #0f172a)', margin: '0 0 8px' }}>
              Candidate Intelligence Report (PDF)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', lineHeight: 1.6, margin: 0 }}>
              Export an official formatted PDF document containing your complete account details, verified skills catalog, career preferences, and AI career recommendations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn outline" onClick={() => setDownloadModal(false)} style={{ flex: 1 }}>Cancel</button>
            <button
              type="button"
              className="btn"
              onClick={handleDownloadPdf}
              disabled={downloadLoading}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Download size={14} /> {downloadLoading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </Modal>

        {/* Recommendation Data modal */}
        <Modal show={recDataModal} onClose={() => setRecDataModal(false)} title="Recommendation Data">
          {recLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted, #64748b)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px' }} />
              <div>Loading recommendation records...</div>
            </div>
          ) : recDetails?.has_data ? (
            <div>
              {recActionMsg && (
                <div style={{ padding: '8px 12px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {recActionMsg}
                </div>
              )}
              <div style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', marginBottom: '14px' }}>
                Latest Analysis Run: <strong>#{recDetails.analysis_id}</strong> ({new Date(recDetails.analysis_date).toLocaleDateString()})
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {recDetails.recommendations.map(r => (
                  <div key={r.role} style={{ padding: '10px 14px', background: 'var(--bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--line, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy, #0f172a)' }}>#{r.rank} {r.role}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>{r.summary || 'AI role recommendation'}</div>
                    </div>
                    <span className="pill blue" style={{ fontSize: '12px' }}>{r.match}% match</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn outline" onClick={() => setRecDataModal(false)} style={{ flex: 1 }}>Close</button>
                <button type="button" className="btn outline" onClick={handleClearRecData} style={{ flex: 1, borderColor: '#fca5a5', color: '#dc2626' }}>
                  Reset Recommendations
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted, #64748b)', lineHeight: 1.6, marginBottom: '20px' }}>
                {recActionMsg || 'No recommendation data found in the database. Upload a resume to generate fresh AI recommendations.'}
              </div>
              <button type="button" className="btn" onClick={() => setRecDataModal(false)} style={{ width: '100%' }}>Got it</button>
            </div>
          )}
        </Modal>

        {/* Change Password modal */}
        <Modal show={pwModal} onClose={() => { setPwModal(false); setPwError(''); setPwSuccess(''); }} title="Change Password">
          <form onSubmit={handlePasswordSubmit}>
            {pwError && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 14 }}>
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', fontSize: 13, marginBottom: 14 }}>
                {pwSuccess}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text, #1e293b)' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  style={{ width: '100%', paddingRight: 40 }}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748b)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text, #1e293b)' }}>New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="input"
                style={{ width: '100%' }}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text, #1e293b)' }}>Confirm New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="input"
                style={{ width: '100%' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn outline" onClick={() => setPwModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn" disabled={pwLoading} style={{ flex: 1 }}>
                {pwLoading ? 'Updating...' : 'Save Password'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Account confirmation modal */}
        <Modal show={deleteModal} onClose={() => { setDeleteModal(false); setDeleteError(''); }} title="Delete Account?">
          <form onSubmit={handleDeleteAccountSubmit}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted, #475569)', lineHeight: 1.6, marginBottom: '8px' }}>
              Are you sure you want to delete your account? All your profiles, uploaded resumes, and roadmap records will be permanently erased from MySQL.
            </div>
            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600, marginBottom: '16px' }}>
              ⚠ This action is permanent and cannot be undone.
            </div>

            {deleteError && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 14 }}>
                {deleteError}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text, #1e293b)' }}>Enter Password to Confirm</label>
              <input
                type="password"
                className="input"
                style={{ width: '100%' }}
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Your account password"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn outline" style={{ flex: 1 }} onClick={() => setDeleteModal(false)}>Cancel</button>
              <button
                type="submit"
                disabled={deleteLoading}
                style={{
                  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '8px', border: 'none',
                  background: '#ef4444', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: deleteLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <Trash2 size={14} />
                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </form>
        </Modal>

      </Page>
    </Layout>
  );
}
