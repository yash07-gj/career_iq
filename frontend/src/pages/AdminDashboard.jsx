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
  const [jobSearch, setJobSearch] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Selected Cover Note Modal
  const [selectedNote, setSelectedNote] = useState(null);

  // Add/Edit Job Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [careerRoles, setCareerRoles] = useState([]);
  const [jobFeedback, setJobFeedback] = useState({ error: '', success: '' });

  // Job Form fields
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [careerRoleId, setCareerRoleId] = useState(1);
  const [location, setLocation] = useState('Bangalore, India');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [jobType, setJobType] = useState('Full-time');
  const [experienceReq, setExperienceReq] = useState('0 - 1 Years');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [postedDate, setPostedDate] = useState('');
  const [dueDate, setDueDate] = useState('');

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

  // Job Actions
  const handleOpenJobModal = (job = null) => {
    setJobFeedback({ error: '', success: '' });
    if (job) {
      setEditingJob(job);
      setJobTitle(job.job_title);
      setCompanyName(job.company_name);
      setCareerRoleId(job.career_role_id || 1);
      setLocation(job.location || 'Bangalore, India');
      setWorkMode(job.work_mode || 'Hybrid');
      setJobType(job.job_type || 'Full-time');
      setExperienceReq(job.experience_requirement || '0 - 1 Years');
      setSalaryRange(job.salary_range || '');
      setDescription(job.description || '');
      setResponsibilities(
        Array.isArray(job.responsibilities)
          ? job.responsibilities.join('\n')
          : job.responsibilities || ''
      );
      setPostedDate(job.posted_date || new Date().toISOString().split('T')[0]);
      setDueDate(job.due_date || '');
    } else {
      setEditingJob(null);
      setJobTitle('');
      setCompanyName('');
      setCareerRoleId(1);
      setLocation('Bangalore, India');
      setWorkMode('Hybrid');
      setJobType('Full-time');
      setExperienceReq('0 - 1 Years');
      setSalaryRange('');
      setDescription('');
      setResponsibilities('');
      setPostedDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
    }
    setShowJobModal(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setSubmittingJob(true);
    setJobFeedback({ error: '', success: '' });

    const payload = {
      career_role_id: parseInt(careerRoleId, 10),
      job_title: jobTitle.trim(),
      company_name: companyName.trim(),
      location: location.trim(),
      work_mode: workMode,
      job_type: jobType,
      experience_requirement: experienceReq.trim(),
      salary_range: salaryRange.trim(),
      description: description.trim(),
      responsibilities: responsibilities.trim(),
      posted_date: postedDate || null,
      due_date: dueDate || null
    };

    try {
      if (editingJob) {
        const updated = await api.updateJob(editingJob.job_id, payload);
        setJobs((prev) => prev.map((j) => (j.job_id === editingJob.job_id ? updated : j)));
        setJobFeedback({ error: '', success: 'Job updated successfully!' });
      } else {
        const created = await api.createJob(payload);
        setJobs((prev) => [created, ...prev]);
        setStats((prev) => ({ ...prev, total_jobs: prev.total_jobs + 1 }));
        setJobFeedback({ error: '', success: 'New job opportunity published to database!' });
      }
      setTimeout(() => {
        setShowJobModal(false);
      }, 1000);
    } catch (err) {
      setJobFeedback({ error: err.message || 'Failed to save job.', success: '' });
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Delete "${title}" (Job #${jobId}) from database?`)) return;
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
      setStats((prev) => ({ ...prev, total_jobs: Math.max(0, prev.total_jobs - 1) }));
    } catch (err) {
      alert(err.message || 'Failed to delete job.');
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

  // Filtered Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      (j.job_title || '').toLowerCase().includes(jobSearch.toLowerCase()) ||
      (j.company_name || '').toLowerCase().includes(jobSearch.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(jobSearch.toLowerCase());
    const matchesType =
      jobTypeFilter === 'all' ||
      (jobTypeFilter === 'internship'
        ? (j.job_type || '').toLowerCase().includes('intern')
        : !(j.job_type || '').toLowerCase().includes('intern'));
    return matchesSearch && matchesType;
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
        subtitle="Manage platform users, available jobs & internships, and candidate job applications in MySQL"
        action={
          <div className="row-gap">
            <button
              className="btn outline"
              onClick={handleSyncDailyJobs}
              disabled={syncingDaily}
              title="Automatically refresh available dates and extend application deadlines"
            >
              <RefreshCw size={14} className={syncingDaily ? 'spin' : ''} />
              <span>{syncingDaily ? 'Syncing Daily...' : '⚡ Daily Job Sync'}</span>
            </button>
            <button className="btn outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
            </button>
            <button className="btn" onClick={() => handleOpenJobModal()}>
              <Plus size={15} />
              <span>Post New Job</span>
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
        <div className="ui-grid cols-4">
          <StatTile
            label="Total Registered Users"
            value={stats.total_users}
            sub={<span className="text-good" style={{ fontWeight: 600 }}>✓ {stats.active_users} Active Accounts</span>}
          />
          <StatTile label="Available Opportunities" value={stats.total_jobs} sub="Corporate Jobs & Internships" />
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
            <button className={activeTab === 'jobs' ? 'on' : ''} onClick={() => setActiveTab('jobs')}>
              <Briefcase size={14} />
              <span>Available Jobs ({jobs.length})</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* JOB APPLICATIONS TABLE SECTION                                 */}
        {/* ============================================================== */}
        {(activeTab === 'all' || activeTab === 'applications') && (
          <div className="card card-pad">
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
          <div className="card card-pad">
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

        {/* ============================================================== */}
        {/* JOBS SECTION (All Available Jobs Mentioned)                     */}
        {/* ============================================================== */}
        {(activeTab === 'all' || activeTab === 'jobs') && (
          <div className="card card-pad">
            <div className="card-head">
              <div>
                <h3 className="card-title row-gap">
                  <Briefcase size={18} style={{ color: 'var(--good)' }} />
                  <span>Available Corporate Jobs & Internships ({filteredJobs.length})</span>
                </h3>
                <p className="card-sub">
                  All real corporate openings in MySQL <code>jobs</code> table available for MCA candidates
                </p>
              </div>

              {/* Job search & filter */}
              <div className="row-gap">
                <div className="input-icon" style={{ width: 240, maxWidth: '100%' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by company, role or city..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                  />
                </div>

                <select
                  className="select"
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time Only</option>
                  <option value="internship">Internships Only</option>
                </select>

                <button className="btn small" onClick={() => handleOpenJobModal()}>
                  <Plus size={14} /> Add Job
                </button>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <RefreshCw size={22} className="spin" />
                <p>Loading jobs from database...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="No jobs match the current filter." />
            ) : (
              <div>
                {filteredJobs.map((job) => {
                  const isInternship = (job.job_type || '').toLowerCase().includes('intern');
                  const overdue = job.due_date && new Date(job.due_date) < new Date();
                  return (
                    <div key={job.job_id} className="list-row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div className="list-icon">
                        <Briefcase size={18} />
                      </div>

                      {/* Left: Job Meta */}
                      <div className="list-main stack" style={{ gap: 6, flex: '1 1 300px' }}>
                        <div className="row-gap" style={{ gap: 6 }}>
                          <span className={`pill ${isInternship ? 'warn' : 'info'}`}>{job.job_type || 'Full-time'}</span>
                          <span className="pill good">{job.role_name || 'Tech'}</span>
                          <span className="muted text-xs num">ID: #{job.job_id}</span>
                        </div>

                        <strong style={{ fontSize: 15.5 }}>{job.job_title}</strong>

                        <div className="row-gap text-sm muted" style={{ gap: 14, fontSize: 13 }}>
                          <span className="row-gap" style={{ gap: 5, fontWeight: 600, fontSize: 13 }}>
                            <Building2 size={14} /> {job.company_name}
                          </span>
                          <span className="row-gap" style={{ gap: 5, fontSize: 13 }}>
                            <MapPin size={14} /> {job.location || 'India'} ({job.work_mode || 'Hybrid'})
                          </span>
                          {job.salary_range && (
                            <span className="text-good" style={{ fontWeight: 700, fontSize: 13 }}>💰 {job.salary_range}</span>
                          )}
                          <span style={{ fontSize: 13 }}>⏳ {job.experience_requirement || 'Fresher'}</span>
                        </div>

                        {/* Dates row: Available From & Due Date */}
                        {(job.posted_date || job.due_date) && (
                          <div className="row-gap" style={{ gap: 10 }}>
                            {job.posted_date && (
                              <span className="row-gap muted text-xs" style={{ gap: 4, fontSize: 12.5 }}>
                                <Calendar size={13} style={{ color: 'var(--accent)' }} />
                                <span>
                                  Available: <strong style={{ color: 'var(--ink)' }}>{formatDate(job.posted_date)}</strong>
                                </span>
                              </span>
                            )}
                            {job.due_date && (
                              <span className={`pill ${overdue ? 'bad' : 'warn'}`}>
                                <Clock size={12} />
                                <span>Due Date: {formatDate(job.due_date)}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Skills preview */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="chips" style={{ gap: 6 }}>
                            {job.skills.slice(0, 5).map((s) => (
                              <span key={s} className="pill neutral">{s}</span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="muted text-xs">+{job.skills.length - 5} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="list-end">
                        <Link to={`/job-details/${job.job_id}`} className="btn outline small" title="View Live Listing">
                          <ExternalLink size={13} />
                          <span>View</span>
                        </Link>
                        <button className="btn outline small" onClick={() => handleOpenJobModal(job)} title="Edit Job">
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn outline small danger"
                          onClick={() => handleDeleteJob(job.job_id, job.job_title)}
                          title="Delete Job"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ADD / EDIT JOB MODAL                                           */}
        {/* ============================================================== */}
        {showJobModal && (
          <div className="modal-bg">
            <div className="modal wide" role="dialog" aria-modal="true">
              <div className="modal-head">
                <h3>{editingJob ? `Edit Job #${editingJob.job_id}` : 'Post New Job / Internship'}</h3>
                <button className="icon-btn" onClick={() => setShowJobModal(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              {jobFeedback.error && (
                <div className="notice bad">
                  <AlertCircle size={16} />
                  <span className="notice-main">{jobFeedback.error}</span>
                </div>
              )}
              {jobFeedback.success && (
                <div className="notice good">
                  <CheckCircle2 size={16} />
                  <span className="notice-main">{jobFeedback.success}</span>
                </div>
              )}

              <form onSubmit={handleSaveJob} className="stack">
                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Job Title *</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Associate Data Scientist"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Company Name *</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Google, Microsoft, Amazon"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ui-grid cols-3" style={{ gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Target Career Role</label>
                    <select
                      className="select"
                      value={careerRoleId}
                      onChange={(e) => setCareerRoleId(e.target.value)}
                    >
                      {careerRoles.map((r) => (
                        <option key={r.career_role_id} value={r.career_role_id}>
                          {r.role_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Job Type</label>
                    <select
                      className="select"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Work Mode</label>
                    <select
                      className="select"
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value)}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Location</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Bangalore, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Salary / Stipend</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. ₹12.0 - ₹18.0 LPA or ₹50k/mo"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Available / Opening Date</label>
                    <input
                      className="input"
                      type="date"
                      value={postedDate}
                      onChange={(e) => setPostedDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Application Due Date (Deadline)</label>
                    <input
                      className="input"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label">Experience Requirement</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. 0 - 1 Years or Fresher"
                    value={experienceReq}
                    onChange={(e) => setExperienceReq(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label">Job Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Brief description of the opportunity and company mission..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label">Key Responsibilities (One per line)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Analyze datasets using SQL&#10;Build interactive dashboards in Power BI&#10;Collaborate with software engineers"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setShowJobModal(false)}
                    disabled={submittingJob}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn" disabled={submittingJob}>
                    {submittingJob ? 'Saving to Database...' : editingJob ? 'Update Job' : 'Publish Job'}
                  </button>
                </div>
              </form>
            </div>
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
