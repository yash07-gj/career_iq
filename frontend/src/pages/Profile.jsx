import React, { useState } from 'react';
import { User, Mail, GraduationCap, Briefcase, Save, Plus, X } from 'lucide-react';
import { mockUserProfile } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';
import auth from '../utils/auth';

export default function Profile() {
  const currentUser = auth.getUser();
  const userName = currentUser?.full_name || mockUserProfile.name;
  const userEmail = currentUser?.email || mockUserProfile.email;
  const initial = userName.charAt(0).toUpperCase() || 'U';

  const [skills, setSkills] = useState(mockUserProfile.currentSkills);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  const handleSave = (e) => {
    e.preventDefault();
    auth.setUser({
      ...currentUser,
      full_name: fullName,
      email: email,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Layout>
      <Page title="My Profile" subtitle="Manage your personal information and career preferences">
        <div className="profile-grid">
          <div className="card profile-card">
            <div className="profile-avatar">{initial}</div>
            <div className="profile-name">{fullName}</div>
            <div className="profile-role">Candidate Profile</div>
            <button className="btn outline small">Change Photo</button>
            <div style={{ textAlign: 'left', marginTop: 20 }}>
              <div className="label">Your Skills</div>
              <div className="skill-tags">
                {skills.map((s) => (
                  <span className="tag" key={s}>
                    {s}
                    <X
                      size={9}
                      style={{ marginLeft: 3, cursor: 'pointer' }}
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
                style={{ display: 'flex', gap: 6, marginTop: 10 }}
              >
                <input
                  className="input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill"
                />
                <button type="submit" className="btn small">
                  <Plus size={11} />
                </button>
              </form>
            </div>
          </div>

          <form className="card card-pad" onSubmit={handleSave}>
            <h3 className="card-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={13} style={{ position: 'absolute', left: 9, top: 10, color: '#93a4b8' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 28 }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={13} style={{ position: 'absolute', left: 9, top: 10, color: '#93a4b8' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 28 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Education</label>
                <input className="input" defaultValue={mockUserProfile.education} />
              </div>
              <div className="form-group">
                <label className="label">Experience</label>
                <input className="input" defaultValue={mockUserProfile.experience} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Target Career</label>
              <select className="select" defaultValue={mockUserProfile.targetRole}>
                <option>Data Scientist</option>
                <option>Data Analyst</option>
                <option>Business Analyst</option>
                <option>BI Analyst</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>Machine Learning Engineer</option>
              </select>
            </div>
            <button type="submit" className="btn">
              {saved ? 'Saved ✓' : 'Save Changes'} <Save size={12} />
            </button>
          </form>
        </div>
      </Page>
    </Layout>
  );
}
