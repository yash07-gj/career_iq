import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, GraduationCap, Briefcase, Save, Plus, X, Upload, Target } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import auth from '../utils/auth';
import api from '../services/api';

export default function Profile() {
  const currentUser = auth.getUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  
  const fileInputRef = useRef(null);
  const [saved, setSaved] = useState(false);

  // Suggested target roles (from the career roles table); users can also type their own
  const [roleOptions, setRoleOptions] = useState([
    'Data Scientist', 'Data Analyst', 'Business Analyst', 'BI Analyst', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'Machine Learning Engineer',
  ]);
  useEffect(() => {
    api.getCareerRoles()
      .then((roles) => {
        if (Array.isArray(roles) && roles.length) {
          setRoleOptions([...new Set(roles.map((r) => r.role_name).filter(Boolean))]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser?.user_id) {
      loadProfile();
    }
  }, [currentUser?.user_id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile(currentUser.user_id);
      setProfile(data);
      setFullName(data.full_name || currentUser.full_name);
      setEmail(data.email || currentUser.email);
      setSkills(data.skills || []);
      setTargetRole(data.target_role_name || '');
      setEducation(data.education || '');
      setExperience(data.experience || '');
      setPhotoUrl(data.profile_picture_url || null);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = await api.updateProfile(currentUser.user_id, {
        full_name: fullName,
        email: email,
        target_role_name: targetRole,
        education: education,
        experience: experience,
        skills: skills
      });
      
      // Update local storage user if name changed
      auth.setUser({
        ...currentUser,
        full_name: fullName,
        profile_picture_url: data.profile_picture_url,
        target_role: data.target_role_name,
        target_role_id: data.target_role_id
      });
      window.dispatchEvent(new Event('authChange'));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const res = await api.uploadProfilePhoto(currentUser.user_id, file);
      setPhotoUrl(res.profile_picture_url);
      
      auth.setUser({
        ...currentUser,
        profile_picture_url: res.profile_picture_url
      });
      window.dispatchEvent(new Event('authChange'));
    } catch (err) {
      console.error('Photo upload failed', err);
    }
  };

  const initial = fullName ? fullName.charAt(0).toUpperCase() : 'U';
  
  const fullPhotoUrl = photoUrl ? `http://127.0.0.1:8000${photoUrl}` : null;

  if (loading) {
    return (
      <Layout>
        <Page title="My Profile" subtitle="Manage your personal information and career preferences">
          <div className="ui-grid split-rev">
            <div className="card card-pad stack">
              <div className="skeleton" style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto' }} />
              <div className="skeleton" style={{ height: 16, width: '60%', margin: '0 auto' }} />
              <div className="skeleton" style={{ height: 12, width: '40%', margin: '0 auto' }} />
            </div>
            <div className="card card-pad stack">
              <div className="muted text-sm">Loading profile...</div>
              <div className="skeleton" style={{ height: 40 }} />
              <div className="skeleton" style={{ height: 40 }} />
              <div className="skeleton" style={{ height: 40 }} />
            </div>
          </div>
        </Page>
      </Layout>
    );
  }

  return (
    <Layout>
      <Page title="My Profile" subtitle="Manage your personal information and career preferences">
        <div className="ui-grid split-rev">
          {/* AVATAR + SKILLS CARD */}
          <div className="card card-pad stack" style={{ alignItems: 'center', textAlign: 'center', alignSelf: 'start' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 34,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: '#ffffff',
                background: fullPhotoUrl
                  ? `center / cover no-repeat url(${fullPhotoUrl})`
                  : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                boxShadow: '0 0 0 4px var(--surface), 0 0 0 7px var(--accent-soft)',
              }}
              aria-label={fullName}
            >
              {!fullPhotoUrl && initial}
            </div>
            <div>
              <h3 className="card-title" style={{ fontSize: 18 }}>{fullName}</h3>
              <p className="muted text-sm" style={{ margin: '2px 0 0' }}>Candidate Profile</p>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <button type="button" className="btn outline small" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> Change Photo
            </button>

            <div style={{ width: '100%', textAlign: 'left', marginTop: 8 }}>
              <div className="label" style={{ marginBottom: 10 }}>Your Skills</div>
              <div className="chips">
                {skills.map((s) => (
                  <span className="pill info" key={s}>
                    {s}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      aria-label={`Remove ${s}`}
                      style={{ color: 'inherit' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newSkill && !skills.includes(newSkill)) {
                    setSkills([...skills, newSkill]);
                    setNewSkill('');
                  }
                }}
                style={{ display: 'flex', gap: 8, marginTop: 12 }}
              >
                <input
                  className="input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill"
                  aria-label="Add skill"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn" aria-label="Add skill">
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <form className="card card-pad" onSubmit={handleSave}>
            <div className="card-head">
              <h3 className="card-title">Personal Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="profile-name">Full Name</label>
                <div className="input-icon">
                  <User size={15} />
                  <input
                    id="profile-name"
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-email">Email</label>
                <div className="input-icon">
                  <Mail size={15} />
                  <input
                    id="profile-email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled // usually email should not be casually changed without verification
                    style={{ background: 'var(--surface-2)' }}
                  />
                </div>
              </div>
            </div>

            <div className="ui-grid">
              <div className="form-group">
                <label className="label" htmlFor="profile-education">Education</label>
                <div className="input-icon">
                  <GraduationCap size={15} />
                  <input
                    id="profile-education"
                    className="input"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech in Computer Science"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-experience">Experience</label>
                <div className="input-icon">
                  <Briefcase size={15} />
                  <input
                    id="profile-experience"
                    className="input"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 2 years as Developer"
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label" htmlFor="profile-target">Target Career</label>
              <div className="input-icon">
                <Target size={15} />
                <input
                  id="profile-target"
                  className="input"
                  list="profile-target-options"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Choose from the list or type your own role"
                  autoComplete="off"
                />
              </div>
              <datalist id="profile-target-options">
                {roleOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <span className="muted text-xs">Filled from your resume. Pick a suggested role or type a different one.</span>
            </div>

            <button type="submit" className={`btn ${saved ? 'green' : ''}`} disabled={saving}>
              {saving ? 'Saving...' : (saved ? 'Saved ✓' : 'Save Changes')}
              {!saving && !saved && <Save size={16} />}
            </button>
          </form>
        </div>
      </Page>
    </Layout>
  );
}
