import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Award, Eye, Building2, RefreshCw, Sparkles, Filter, X, Laptop, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';

export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  // Read saved user preferences from Settings (localStorage)
  const savedPrefs = (() => {
    try {
      const v = localStorage.getItem('careerIQ_preferences');
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  })();

  const [selectedLocation, setSelectedLocation] = useState(
    savedPrefs?.location && savedPrefs.location !== 'Any' ? savedPrefs.location : 'All'
  );
  const [selectedExp, setSelectedExp] = useState('All');
  const [selectedType, setSelectedType] = useState(
    savedPrefs?.workType && savedPrefs.workType !== 'Any' ? savedPrefs.workType : 'All'
  );
  const [remoteOnly, setRemoteOnly] = useState(Boolean(savedPrefs?.remoteOk));
  const [selectedInterests, setSelectedInterests] = useState(savedPrefs?.interests || []);

  const hasPreferencesActive =
    (savedPrefs?.location && savedPrefs.location !== 'Any') ||
    (savedPrefs?.workType && savedPrefs.workType !== 'Any') ||
    savedPrefs?.remoteOk ||
    (savedPrefs?.interests && savedPrefs.interests.length > 0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const clearFilters = () => {
    setQ('');
    setSelectedLocation('All');
    setSelectedExp('All');
    setSelectedType('All');
    setRemoteOnly(false);
    setSelectedInterests([]);
  };

  const filteredJobs = jobs.filter((j) => {
    const jobTitle = (j.job_title || '').toLowerCase();
    const company = (j.company_name || '').toLowerCase();
    const skills = (j.skills || []).map((s) => s.toLowerCase());
    const query = q.toLowerCase();

    const matchesSearch =
      jobTitle.includes(query) ||
      company.includes(query) ||
      skills.some((s) => s.includes(query));

    // 1. Remote Work Filter:
    // When Open to Remote Work toggle is ON -> show ONLY Remote Work
    // When OFF -> show all types of work (Hybrid, Onsite, Remote)
    if (remoteOnly) {
      const isRemote =
        (j.work_mode || '').toLowerCase().includes('remote') ||
        (j.location || '').toLowerCase().includes('remote');
      if (!isRemote) return false;
    }

    // 2. Preferred Location Filter
    const loc = (j.location || '').toLowerCase();
    const mode = (j.work_mode || '').toLowerCase();
    let matchesLoc = selectedLocation === 'All';
    if (!matchesLoc) {
      const targetLoc = selectedLocation.toLowerCase();
      if (targetLoc === 'remote') {
        matchesLoc = loc.includes('remote') || mode.includes('remote');
      } else if (targetLoc === 'delhi' || targetLoc === 'gurgaon') {
        matchesLoc = loc.includes('delhi') || loc.includes('gurgaon') || loc.includes('noida');
      } else {
        matchesLoc = loc.includes(targetLoc);
      }
    }

    // 3. Preferred Work Type Filter
    const type = (j.job_type || '').toLowerCase();
    let matchesType = selectedType === 'All';
    if (!matchesType) {
      const targetType = selectedType.toLowerCase();
      if (targetType === 'internship') {
        matchesType = type.includes('intern') || jobTitle.includes('intern');
      } else if (targetType === 'full-time') {
        matchesType = type.includes('full');
      } else if (targetType === 'hybrid') {
        matchesType = mode.includes('hybrid') || type.includes('hybrid');
      } else {
        matchesType = type.includes(targetType);
      }
    }

    // 4. Experience Filter
    const exp = (j.experience_requirement || '').toLowerCase();
    const matchesExp =
      selectedExp === 'All' ||
      (selectedExp === 'Internship' && (exp.includes('intern') || type.includes('intern'))) ||
      (selectedExp === '0-1 Years' && (exp.includes('0') || exp.includes('1') || exp.includes('fresher'))) ||
      (selectedExp === '1-3 Years' && (exp.includes('1') || exp.includes('2') || exp.includes('3')));

    // 5. Career Interests Filter
    if (selectedInterests && selectedInterests.length > 0) {
      const jRole = (j.role_name || '').toLowerCase();
      const jDesc = (j.description || '').toLowerCase();
      const matchesAnyInterest = selectedInterests.some((interest) => {
        const intLower = interest.toLowerCase();
        if (intLower.includes('analytics') || intLower.includes('analyst')) {
          return jobTitle.includes('analyst') || jRole.includes('analyst') || skills.includes('sql') || skills.includes('data analytics');
        }
        if (intLower.includes('science')) {
          return jobTitle.includes('science') || jobTitle.includes('scientist') || jRole.includes('scientist') || skills.includes('machine learning');
        }
        if (intLower.includes('intelligence') || intLower.includes('bi')) {
          return jobTitle.includes('bi') || jobTitle.includes('business intelligence') || jobTitle.includes('business analyst') || jRole.includes('bi') || skills.includes('power bi');
        }
        if (intLower.includes('machine learning')) {
          return jobTitle.includes('machine learning') || jobTitle.includes('ml') || skills.includes('machine learning') || skills.includes('deep learning');
        }
        if (intLower.includes('software') || intLower.includes('web')) {
          return jobTitle.includes('developer') || jobTitle.includes('engineer') || skills.includes('python') || skills.includes('git');
        }
        if (intLower.includes('cloud')) {
          return jobTitle.includes('cloud') || jDesc.includes('cloud') || skills.includes('aws') || skills.includes('azure') || skills.includes('oracle');
        }
        return jobTitle.includes(intLower) || jRole.includes(intLower) || jDesc.includes(intLower) || skills.some((s) => s.includes(intLower));
      });
      if (!matchesAnyInterest) return false;
    }

    return matchesSearch && matchesLoc && matchesType && matchesExp;
  });

  return (
    <Layout>
      <Page
        title="Job & Internship Matching"
        subtitle="Explore real opportunities live from the corporate database • Automatically updated daily with live deadlines"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                color: '#059669',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '4px 12px',
                borderRadius: 20,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
              Live Daily Sync Active
            </span>
          </div>
        }
      >
        <div className="card card-pad">
          {/* PREFERENCES ACTIVE BANNER */}
          {hasPreferencesActive && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                padding: '10px 16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Sparkles size={15} color="#2563eb" />
                <span style={{ fontWeight: 700, color: '#1e40af' }}>Career Preferences Applied from Settings:</span>
                {savedPrefs?.workType && savedPrefs.workType !== 'Any' && (
                  <span className="pill blue" style={{ fontSize: 11, padding: '2px 8px' }}>
                    Type: {savedPrefs.workType}
                  </span>
                )}
                {savedPrefs?.location && savedPrefs.location !== 'Any' && (
                  <span className="pill blue" style={{ fontSize: 11, padding: '2px 8px' }}>
                    Location: {savedPrefs.location}
                  </span>
                )}
                <span className={`pill ${savedPrefs?.remoteOk ? 'green' : 'neutral'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                  Remote Work: {savedPrefs?.remoteOk ? 'ON (Only Remote)' : 'OFF (All Work Types)'}
                </span>
                {savedPrefs?.interests && savedPrefs.interests.length > 0 && (
                  <span className="pill blue" style={{ fontSize: 11, padding: '2px 8px' }}>
                    Interests: {savedPrefs.interests.join(', ')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Show All Jobs
                </button>
                <Link
                  to="/settings"
                  style={{
                    color: '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Edit in Settings ↗
                </Link>
              </div>
            </div>
          )}

          {/* SEARCH & FILTERS HEADER */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto auto',
              gap: 10,
              marginBottom: 20
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 12, color: '#8ba0b6', pointerEvents: 'none' }}
              />
              <input
                className="input"
                style={{ paddingLeft: 38, width: '100%' }}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search job title, company (Google, Oracle)..."
              />
            </div>

            <select
              className="select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Gurgaon">Gurgaon / Delhi</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              className="select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <select
              className="select"
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
            >
              <option value="All">All Experience</option>
              <option value="Internship">Internship</option>
              <option value="0-1 Years">0 - 1 Years / Fresher</option>
              <option value="1-3 Years">1 - 3 Years</option>
            </select>

            <button
              type="button"
              onClick={() => setRemoteOnly(!remoteOnly)}
              className="btn outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 14px',
                background: remoteOnly ? '#10b981' : 'transparent',
                borderColor: remoteOnly ? '#10b981' : 'var(--line, #cbd5e1)',
                color: remoteOnly ? '#ffffff' : 'var(--text, #334155)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
              title="Toggle Remote Work Only"
            >
              <Laptop size={14} />
              <span>{remoteOnly ? 'Remote Only: ON' : 'Remote: All'}</span>
            </button>

            <button
              type="button"
              className="btn outline"
              onClick={fetchJobs}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px' }}
              title="Refresh from database"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* JOBS LIST */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div>Fetching real-time opportunities from MySQL database...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--bg-card, #f8fafc)',
              borderRadius: 12,
              border: '1px dashed var(--line, #cbd5e1)',
            }}>
              <Briefcase size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)', marginBottom: 6 }}>
                No opportunities match these criteria
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', maxWidth: 440, margin: '0 auto 16px' }}>
                {remoteOnly
                  ? 'Open to Remote Work is ON. Only remote positions are currently shown. Try turning Remote Only OFF to see Hybrid and Onsite jobs.'
                  : 'Try selecting All Locations, All Job Types, or clearing your search keywords.'}
              </div>
              <button type="button" className="btn small" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((j) => (
              <div className="reco-item" key={j.job_id} style={{ alignItems: 'center' }}>
                <div className="role-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Building2 size={20} />
                </div>
                <div className="reco-main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 16 }}>{j.job_title}</strong>
                    <span className={`pill ${j.job_type === 'Internship' ? 'orange' : 'blue'}`} style={{ fontSize: 11 }}>
                      {j.job_type || 'Full-time'}
                    </span>
                    {j.work_mode && (
                      <span className={`pill ${j.work_mode.toLowerCase() === 'remote' ? 'green' : j.work_mode.toLowerCase() === 'hybrid' ? 'blue' : 'neutral'}`} style={{ fontSize: 11 }}>
                        {j.work_mode}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>
                    <strong style={{ color: 'var(--navy, #0f172a)' }}>{j.company_name}</strong> ·{' '}
                    <MapPin size={12} style={{ verticalAlign: -1 }} /> {j.location} ·{' '}
                    <Briefcase size={12} style={{ verticalAlign: -1 }} /> {j.experience_requirement}
                    {j.salary_range && (
                      <span style={{ color: '#047857', fontWeight: 600, marginLeft: 8 }}>
                        · {j.salary_range}
                      </span>
                    )}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {j.skills && j.skills.length > 0 ? (
                      j.skills.map((s) => (
                        <span key={s} className="pill blue" style={{ fontSize: 11, padding: '2px 8px' }}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="pill blue" style={{ fontSize: 11 }}>{j.role_name}</span>
                    )}
                  </div>

                  {/* DATES: AVAILABLE FROM & APPLICATION DUE DATE */}
                  {(j.posted_date || j.due_date) && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12 }}>
                      {j.posted_date && (
                        <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={13} color="#2563eb" />
                          <span>Available From: <strong style={{ color: '#1e293b' }}>{new Date(j.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                        </span>
                      )}
                      {j.due_date && (
                        <span style={{ 
                          color: new Date(j.due_date) < new Date() ? '#b91c1c' : '#b45309', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 5,
                          background: new Date(j.due_date) < new Date() ? '#fef2f2' : '#fffbeb',
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: new Date(j.due_date) < new Date() ? '1px solid #fecaca' : '1px solid #fde68a',
                          fontWeight: 600
                        }}>
                          <Clock size={13} />
                          <span>Apply Due Date: {new Date(j.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginRight: 16 }}>
                  <div className="match" style={{ color: 'var(--blue, #2563eb)', fontWeight: 800, fontSize: 20 }}>
                    {j.match || 85}%
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Match</span>
                </div>
                <Link
                  to={`/job-details/${j.job_id}`}
                  className="btn small"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  <Eye size={14} />
                  <span>View Job</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </Page>
    </Layout>
  );
}
