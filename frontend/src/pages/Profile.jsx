import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, GraduationCap, Briefcase, Save, Plus, X, Upload } from 'lucide-react';
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
          <div>Loading profile...</div>
        </Page>
      </Layout>
    );
  }

  return (
    <Layout>
      <Page title="My Profile" subtitle="Manage your personal information and career preferences">
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div className="card profile-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div 
              className="profile-avatar" 
              style={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                margin: '0 auto 15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                backgroundColor: '#e2e8f0',
                color: '#475569',
                backgroundImage: fullPhotoUrl ? `url(${fullPhotoUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!fullPhotoUrl && initial}
            </div>
            <div className="profile-name" style={{ fontSize: 20, fontWeight: 600 }}>{fullName}</div>
            <div className="profile-role" style={{ color: '#64748b', marginBottom: 15 }}>Candidate Profile</div>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handlePhotoUpload} 
            />
            <button className="btn outline small" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} style={{ marginRight: 5 }}/> Change Photo
            </button>
            
            <div style={{ textAlign: 'left', marginTop: 30 }}>
              <div className="label" style={{ fontWeight: 600, marginBottom: 10 }}>Your Skills</div>
              <div className="skill-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map((s) => (
                  <span className="tag" key={s} style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                    {s}
                    <X
                      size={10}
                      style={{ marginLeft: 5, cursor: 'pointer' }}
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                    />
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
                style={{ display: 'flex', gap: 6, marginTop: 15 }}
              >
                <input
                  className="input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill"
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }}
                />
                <button type="submit" className="btn small" style={{ padding: '8px 12px' }}>
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </div>

          <form className="card card-pad" onSubmit={handleSave} style={{ padding: '24px' }}>
            <h3 className="card-title" style={{ marginTop: 0, marginBottom: 20, fontSize: 18 }}>Personal Information</h3>
            <div className="form-row" style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label" style={{ display: 'block', marginBottom: 5 }}>Full Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 36, width: '100%', padding: '8px 8px 8px 36px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4 }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label" style={{ display: 'block', marginBottom: 5 }}>Email</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    className="input"
                    type="email"
                    style={{ paddingLeft: 36, width: '100%', padding: '8px 8px 8px 36px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled // usually email shouldn't be casually changed without verification
                  />
                </div>
              </div>
            </div>
            
            <div className="form-row" style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label" style={{ display: 'block', marginBottom: 5 }}>Education</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <GraduationCap size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                  <input 
                    className="input" 
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech in Computer Science"
                    style={{ paddingLeft: 36, width: '100%', padding: '8px 8px 8px 36px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4 }} 
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label" style={{ display: 'block', marginBottom: 5 }}>Experience</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Briefcase size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                  <input 
                    className="input" 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 2 years as Developer"
                    style={{ paddingLeft: 36, width: '100%', padding: '8px 8px 8px 36px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4 }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: 25 }}>
              <label className="label" style={{ display: 'block', marginBottom: 5 }}>Target Career</label>
              <select 
                className="select" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }}
              >
                <option value="">Select Target Career...</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="BI Analyst">BI Analyst</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              </select>
            </div>
            
            <button type="submit" className="btn" disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {saving ? 'Saving...' : (saved ? 'Saved ✓' : 'Save Changes')} 
              {!saving && !saved && <Save size={16} />}
            </button>
          </form>
        </div>
      </Page>
    </Layout>
  );
}
