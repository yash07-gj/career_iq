import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Award, Eye, Building2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';

export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

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

  const filteredJobs = jobs.filter((j) => {
    const jobTitle = (j.job_title || '').toLowerCase();
    const company = (j.company_name || '').toLowerCase();
    const skills = (j.skills || []).map((s) => s.toLowerCase());
    const query = q.toLowerCase();

    const matchesSearch =
      jobTitle.includes(query) ||
      company.includes(query) ||
      skills.some((s) => s.includes(query));

    const loc = (j.location || '').toLowerCase();
    const matchesLoc =
      selectedLocation === 'All' ||
      loc.includes(selectedLocation.toLowerCase());

    const exp = (j.experience_requirement || '').toLowerCase();
    const matchesExp =
      selectedExp === 'All' ||
      (selectedExp === 'Internship' && (exp.includes('intern') || (j.job_type || '').toLowerCase().includes('intern'))) ||
      (selectedExp === '0-1 Years' && (exp.includes('0') || exp.includes('1') || exp.includes('fresher'))) ||
      (selectedExp === '1-3 Years' && (exp.includes('1') || exp.includes('2') || exp.includes('3')));

    const type = (j.job_type || '').toLowerCase();
    const matchesType =
      selectedType === 'All' ||
      (selectedType === 'Internship' && type.includes('intern')) ||
      (selectedType === 'Full-time' && type.includes('full'));

    return matchesSearch && matchesLoc && matchesExp && matchesType;
  });

  return (
    <Layout>
      <Page title="Job & Internship Matching" subtitle="Explore real opportunities live from the corporate database matched to your profile">
        <div className="card card-pad">
          {/* SEARCH & FILTERS HEADER */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto',
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
                placeholder="Search by job title, company (e.g. Google, Data Analyst)..."
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
              <option value="Gurgaon">Gurgaon / Noida</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>

            <select
              className="select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
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
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              No matching jobs found in database. Try adjusting your search query or filters.
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
                      <span className="pill green" style={{ fontSize: 11 }}>
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
