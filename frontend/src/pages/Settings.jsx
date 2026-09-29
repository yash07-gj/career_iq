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
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import auth from '../utils/auth';

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
    background: danger ? '#fff5f5' : '#ffffff',
    border: `1px solid ${danger ? '#fecaca' : '#e2e8f0'}`,
    borderRadius: '14px',
    boxShadow: '0 4px 16px -2px rgba(15,23,42,0.08), 0 2px 6px -1px rgba(15,23,42,0.04)',
    marginBottom: '24px',
    overflow: 'hidden',
  }}>
    {/* Card header */}
    <div style={{
      padding: '20px 28px',
      borderBottom: `1px solid ${danger ? '#fecaca' : '#f1f5f9'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: danger ? '#fee2e2' : iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={danger ? '#ef4444' : iconColor} />
      </div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: danger ? '#991b1b' : '#0f172a', lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{subtitle}</div>}
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
    borderBottom: noBorder ? 'none' : '1px solid #f1f5f9',
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{label}</div>
      {description && <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{description}</div>}
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
      background: checked ? '#2563eb' : '#cbd5e1',
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
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff', borderRadius: '14px',
          width: '100%', maxWidth: '440px',
          boxShadow: '0 20px 50px rgba(15,23,42,0.2)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{title}</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>
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
  const user = auth.getUser();
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

  // modals
  const [resumeModal, setResumeModal]     = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [recDataModal, setRecDataModal]   = useState(false);
  const [pwModal, setPwModal]             = useState(false);
  const [deleteModal, setDeleteModal]     = useState(false);

  // ── persist ────────────────────────────────────────────────────────────────
  useEffect(() => { writeLS(LS_THEME, theme); applyTheme(theme); }, [theme]);
  useEffect(() => { writeLS(LS_COMPACT, compactMode); }, [compactMode]);
  useEffect(() => { writeLS(LS_NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { writeLS(LS_PREFERENCES, preferences); }, [preferences]);
  useEffect(() => { writeLS(LS_AI_SETTINGS, aiSettings); }, [aiSettings]);

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

  // apply on mount
  useEffect(() => { applyTheme(theme); }, []); // eslint-disable-line

  // ── helpers ────────────────────────────────────────────────────────────────
  const toggleNotif = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAI    = (key) => setAiSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleInterest = (interest) => setPreferences(prev => {
    const has = prev.interests.includes(interest);
    return { ...prev, interests: has ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest] };
  });

  const themeOptions = [
    { id: 'light',  label: 'Light',  icon: Sun },
    { id: 'dark',   label: 'Dark',   icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const workTypes  = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Any'];
  const locations  = ['Ahmedabad', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Remote', 'Any'];
  const interestOptions = [
    'Data Analytics', 'Data Science', 'Business Intelligence',
    'Software Development', 'Web Development', 'Machine Learning', 'Cloud Computing',
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <Page title="Settings" subtitle="Manage your application preferences and account settings">

        {/* ── 1. APPEARANCE ─────────────────────────────────────────────── */}
        <SettingsCard
          icon={Sun}
          title="Appearance"
          subtitle="Customize how CareerIQ looks for you"
        >
          {/* Theme selector */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Theme</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {themeOptions.map(({ id, label, icon: Icon }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '9px',
                      border: active ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      background: active ? '#eff6ff' : '#ffffff',
                      color: active ? '#2563eb' : '#64748b',
                      fontSize: '13px',
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: active ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                    }}
                  >
                    <Icon size={16} />
                    {label}
                    {active && <Check size={14} style={{ marginLeft: '2px' }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
              {theme === 'system' ? "CareerIQ will follow your operating system's color preference." :
               theme === 'dark'   ? 'Dark mode is active. Darker backgrounds and surfaces are applied.' :
                                    'Light mode is active. Standard CareerIQ interface.'}
            </div>
          </div>

          {/* Compact mode */}
          <SettingsRow
            label="Compact Mode"
            description="Reduce spacing and card sizes for a denser layout"
            noBorder
          >
            <Toggle checked={compactMode} onChange={setCompactMode} />
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
          subtitle="Set preferences used by CareerIQ recommendations"
        >
          {/* Work type */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Preferred Work Type</div>
            <div style={{ position: 'relative', maxWidth: '280px' }}>
              <select
                className="select"
                value={preferences.workType}
                onChange={e => setPreferences(p => ({ ...p, workType: e.target.value }))}
                style={{ appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
              >
                {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Location */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Preferred Location</div>
            <div style={{ position: 'relative', maxWidth: '280px' }}>
              <select
                className="select"
                value={preferences.location}
                onChange={e => setPreferences(p => ({ ...p, location: e.target.value }))}
                style={{ appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Career interests */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Career Interests</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Select all that apply</div>
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
                      border: selected ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                      background: selected ? '#eff6ff' : '#ffffff',
                      color: selected ? '#2563eb' : '#475569',
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
            <Toggle checked={preferences.remoteOk} onChange={v => setPreferences(p => ({ ...p, remoteOk: v }))} />
          </SettingsRow>
        </SettingsCard>

        {/* ── 4. AI & RECOMMENDATIONS ───────────────────────────────────── */}
        <SettingsCard
          icon={Brain}
          title="AI & Recommendations"
          subtitle="Control how CareerIQ uses your profile for personalised recommendations"
        >
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#0369a1',
            lineHeight: 1.6,
          }}>
            <strong>Note:</strong> These preferences are stored locally and will be applied when the AI recommendation engine is connected. They do not affect live AI behaviour yet.
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
          subtitle="Manage your CareerIQ data and resume information"
        >
          {/* Resume data */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>Resume Data</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Manage information extracted from your uploaded resume</div>
            </div>
            <button type="button" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }} onClick={() => setResumeModal(true)}>
              <Database size={14} />
              Manage Resume Data
            </button>
          </div>

          {/* Download */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>Download My Data</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Export a copy of your CareerIQ account data</div>
            </div>
            <button type="button" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }} onClick={() => setDownloadModal(true)}>
              <Download size={14} />
              Download Data
            </button>
          </div>

          {/* Recommendation data */}
          <div style={{ paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>Recommendation Data</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Manage information used for personalised career recommendations</div>
            </div>
            <button type="button" className="btn outline" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }} onClick={() => setRecDataModal(true)}>
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
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
              {userEmail || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No email found — please log in again</span>}
            </div>
          </div>

          {/* Change password */}
          <div style={{ paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>Change Password</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Update your account password</div>
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
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>Delete Account</div>
              <div style={{ fontSize: '12px', color: '#b91c1c' }}>Permanently delete your CareerIQ account and all associated data</div>
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

        {/* Resume Data modal */}
        <Modal show={resumeModal} onClose={() => setResumeModal(false)} title="Resume Data">
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>
            Resume data management will be available once the backend data pipeline is connected. Your uploaded resume and extracted information will be viewable and editable here.
          </div>
          <button type="button" className="btn" onClick={() => setResumeModal(false)} style={{ width: '100%' }}>Got it</button>
        </Modal>

        {/* Download Data modal */}
        <Modal show={downloadModal} onClose={() => setDownloadModal(false)} title="Download My Data">
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>
            Data export will be available once backend account management is connected. You will be able to download a complete copy of your CareerIQ profile, preferences, and activity data.
          </div>
          <button type="button" className="btn" onClick={() => setDownloadModal(false)} style={{ width: '100%' }}>Got it</button>
        </Modal>

        {/* Recommendation Data modal */}
        <Modal show={recDataModal} onClose={() => setRecDataModal(false)} title="Recommendation Data">
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>
            Recommendation data management will be available once the AI recommendation engine backend is connected. You will be able to view and clear the data used to personalise your career suggestions.
          </div>
          <button type="button" className="btn" onClick={() => setRecDataModal(false)} style={{ width: '100%' }}>Got it</button>
        </Modal>

        {/* Change Password modal */}
        <Modal show={pwModal} onClose={() => setPwModal(false)} title="Change Password">
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px',
            padding: '14px 16px', marginBottom: '20px',
          }}>
            <Key size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
              Password management will be available after authentication is fully connected. This feature will let you update your password securely.
            </div>
          </div>
          <button type="button" className="btn" onClick={() => setPwModal(false)} style={{ width: '100%' }}>Got it</button>
        </Modal>

        {/* Delete Account confirmation modal */}
        <Modal show={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account?">
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '8px' }}>
            Are you sure you want to delete your account?
          </div>
          <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600, marginBottom: '20px' }}>
            ⚠ This action cannot be undone.
          </div>
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#991b1b', lineHeight: 1.6,
          }}>
            Account deletion will be available once backend authentication and account management are connected. No data will be deleted at this time.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn outline" style={{ flex: 1 }} onClick={() => setDeleteModal(false)}>Cancel</button>
            <button
              type="button"
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '8px', border: 'none',
                background: '#ef4444', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'not-allowed',
                opacity: 0.5,
              }}
              title="Account deletion requires backend authentication"
              disabled
            >
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>
        </Modal>

      </Page>
    </Layout>
  );
}
