import React, { useState, useEffect } from 'react';
import { FileCheck, Search, Trash2, ExternalLink, Building2, RefreshCw, Phone, Mail, FileText, X } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';
import { EmptyState } from '../components/ui';

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

  const statusTextColor = (status) =>
    ({ green: 'var(--good)', red: 'var(--bad)', orange: 'var(--warn)', blue: 'var(--accent)' })[getStatusColor(status)];

  return (
    <Layout admin>
      <Page
        title="Candidate Job Applications"
        subtitle="Review, monitor, and manage all job and internship applications saved in MySQL job_applications table"
        action={
          <button className="btn outline" onClick={fetchApplications} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      >
        <div className="card card-pad">
          {/* Search & Filter Header */}
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div className="input-icon" style={{ flex: '1 1 240px', maxWidth: 340 }}>
              <Search size={15} />
              <input
                type="text"
                className="input"
                placeholder="Search candidate, job or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="row-gap">
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: 200 }}
              >
                <option value="all">All Application Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Hired">Hired</option>
              </select>

              <span className="pill info" style={{ padding: '6px 12px' }}>
                Total: <strong className="num">{filtered.length}</strong>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={22} className="spin" />
              <p>Loading applications from MySQL database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={FileCheck} title="No candidate job applications found matching your criteria." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>APP ID</th>
                    <th>CANDIDATE INFO</th>
                    <th>JOB APPLIED FOR</th>
                    <th>COVER NOTE</th>
                    <th>RESUME</th>
                    <th>STATUS</th>
                    <th>APPLIED DATE</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
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
                      <tr key={app.application_id}>
                        <td className="muted num" style={{ fontWeight: 700 }}>#{app.application_id}</td>

                        {/* Candidate Details */}
                        <td>
                          <div className="stack" style={{ gap: 2 }}>
                            <strong style={{ fontSize: 14 }}>{app.full_name}</strong>
                            <span className="muted text-xs row-gap" style={{ gap: 4 }}>
                              <Mail size={12} /> {app.email}
                            </span>
                            {app.phone && (
                              <span className="muted text-xs row-gap" style={{ gap: 4 }}>
                                <Phone size={12} /> {app.phone}
                              </span>
                            )}
                            {app.experience_level && (
                              <span className="text-xs" style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>
                                Exp: {app.experience_level}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Job Details */}
                        <td>
                          <div className="stack" style={{ gap: 4 }}>
                            <div className="row-gap" style={{ gap: 6 }}>
                              <span className={`pill ${isInternship ? 'warn' : 'info'}`}>{app.job_type}</span>
                              <strong style={{ fontSize: 13.5 }}>{app.job_title}</strong>
                            </div>
                            <span className="muted text-xs row-gap" style={{ gap: 4 }}>
                              <Building2 size={12} /> {app.company_name} • {app.location}
                            </span>
                          </div>
                        </td>

                        {/* Cover Note */}
                        <td style={{ maxWidth: 220 }}>
                          {app.cover_note ? (
                            <div>
                              <p className="text-xs" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {app.cover_note}
                              </p>
                              <button
                                className="link-btn"
                                onClick={() => setSelectedNote({ title: `${app.full_name} - ${app.job_title}`, note: app.cover_note })}
                                style={{ marginTop: 2, fontSize: 12 }}
                              >
                                Read full note
                              </button>
                            </div>
                          ) : (
                            <span className="muted text-xs">None provided</span>
                          )}
                          {app.portfolio_url && (
                            <div style={{ marginTop: 4 }}>
                              <a
                                href={app.portfolio_url.startsWith('http') ? app.portfolio_url : `https://${app.portfolio_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="link-btn"
                                style={{ fontSize: 12 }}
                              >
                                <ExternalLink size={11} /> Portfolio
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Resume */}
                        <td>
                          {app.resume_file_url ? (
                            <a
                              href={`http://127.0.0.1:8000${app.resume_file_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn outline small"
                            >
                              <FileText size={13} />
                              <span>View PDF</span>
                            </a>
                          ) : (
                            <span className="muted text-xs">Profile Resume</span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td>
                          <select
                            className="select"
                            value={app.status || 'Applied'}
                            onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                            aria-label={`Status for application ${app.application_id}`}
                            style={{ width: 'auto', padding: '6px 32px 6px 10px', fontSize: 13, fontWeight: 700, color: statusTextColor(app.status) }}
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
                        <td className="muted text-xs" style={{ whiteSpace: 'nowrap' }}>{appliedDate}</td>

                        {/* Actions */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn outline small danger"
                            onClick={() => handleDeleteApplication(app.application_id, app.full_name)}
                            title="Delete Application"
                          >
                            <Trash2 size={13} />
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
          <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setSelectedNote(null); }}>
            <div className="modal" role="dialog" aria-modal="true" aria-label="Candidate Cover Note">
              <div className="modal-head">
                <h3>Candidate Cover Note</h3>
                <button className="icon-btn" onClick={() => setSelectedNote(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <p className="muted text-xs" style={{ margin: 0 }}>{selectedNote.title}</p>
              <div
                className="text-sm"
                style={{
                  background: 'var(--surface-2)',
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 280,
                  overflowY: 'auto'
                }}
              >
                {selectedNote.note}
              </div>
              <div className="modal-actions">
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
