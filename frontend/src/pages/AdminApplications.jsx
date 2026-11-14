import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  Building2,
  MapPin,
  Calendar,
  RefreshCw,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminApplications();
      if (Array.isArray(data)) setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert(err.message || 'Failed to update application status.');
    }
  };

  const handleDeleteApplication = async (appId, candidateName) => {
    if (!window.confirm(`Delete application #${appId} for candidate "${candidateName}"?`)) return;
    try {
      await api.deleteAdminApplication(appId);
      setApplications((prev) => prev.filter((a) => a.application_id !== appId));
    } catch (err) {
      alert(err.message || 'Failed to delete application.');
    }
  };

  const filtered = applications.filter((app) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (app.full_name || '').toLowerCase().includes(term) ||
      (app.email || '').toLowerCase().includes(term) ||
      (app.job_title || '').toLowerCase().includes(term) ||
      (app.company_name || '').toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === 'all' ||
      (app.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'applied':
        return 'blue';
      case 'under review':
        return 'orange';
      case 'shortlisted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'hired':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <Layout admin>
      <Page
        title="Candidate Job Applications"
        subtitle="Review, monitor, and manage all job and internship applications saved in MySQL job_applications table"
        action={
          <button
            className="btn outline"
            onClick={fetchApplications}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      >
        <div className="card card-pad">
          {/* Search & Filter Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, color: '#94a3b8' }} />
              <input
                type="text"
                className="input"
                placeholder="Search candidate, job or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, height: 36, width: 280 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: 13, height: 36, padding: '0 10px' }}
              >
                <option value="all">All Application Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Hired">Hired</option>
              </select>

              <span className="pill blue" style={{ fontSize: 12, padding: '6px 12px' }}>
                Total: <strong>{filtered.length}</strong>
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Loading applications from MySQL database...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              No candidate job applications found matching your criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>APP ID</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>CANDIDATE INFO</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>JOB APPLIED FOR</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>COVER NOTE</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>RESUME</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>STATUS</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>APPLIED DATE</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const isInternship = (app.job_type || '').toLowerCase().includes('intern');
                    const appliedDate = app.created_at
                      ? new Date(app.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '—';

                    return (
                      <tr key={app.application_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                          #{app.application_id}
                        </td>

                        {/* Candidate Details */}
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <strong style={{ fontSize: 14, color: 'var(--navy, #0f172a)' }}>
                              {app.full_name}
                            </strong>
                            <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={12} color="#64748b" /> {app.email}
                            </span>
                            {app.phone && (
                              <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Phone size={12} color="#64748b" /> {app.phone}
                              </span>
                            )}
                            {app.experience_level && (
                              <span style={{ fontSize: 11, color: '#0369a1', fontWeight: 600, marginTop: 2 }}>
                                Exp: {app.experience_level}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Job Details */}
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                className={`pill ${isInternship ? 'orange' : 'blue'}`}
                                style={{ fontSize: 10, padding: '2px 7px', fontWeight: 700 }}
                              >
                                {app.job_type}
                              </span>
                              <strong style={{ fontSize: 13, color: 'var(--navy, #0f172a)' }}>
                                {app.job_title}
                              </strong>
                            </div>
                            <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building2 size={12} color="#64748b" /> {app.company_name} • {app.location}
                            </span>
                          </div>
                        </td>

                        {/* Cover Note */}
                        <td style={{ padding: '12px', maxWidth: 220 }}>
                          {app.cover_note ? (
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color: '#334155',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {app.cover_note}
                              </p>
                              <button
                                onClick={() => setSelectedNote({ title: `${app.full_name} - ${app.job_title}`, note: app.cover_note })}
                                style={{ background: 'transparent', border: 'none', color: 'var(--blue, #2563eb)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: 2 }}
                              >
                                Read full note
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>None provided</span>
                          )}
                          {app.portfolio_url && (
                            <div style={{ marginTop: 4 }}>
                              <a
                                href={app.portfolio_url.startsWith('http') ? app.portfolio_url : `https://${app.portfolio_url}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 11, color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                              >
                                <ExternalLink size={10} /> Portfolio
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Resume */}
                        <td style={{ padding: '12px' }}>
                          {app.resume_file_url ? (
                            <a
                              href={`http://127.0.0.1:8000${app.resume_file_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn outline small"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11 }}
                            >
                              <FileText size={12} />
                              <span>View PDF</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>Profile Resume</span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td style={{ padding: '12px' }}>
                          <select
                            className="select"
                            value={app.status || 'Applied'}
                            onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                            style={{
                              fontSize: 12,
                              padding: '4px 8px',
                              height: 30,
                              borderRadius: 6,
                              fontWeight: 700,
                              color:
                                app.status === 'Shortlisted' || app.status === 'Hired'
                                  ? '#047857'
                                  : app.status === 'Rejected'
                                  ? '#b91c1c'
                                  : app.status === 'Under Review'
                                  ? '#b45309'
                                  : '#1d4ed8',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                          </select>
                        </td>

                        {/* Applied Date */}
                        <td style={{ padding: '12px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {appliedDate}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            className="btn small"
                            onClick={() => handleDeleteApplication(app.application_id, app.full_name)}
                            title="Delete Application"
                            style={{ background: '#fff0f2', color: '#ef4b5f', padding: '6px 8px' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note Modal */}
        {selectedNote && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16
            }}
          >
            <div
              className="card card-pad"
              style={{ width: '100%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            >
              <h3 className="card-title" style={{ marginBottom: 12 }}>
                Candidate Cover Note
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{selectedNote.title}</p>
              <div
                style={{
                  background: '#f8fafc',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#334155',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 280,
                  overflowY: 'auto'
                }}
              >
                {selectedNote.note}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn" onClick={() => setSelectedNote(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Page>
    </Layout>
  );
}
