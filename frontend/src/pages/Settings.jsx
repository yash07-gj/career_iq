import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Shield,
  User,
  AlertTriangle,
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
const SettingsCard = ({ icon: Icon, title, subtitle, children, danger = false, wide = false }) => (
  <div
    className="card card-pad"
    style={{
      ...(wide ? { gridColumn: '1 / -1' } : {}),
      ...(danger ? { borderColor: 'var(--bad)' } : {}),
    }}
  >
    {/* Card header */}
    <div className="card-head" style={{ justifyContent: 'flex-start', gap: 14, flexWrap: 'nowrap' }}>
      <div className={`list-icon ${danger ? 'bad' : ''}`}>
        <Icon size={19} />
      </div>
      <div style={{ minWidth: 0 }}>
        <h3 className="card-title" style={danger ? { color: 'var(--bad)' } : undefined}>{title}</h3>
        {subtitle && <p className="card-sub">{subtitle}</p>}
      </div>
    </div>
    {/* Card body */}
    <div>{children}</div>
  </div>
);

/** Row with label + description on the left, control on the right */
const SettingsRow = ({ label, description, children }) => (
  <div className="set-row">
    <div style={{ flex: 1, minWidth: 0 }}>
      <strong>{label}</strong>
      {description && <p>{description}</p>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

/** Modal overlay */
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
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
  const [theme, setTheme] = useState(() => readLS(LS_THEME, 'dark'));
  // Compact mode was removed from Settings; keep it switched off everywhere.
  const compactMode = false;

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
          writeLS(LS_COMPACT, false);
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


  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <Page
        title="Settings"
        subtitle="Manage your application preferences, appearance, and account security"
        action={
          syncStatus ? (
            <span className="pill good">
              <Check size={14} />
              {syncStatus}
            </span>
          ) : isSyncing ? (
            <span className="pill info">
              <RefreshCw size={13} className="spin" />
              Saving...
            </span>
          ) : null
        }
      >
        <div className="ui-grid cols-2" style={{ alignItems: 'stretch' }}>

        {/* ── 1. APPEARANCE ─────────────────────────────────────────────── */}
        <SettingsCard
          icon={Sun}
          title="Appearance"
          subtitle="Choose how CareerIQ looks"
        >
          {/* Theme selector */}
          <div className="set-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <strong>Theme</strong>
            <div className="seg" role="group" aria-label="Theme">
              {themeOptions.map(({ id, label, icon: Icon }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={active ? 'on' : ''}
                    aria-pressed={active}
                    onClick={() => handleThemeChange(id)}
                  >
                    <Icon size={15} />
                    {label}
                    {active && <Check size={13} />}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: 0 }}>
              {theme === 'system' ? "CareerIQ dynamically matches your device operating system's color scheme." :
               theme === 'dark'   ? 'Dark mode is active. Dark surfaces and high contrast text are applied.' :
                                    'Light mode is active. Clean standard CareerIQ interface.'}
            </p>
          </div>
        </SettingsCard>

        {/* ── 2. ACCOUNT ────────────────────────────────────────────────── */}
        <SettingsCard
          icon={User}
          title="Account"
          subtitle="Your account details and security settings"
        >
          {/* Email */}
          <div className="set-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <span className="stat-label" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>Email Address</span>
            <strong style={{ fontSize: 15, wordBreak: 'break-all' }}>
              {userEmail || <span className="muted" style={{ fontStyle: 'italic', fontWeight: 500 }}>No email found — please log in again</span>}
            </strong>
          </div>

          {/* Change password */}
          <SettingsRow label="Change Password" description="Update your account password stored securely in MySQL">
            <button type="button" className="btn outline small" onClick={() => setPwModal(true)}>
              <Key size={14} />
              Change Password
            </button>
          </SettingsRow>
        </SettingsCard>

        {/* ── 3. PRIVACY & DATA ─────────────────────────────────────────── */}
        <SettingsCard
          icon={Shield}
          title="Privacy & Data"
          wide
          subtitle="Manage your CareerIQ data, resume information, and PDF exports"
        >
          {/* Resume data */}
          <SettingsRow label="Resume Data" description="Manage and upload information extracted from your resume">
            <Link to="/resume-analysis" className="btn outline small">
              <Database size={14} />
              Manage Resume Data
            </Link>
          </SettingsRow>

          {/* Download Data as PDF */}
          <SettingsRow label="Download My Data" description="Export an official PDF report of your candidate profile, skills, and intelligence data">
            <button type="button" className="btn outline small" onClick={() => setDownloadModal(true)}>
              <Download size={14} />
              Download PDF
            </button>
          </SettingsRow>

          {/* Recommendation data */}
          <SettingsRow label="Recommendation Data" description="View details and manage recommendations stored in MySQL">
            <button type="button" className="btn outline small" onClick={handleOpenRecModal}>
              <Database size={14} />
              Manage Data
            </button>
          </SettingsRow>
        </SettingsCard>

        {/* ── 4. DANGER ZONE ────────────────────────────────────────────── */}
        <SettingsCard
          icon={AlertTriangle}
          title="Danger Zone"
          subtitle="Irreversible actions — proceed with caution"
          danger
          wide
        >
          <div className="set-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong className="text-bad">Delete Account</strong>
              <p>Permanently delete your CareerIQ account, resume, and MySQL records</p>
            </div>
            <button
              type="button"
              className="btn outline danger small"
              onClick={() => setDeleteModal(true)}
            >
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>
        </SettingsCard>

        </div>

        {/* ════════════════════════════════════════════════════════════════
            MODALS
        ════════════════════════════════════════════════════════════════ */}

        {/* Download Data as PDF modal */}
        <Modal show={downloadModal} onClose={() => setDownloadModal(false)} title="Download My Data (PDF Report)">
          <div className="empty-state" style={{ padding: '4px 0 16px' }}>
            <div className="empty-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <FileText size={26} />
            </div>
            <h4>Candidate Intelligence Report (PDF)</h4>
            <p>
              Export an official formatted PDF document containing your complete account details, verified skills catalog, career preferences, and AI career recommendations.
            </p>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn outline" onClick={() => setDownloadModal(false)}>Cancel</button>
            <button
              type="button"
              className="btn"
              onClick={handleDownloadPdf}
              disabled={downloadLoading}
            >
              <Download size={14} /> {downloadLoading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </Modal>

        {/* Recommendation Data modal */}
        <Modal show={recDataModal} onClose={() => setRecDataModal(false)} title="Recommendation Data">
          {recLoading ? (
            <div className="empty-state">
              <RefreshCw size={24} className="spin" />
              <p>Loading recommendation records...</p>
            </div>
          ) : recDetails?.has_data ? (
            <div className="stack">
              {recActionMsg && (
                <div className="notice good text-sm">{recActionMsg}</div>
              )}
              <div className="muted text-sm">
                Latest Analysis Run: <strong style={{ color: 'var(--ink)' }}>#{recDetails.analysis_id}</strong> ({new Date(recDetails.analysis_date).toLocaleDateString()})
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                {recDetails.recommendations.map(r => (
                  <div key={r.role} className="list-row" style={{ margin: 0 }}>
                    <div className="list-main">
                      <strong>#{r.rank} {r.role}</strong>
                      <span>{r.summary || 'AI role recommendation'}</span>
                    </div>
                    <span className="pill info">{r.match}% match</span>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn outline" onClick={() => setRecDataModal(false)}>Close</button>
                <button type="button" className="btn outline danger" onClick={handleClearRecData}>
                  Reset Recommendations
                </button>
              </div>
            </div>
          ) : (
            <div className="stack">
              <p className="muted text-sm" style={{ margin: 0, lineHeight: 1.6 }}>
                {recActionMsg || 'No recommendation data found in the database. Upload a resume to generate fresh AI recommendations.'}
              </p>
              <button type="button" className="btn block" onClick={() => setRecDataModal(false)}>Got it</button>
            </div>
          )}
        </Modal>

        {/* Change Password modal */}
        <Modal show={pwModal} onClose={() => { setPwModal(false); setPwError(''); setPwSuccess(''); }} title="Change Password">
          <form onSubmit={handlePasswordSubmit}>
            {pwError && (
              <div className="notice bad text-sm" style={{ marginBottom: 14 }}>{pwError}</div>
            )}
            {pwSuccess && (
              <div className="notice good text-sm" style={{ marginBottom: 14 }}>
                <Check size={16} />
                <span className="notice-main">{pwSuccess}</span>
              </div>
            )}

            <div className="form-group">
              <label className="label" htmlFor="pw-current">Current Password</label>
              <div className="input-icon">
                <input
                  id="pw-current"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  style={{ paddingRight: 40 }}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="pw-new">New Password</label>
              <input
                id="pw-new"
                type={showPw ? 'text' : 'password'}
                className="input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label" htmlFor="pw-confirm">Confirm New Password</label>
              <input
                id="pw-confirm"
                type={showPw ? 'text' : 'password'}
                className="input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn outline" onClick={() => setPwModal(false)}>Cancel</button>
              <button type="submit" className="btn" disabled={pwLoading}>
                {pwLoading ? 'Updating...' : 'Save Password'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Account confirmation modal */}
        <Modal show={deleteModal} onClose={() => { setDeleteModal(false); setDeleteError(''); }} title="Delete Account?">
          <form onSubmit={handleDeleteAccountSubmit}>
            <p className="muted text-sm" style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
              Are you sure you want to delete your account? All your profiles, uploaded resumes, and roadmap records will be permanently erased from MySQL.
            </p>
            <p className="text-bad text-sm" style={{ margin: '0 0 16px', fontWeight: 600 }}>
              ⚠ This action is permanent and cannot be undone.
            </p>

            {deleteError && (
              <div className="notice bad text-sm" style={{ marginBottom: 14 }}>{deleteError}</div>
            )}

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label" htmlFor="delete-password">Enter Password to Confirm</label>
              <input
                id="delete-password"
                type="password"
                className="input"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Your account password"
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn outline" onClick={() => setDeleteModal(false)}>Cancel</button>
              <button type="submit" className="btn danger" disabled={deleteLoading}>
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
