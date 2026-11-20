import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Eye, Building2, RefreshCw, Laptop, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, EmptyState } from '../components/ui';
import { toneFor } from '../utils/career';
import api from '../services/api';

export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  // Filters start at "All". (Career Preferences were removed from Settings,
  // so job filtering is controlled only by the filters on this page.)
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);

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

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Layout>
      <Page
        title="Job & Internship Matching"
        subtitle="Explore real opportunities live from the corporate database • Automatically updated daily with live deadlines"
        action={
          <span className="pill good">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--good)' }} />
            Live Daily Sync Active
          </span>
        }
      >
        <JourneyBar current="jobs" />

        <div className="card card-pad">
          {/* SEARCH & FILTERS HEADER */}
          <div className="ui-grid job-filters" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 14 }}>
            <div className="input-icon" style={{ minWidth: 0 }}>
              <Search size={16} />
              <input
                className="input"
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
          </div>

          <div className="row-between" style={{ marginBottom: 8 }}>
            <div className="seg" role="group" aria-label="Remote work filter">
              <button type="button" className={remoteOnly ? '' : 'on'} onClick={() => setRemoteOnly(false)}>
                Remote: All
              </button>
              <button
                type="button"
                className={remoteOnly ? 'on' : ''}
                onClick={() => setRemoteOnly(true)}
                title="Toggle Remote Work Only"
              >
                <Laptop size={14} /> Remote Only: ON
              </button>
            </div>
            <div className="row-gap">
              <span className="muted text-xs num">{filteredJobs.length} of {jobs.length} jobs</span>
              <button type="button" className="btn outline small" onClick={fetchJobs} title="Refresh from database">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* JOBS LIST */}
          {loading ? (
            <div className="empty-state">
              <RefreshCw size={24} className="animate-spin" />
              <p>Fetching real-time opportunities from MySQL database...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No opportunities match these criteria"
              text={remoteOnly
                ? 'Open to Remote Work is ON. Only remote positions are currently shown. Try turning Remote Only OFF to see Hybrid and Onsite jobs.'
                : 'Try selecting All Locations, All Job Types, or clearing your search keywords.'}
              action={
                <button type="button" className="btn small" onClick={clearFilters}>
                  Clear All Filters
                </button>
              }
            />
          ) : (
            filteredJobs.map((j) => {
              const matchVal = j.match || 85;
              const overdue = j.due_date && new Date(j.due_date) < new Date();
              return (
                <div className="list-row" key={j.job_id} style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div className="list-icon">
                    <Building2 size={20} />
                  </div>
                  <div className="list-main" style={{ minWidth: 200 }}>
                    <div className="row-gap">
                      <strong style={{ fontSize: 15.5 }}>{j.job_title}</strong>
                      <span className={`pill ${j.job_type === 'Internship' ? 'warn' : 'info'}`}>
                        {j.job_type || 'Full-time'}
                      </span>
                      {j.work_mode && (
                        <span className={`pill ${j.work_mode.toLowerCase() === 'remote' ? 'good' : j.work_mode.toLowerCase() === 'hybrid' ? 'info' : 'neutral'}`}>
                          {j.work_mode}
                        </span>
                      )}
                    </div>
                    <span style={{ display: 'block', marginTop: 2 }}>
                      <b style={{ color: 'var(--ink)' }}>{j.company_name}</b> ·{' '}
                      <MapPin size={12} style={{ verticalAlign: -1 }} /> {j.location} ·{' '}
                      <Briefcase size={12} style={{ verticalAlign: -1 }} /> {j.experience_requirement}
                      {j.salary_range && (
                        <span className="text-good" style={{ fontWeight: 600 }}> · {j.salary_range}</span>
                      )}
                    </span>
                    <div className="chips" style={{ marginTop: 8, gap: 6 }}>
                      {j.skills && j.skills.length > 0 ? (
                        j.skills.map((s) => (
                          <span key={s} className="pill neutral">{s}</span>
                        ))
                      ) : (
                        <span className="pill neutral">{j.role_name}</span>
                      )}
                    </div>

                    {/* DATES: AVAILABLE FROM & APPLICATION DUE DATE */}
                    {(j.posted_date || j.due_date) && (
                      <div className="row-gap text-xs" style={{ marginTop: 8, gap: 12 }}>
                        {j.posted_date && (
                          <span className="row-gap" style={{ gap: 5 }}>
                            <Calendar size={13} color="var(--accent)" />
                            <span>Available From: <b style={{ color: 'var(--ink)' }}>{fmtDate(j.posted_date)}</b></span>
                          </span>
                        )}
                        {j.due_date && (
                          <span className={`pill ${overdue ? 'bad' : 'warn'}`}>
                            <Clock size={13} />
                            Apply Due Date: {fmtDate(j.due_date)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="list-end" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`match-num text-${toneFor(matchVal)}`}>{matchVal}%</div>
                      <span className="muted" style={{ fontSize: 11 }}>AI Match</span>
                    </div>
                    <Link to={`/job-details/${j.job_id}`} className="btn small">
                      <Eye size={14} />
                      <span>View Job</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Page>
    </Layout>
  );
}
