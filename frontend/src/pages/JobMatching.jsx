import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Award, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import { mockJobs } from '../mockData/careerData';

export default function JobMatching() {
  const [q, setQ] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');

  const filteredJobs = mockJobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(q.toLowerCase()) ||
      j.company.toLowerCase().includes(q.toLowerCase()) ||
      j.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()));

    const matchesLoc =
      selectedLocation === 'All' ||
      j.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesExp =
      selectedExp === 'All' ||
      (selectedExp === 'Internship' && j.type.toLowerCase().includes('internship')) ||
      (selectedExp === '0-2 years' && (j.experience.includes('0') || j.experience.includes('1') || j.experience.includes('2')));

    return matchesSearch && matchesLoc && matchesExp;
  });

  return (
    <Layout>
      <Page title="Job Matching" subtitle="Find jobs that match your skills and extracted profile">
        <div className="card card-pad">
          {/* SEARCH & FILTERS HEADER */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr auto',
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
                placeholder="Search jobs (e.g. Data Analyst)"
              />
            </div>

            <select
              className="select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
            </select>

            <select
              className="select"
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
            >
              <option value="All">All Experience</option>
              <option value="Internship">Internship</option>
              <option value="0-2 years">0-2 years</option>
            </select>

            <button type="button" className="btn" style={{ padding: '0 20px' }}>
              Search
            </button>
          </div>

          {/* JOBS LIST */}
          {filteredJobs.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              No matching jobs found. Try adjusting your search query or filters.
            </div>
          ) : (
            filteredJobs.map((j) => (
              <div className="reco-item" key={j.id}>
                <div className="role-icon">
                  <Briefcase size={18} />
                </div>
                <div className="reco-main">
                  <strong>{j.title}</strong>
                  <span>
                    {j.company} · <MapPin size={11} style={{ verticalAlign: -1 }} /> {j.location}
                  </span>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="pill blue">{j.skills.join(' · ')}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div className="match">{j.match}%</div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Match</span>
                </div>
                <Link
                  to={`/job-details/${j.id}`}
                  className="btn small"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: 'none'
                  }}
                >
                  <Eye size={13} />
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
