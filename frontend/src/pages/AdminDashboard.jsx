import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Building2,
  MapPin,
  ExternalLink,
  UserCheck,
  X,
  AlertCircle,
  FileCheck,
  Mail,
  Phone,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';
import { EmptyState, StatTile } from '../components/ui';

export default function AdminDashboard({ initialTab = 'all' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'all', 'users', 'jobs', 'applications'

  // Data states
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_jobs: 0,
    total_resumes: 0,
    total_applications: 0
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingDaily, setSyncingDaily] = useState(false);
  const [syncBanner, setSyncBanner] = useState('');

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Selected Cover Note Modal
  const [selectedNote, setSelectedNote] = useState(null);

  // Fetch all admin data
  const fetchData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [statsData, usersData, jobsData, appsData, rolesData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => []),
        api.getJobs().catch(() => []),
        api.getAdminApplications().catch(() => []),
        api.getCareerRoles().catch(() => [])
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        setStats({
          total_users: usersData.length || 0,
          active_users: usersData.filter((u) => u.active_status === 1).length || 0,
          total_jobs: jobsData.length || 0,
          total_resumes: usersData.filter((u) => u.has_resume).length || 0,
          total_applications: appsData.length || 0
        });
      }

      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(jobsData)) setJobs(jobsData);
      if (Array.isArray(appsData)) setApplications(appsData);
      if (Array.isArray(rolesData)) setCareerRoles(rolesData);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    const handleFocus = () => fetchData(false);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleSyncDailyJobs = async () => {
    setSyncingDaily(true);
    setSyncBanner('');
    try {
      const res = await api.syncDailyJobs();
      setSyncBanner(res.message || 'Daily job opportunities synchronized with current dates!');
      fetchData();
      setTimeout(() => setSyncBanner(''), 5000);
    } catch (err) {
      alert('Failed to sync daily jobs: ' + (err.message || 'Error'));
    } finally {
      setSyncingDaily(false);
    }
  };

  // User Actions
  const handleToggleStatus = async (userId, currentStatus, accountRole) => {
    if (accountRole === 'admin') {
      alert('Admin account status cannot be deactivated.');
      return;
    }
    try {
      await api.toggleAdminUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, active_status: currentStatus === 1 ? 0 : 1 } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId, accountRole) => {
    if (accountRole === 'admin') {
      alert('Cannot delete the primary Administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete User #${userId}?`)) {
      return;
    }
    try {
      await api.deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      setStats((prev) => ({ ...prev, total_users: Math.max(0, prev.total_users - 1) }));
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  // Application Actions
  const handleApplicationStatus = async (appId, newStatus) => {
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
    if (!window.confirm(`Delete application #${appId} for "${candidateName}" from database?`)) return;
    try {
      await api.deleteAdminApplication(appId);
      setApplications((prev) => prev.filter((a) => a.application_id !== appId));
      setStats((prev) => ({ ...prev, total_applications: Math.max(0, prev.total_applications - 1) }));
    } catch (err) {
      alert(err.message || 'Failed to delete application.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.account_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Applications
  const filteredApplications = applications.filter((app) => {
    const term = appSearch.toLowerCase();
    const matchesSearch =
      (app.full_name || '').toLowerCase().includes(term) ||
      (app.email || '').toLowerCase().includes(term) ||
      (app.job_title || '').toLowerCase().includes(term) ||
      (app.company_name || '').toLowerCase().includes(term);
    const matchesStatus =
      appStatusFilter === 'all' ||
      (app.status || '').toLowerCase() === appStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusTextColor = (status) =>
    status === 'Shortlisted' || status === 'Hired'
      ? 'var(--good)'
      : status === 'Rejected'
      ? 'var(--bad)'
      : status === 'Under Review'
      ? 'var(--warn)'
      : 'var(--accent)';

  const formatDate = (value) =>
    new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Layout admin>
      <Page
        title="Admin Control Center"
        subtitle="Manage platform users and candidate job applications in MySQL"
        action={
          <div className="row-gap">
            <button className="btn outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
            </button>
          </div>
        }
      >
        {syncBanner && (
          <div className="notice good">
            <CheckCircle2 size={16} />
            <span className="notice-main" style={{ fontWeight: 600 }}>{syncBanner}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div id="admin-overview" className="ui-grid cols-3">
          <StatTile
            label="Total Registered Users"
            value={stats.total_users}
            sub={<span className="text-good" style={{ fontWeight: 600 }}>✓ {stats.active_users} Active Accounts</span>}
          />
          <StatTile label="Candidate Resumes" value={stats.total_resumes} sub="Processed for AI matching" />
          <StatTile
            label="Candidate Applications"
            value={stats.total_applications}
            sub={<span className="text-good" style={{ fontWeight: 600 }}>✓ Saved in job_applications</span>}
          />
        </div>

        {/* SECTION NAVIGATION TABS */}
        <div>
          <div className="seg" role="tablist" aria-label="Admin sections">
            <button className={activeTab === 'all' ? 'on' : ''} onClick={() => setActiveTab('all')}>
              All Sections
            </button>
            <button className={activeTab === 'applications' ? 'on' : ''} onClick={() => setActiveTab('applications')}>
              <FileCheck size={14} />
              <span>Job Applications ({applications.length})</span>
            </button>
            <button className={activeTab === 'users' ? 'on' : ''} onClick={() => setActiveTab('users')}>
              <Users size={14} />
              <span>Users Table ({users.length})</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* JOB APPLICATIONS TABLE SECTION                                 */}
        {/* ============================================================== */}
        {(activeTab === 'all' || activeTab === 'applications') && (
          <div id="admin-applications" className="card card-pad" style={{ scrollMarginTop: 90 }}>
            <div className="card-head">
              <div>
                <h3 className="card-title row-gap">
                  <FileCheck size={18} style={{ color: 'var(--accent)' }} />
                  <span>Candidate Job Applications ({filteredApplications.length})</span>
                </h3>
                <p className="card-sub">
                  Live candidate applications recorded in MySQL <code>job_applications</code> table
                </p>
              </div>

              {/* Application search & filter */}
              <div className="row-gap">
                <div className="input-icon" style={{ width: 250, maxWidth: '100%' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search candidate, job, or email..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                  />
                </div>

                <select
                  className="select"
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Application Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <RefreshCw size={22} className="spin" />
                <p>Loading applications from database...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <EmptyState icon={FileCheck} title="No candidate job applications found." />
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
                    {filteredApplications.map((app) => {
                      const isInternship = (app.job_type || '').toLowerCase().includes('intern');
                      const appliedDate = app.created_at ? formatDate(app.created_at) : '—';

                      return (
                        <tr key={app.application_id}>
                          <td className="muted num" style={{ fontWeight: 700 }}>#{app.application_id}</td>

                          {/* Candidate info */}
                          <td>
                            <div className="stack" style={{ gap: 2 }}>
                              <strong style={{ fontSize: 13.5 }}>{app.full_name}</strong>
                              <span className="muted text-xs row-gap" style={{ gap: 4 }}>
                                <Mail size={12} /> {app.email}
                              </span>
                              {app.phone && (
                                <span className="muted text-xs row-gap" style={{ gap: 4 }}>
                                  <Phone size={12} /> {app.phone}
                                </span>
                              )}
                              {app.experience_level && (
                                <span className="text-xs" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                  Exp: {app.experience_level}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Job info */}
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

                          {/* Cover Note & Portfolio */}
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
                              <span className="muted text-xs">None</span>
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

                          {/* Status */}
                          <td>
                            <select
                              className="select"
                              value={app.status || 'Applied'}
                              onChange={(e) => handleApplicationStatus(app.application_id, e.target.value)}
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

                          {/* Action */}
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
        )}

        {/* ============================================================== */}
        {/* USERS TABLE SECTION                                            */}
        {/* ============================================================== */}
        {(activeTab === 'all' || activeTab === 'users') && (
          <div id="admin-users" className="card card-pad" style={{ scrollMarginTop: 90 }}>
            <div className="card-head">
              <div>
                <h3 className="card-title row-gap">
                  <Users size={18} style={{ color: 'var(--accent)' }} />
                  <span>Registered Users ({filteredUsers.length})</span>
                </h3>
                <p className="card-sub">
                  Live candidate and administrator records directly from MySQL <code>users</code> table
                </p>
              </div>

              {/* User search & filter */}
              <div className="row-gap">
                <div className="input-icon" style={{ width: 230, maxWidth: '100%' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <select
                  className="select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Roles</option>
                  <option value="candidate">Candidates</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <RefreshCw size={22} className="spin" />
                <p>Loading users from database...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState icon={Users} title="No users found matching your search." />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>USER ID</th>
                      <th>CANDIDATE / USER</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>RESUME</th>
                      <th>STATUS</th>
                      <th>JOINED</th>
                      <th style={{ textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const initial = (u.full_name || 'U').charAt(0).toUpperCase();
                      const joinedDate = u.created_at ? formatDate(u.created_at) : '—';
                      const isAdmin = u.account_role === 'admin';

                      return (
                        <tr key={u.user_id}>
                          <td className="muted num" style={{ fontWeight: 700 }}>#{u.user_id}</td>
                          <td>
                            <div className="row-gap" style={{ gap: 10, flexWrap: 'nowrap' }}>
                              <div className={`list-icon ${isAdmin ? 'warn' : ''}`} style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 13 }}>
                                {initial}
                              </div>
                              <div>
                                <strong style={{ fontSize: 13.5 }}>{u.full_name}</strong>
                                {u.city && <div className="muted text-xs">{u.city}</div>}
                              </div>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`pill ${isAdmin ? 'info' : 'neutral'}`} style={{ textTransform: 'capitalize' }}>
                              {u.account_role}
                            </span>
                          </td>
                          <td>
                            {u.has_resume ? (
                              <span className="pill good">✓ Uploaded</span>
                            ) : (
                              <span className="muted text-xs">None</span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                              style={{ background: 'transparent', border: 0, padding: 0, cursor: isAdmin ? 'default' : 'pointer' }}
                              title={isAdmin ? 'Admin status cannot be changed' : 'Click to toggle status'}
                            >
                              <span className={`pill ${u.active_status === 1 ? 'good' : 'bad'}`}>
                                {u.active_status === 1 ? '● Active' : '○ Inactive'}
                              </span>
                            </button>
                          </td>
                          <td className="muted text-xs">{joinedDate}</td>
                          <td>
                            <div className="row-gap" style={{ justifyContent: 'center', flexWrap: 'nowrap', gap: 6 }}>
                              <button
                                className="btn outline small"
                                onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                                disabled={isAdmin}
                                title="Toggle Status"
                              >
                                <UserCheck size={13} />
                              </button>
                              <button
                                className="btn outline small danger"
                                onClick={() => handleDeleteUser(u.user_id, u.account_role)}
                                disabled={isAdmin}
                                title="Delete User"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Cover Note Modal */}
        {selectedNote && (
          <div className="modal-bg">
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
