import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Filter,
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

  return (
    <Layout admin>
      <Page
        title="Admin Control Center"
        subtitle="Manage platform users, available jobs & internships, and candidate job applications in MySQL"
        action={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn outline"
              onClick={handleSyncDailyJobs}
              disabled={syncingDaily}
              style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#7c3aed', color: '#7c3aed' }}
              title="Automatically refresh available dates and extend application deadlines"
            >
              <RefreshCw size={14} className={syncingDaily ? 'spin' : ''} />
              <span>{syncingDaily ? 'Syncing Daily...' : '⚡ Daily Job Sync'}</span>
            </button>
            <button
              className="btn outline"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
            </button>
            <button
              className="btn"
              onClick={() => handleOpenJobModal()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>Post New Job</span>
            </button>
          </div>
        }
      >
        {syncBanner && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle2 size={16} />
            <span>{syncBanner}</span>
          </div>
        )}
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 24, gap: 16 }}>
          {/* Card 1: Users */}
          <div
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              background: '#ffffff'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#eff6ff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <Users size={24} color="#2563eb" />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Total Registered Users
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy, #0f172a)', lineHeight: 1.2 }}>
                {stats.total_users}
              </div>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                ✓ {stats.active_users} Active Accounts
              </span>
            </div>
          </div>

          {/* Card 2: Opportunities */}
          <div
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              background: '#ffffff'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#ecfdf5',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <Briefcase size={24} color="#059669" />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Available Opportunities
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy, #0f172a)', lineHeight: 1.2 }}>
                {stats.total_jobs}
              </div>
              <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
                Corporate Jobs & Internships
              </span>
            </div>
          </div>

          {/* Card 3: Resumes */}
          <div
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              background: '#ffffff'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#fffbeb',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={24} color="#d97706" />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Candidate Resumes
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy, #0f172a)', lineHeight: 1.2 }}>
                {stats.total_resumes}
              </div>
              <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
                Processed for AI matching
              </span>
            </div>
          </div>

          {/* Card 4: Applications */}
          <div
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              background: '#ffffff'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#f5f3ff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <FileCheck size={24} color="#7c3aed" />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Candidate Applications
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed', lineHeight: 1.2 }}>
                {stats.total_applications}
              </div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4, display: 'block' }}>
                ✓ Saved in job_applications
              </span>
            </div>
          </div>
        </div>

        {/* SECTION NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'all' ? '' : 'outline'}`}
            onClick={() => setActiveTab('all')}
            style={{ fontSize: 13, padding: '7px 16px' }}
          >
            All Sections
          </button>
          <button
            className={`btn ${activeTab === 'applications' ? '' : 'outline'}`}
            onClick={() => setActiveTab('applications')}
            style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FileCheck size={14} />
            <span>Job Applications ({applications.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'users' ? '' : 'outline'}`}
            onClick={() => setActiveTab('users')}
            style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Users size={14} />
            <span>Users Table ({users.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'jobs' ? '' : 'outline'}`}
            onClick={() => setActiveTab('jobs')}
            style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Briefcase size={14} />
            <span>Available Jobs ({jobs.length})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* JOB APPLICATIONS TABLE SECTION                                 */}
        {/* ============================================================== */}
        {(activeTab === 'all' || activeTab === 'applications') && (
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={18} color="#7c3aed" />
                  <span>Candidate Job Applications ({filteredApplications.length})</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Live candidate applications recorded in MySQL <code>job_applications</code> table
                </p>
              </div>

              {/* Application search & filter */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search candidate, job, or email..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    style={{ paddingLeft: 32, fontSize: 13, height: 36, width: 250 }}
                  />
                </div>

                <select
                  className="select"
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  style={{ fontSize: 13, height: 36, padding: '0 10px' }}
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
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                Loading applications from database...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                No candidate job applications found.
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
                    {filteredApplications.map((app) => {
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

                          {/* Candidate info */}
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <strong style={{ fontSize: 13, color: 'var(--navy, #0f172a)' }}>
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
                                <span style={{ fontSize: 11, color: '#0369a1', fontWeight: 600 }}>
                                  Exp: {app.experience_level}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Job info */}
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

                          {/* Cover Note & Portfolio */}
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
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
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

                          {/* Status */}
                          <td style={{ padding: '12px' }}>
                            <select
                              className="select"
                              value={app.status || 'Applied'}
                              onChange={(e) => handleApplicationStatus(app.application_id, e.target.value)}
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

                          {/* Action */}
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
        )}

        {/* ============================================================== */}
        {/* USERS TABLE SECTION                                            */}
        {/* ============================================================== */}
        {(activeTab === 'all' || activeTab === 'users') && (
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={18} color="var(--blue, #2563eb)" />
                  <span>Registered Users ({filteredUsers.length})</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Live candidate and administrator records directly from MySQL <code>users</code> table
                </p>
              </div>

              {/* User search & filter */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ paddingLeft: 32, fontSize: 13, height: 36, width: 220 }}
                  />
                </div>

                <select
                  className="select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ fontSize: 13, height: 36, padding: '0 10px' }}
                >
                  <option value="all">All Roles</option>
                  <option value="candidate">Candidates</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                Loading users from database...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                No users found matching your search.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>USER ID</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>CANDIDATE / USER</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>EMAIL</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>ROLE</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>RESUME</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>STATUS</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>JOINED</th>
                      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569', textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const initial = (u.full_name || 'U').charAt(0).toUpperCase();
                      const joinedDate = u.created_at
                        ? new Date(u.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '—';

                      return (
                        <tr key={u.user_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                            #{u.user_id}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: u.account_role === 'admin' ? '#fef3c7' : '#e0e7ff',
                                  color: u.account_role === 'admin' ? '#b45309' : '#3730a3',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  fontWeight: 700
                                }}
                              >
                                {initial}
                              </div>
                              <div>
                                <strong style={{ fontSize: 13, color: 'var(--navy, #0f172a)' }}>
                                  {u.full_name}
                                </strong>
                                {u.city && (
                                  <div style={{ fontSize: 11, color: '#64748b' }}>{u.city}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13, color: '#334155' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              className={`pill ${u.account_role === 'admin' ? 'blue' : 'green'}`}
                              style={{ fontSize: 11, padding: '3px 9px', textTransform: 'capitalize' }}
                            >
                              {u.account_role}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {u.has_resume ? (
                              <span className="pill green" style={{ fontSize: 11, padding: '3px 8px' }}>
                                ✓ Uploaded
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: u.account_role === 'admin' ? 'default' : 'pointer',
                                padding: 0
                              }}
                              title={u.account_role === 'admin' ? 'Admin status cannot be changed' : 'Click to toggle status'}
                            >
                              <span
                                className={`pill ${u.active_status === 1 ? 'green' : 'red'}`}
                                style={{ fontSize: 11, padding: '3px 9px' }}
                              >
                                {u.active_status === 1 ? '● Active' : '○ Inactive'}
                              </span>
                            </button>
                          </td>
                          <td style={{ padding: '12px', fontSize: 12, color: '#64748b' }}>
                            {joinedDate}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                              <button
                                className="btn outline small"
                                onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                                disabled={u.account_role === 'admin'}
                                title="Toggle Status"
                                style={{ padding: '4px 8px' }}
                              >
                                <UserCheck size={12} />
                              </button>
                              <button
                                className="btn small"
                                onClick={() => handleDeleteUser(u.user_id, u.account_role)}
                                disabled={u.account_role === 'admin'}
                                title="Delete User"
                                style={{
                                  background: u.account_role === 'admin' ? '#f1f5f9' : '#fff0f2',
                                  color: u.account_role === 'admin' ? '#94a3b8' : '#ef4b5f',
                                  padding: '4px 8px'
                                }}
                              >
                                <Trash2 size={12} />
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
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={18} color="#059669" />
                  <span>Available Corporate Jobs & Internships ({filteredJobs.length})</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  All real corporate openings in MySQL <code>jobs</code> table available for MCA candidates
                </p>
              </div>

              {/* Job search & filter */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by company, role or city..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    style={{ paddingLeft: 32, fontSize: 13, height: 36, width: 240 }}
                  />
                </div>

                <select
                  className="select"
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  style={{ fontSize: 13, height: 36, padding: '0 10px' }}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time Only</option>
                  <option value="internship">Internships Only</option>
                </select>

                <button
                  className="btn small"
                  onClick={() => handleOpenJobModal()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36 }}
                >
                  <Plus size={14} /> Add Job
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                Loading jobs from database...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                No jobs match the current filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredJobs.map((job) => {
                  const isInternship = (job.job_type || '').toLowerCase().includes('intern');
                  return (
                    <div
                      key={job.job_id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 14,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Left: Job Meta */}
                      <div style={{ flex: '1 1 360px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            className={`pill ${isInternship ? 'orange' : 'blue'}`}
                            style={{ fontSize: 11, padding: '2px 8px', fontWeight: 700 }}
                          >
                            {job.job_type || 'Full-time'}
                          </span>
                          <span className="pill green" style={{ fontSize: 11, padding: '2px 8px' }}>
                            {job.role_name || 'Tech'}
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>ID: #{job.job_id}</span>
                        </div>

                        <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
                          {job.job_title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                            <Building2 size={14} color="#64748b" /> {job.company_name}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={14} color="#64748b" /> {job.location || 'India'} ({job.work_mode || 'Hybrid'})
                          </span>
                          {job.salary_range && (
                            <span style={{ fontWeight: 700, color: '#047857' }}>
                              💰 {job.salary_range}
                            </span>
                          )}
                          <span>⏳ {job.experience_requirement || 'Fresher'}</span>
                        </div>

                        {/* Dates row: Available From & Due Date */}
                        {(job.posted_date || job.due_date) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, marginTop: 6 }}>
                            {job.posted_date && (
                              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={13} color="#2563eb" />
                                <span>Available: <strong style={{ color: '#0f172a' }}>{new Date(job.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                              </span>
                            )}
                            {job.due_date && (
                              <span style={{ 
                                color: new Date(job.due_date) < new Date() ? '#b91c1c' : '#b45309',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                background: new Date(job.due_date) < new Date() ? '#fef2f2' : '#fffbeb',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontWeight: 600,
                                border: new Date(job.due_date) < new Date() ? '1px solid #fecaca' : '1px solid #fde68a'
                              }}>
                                <Clock size={13} />
                                <span>Due Date: {new Date(job.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Skills preview */}
                        {job.skills && job.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                            {job.skills.slice(0, 5).map((s) => (
                              <span
                                key={s}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  fontSize: 11,
                                  fontWeight: 600
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link
                          to={`/job-details/${job.job_id}`}
                          className="btn outline small"
                          title="View Live Listing"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <ExternalLink size={12} />
                          <span>View</span>
                        </Link>
                        <button
                          className="btn outline small"
                          onClick={() => handleOpenJobModal(job)}
                          title="Edit Job"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn small"
                          onClick={() => handleDeleteJob(job.job_id, job.job_title)}
                          title="Delete Job"
                          style={{ background: '#fff0f2', color: '#ef4b5f', padding: '6px 10px' }}
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
              style={{
                width: '100%',
                maxWidth: 620,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  {editingJob ? `Edit Job #${editingJob.job_id}` : 'Post New Job / Internship'}
                </h3>
                <button
                  onClick={() => setShowJobModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {jobFeedback.error && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {jobFeedback.error}
                </div>
              )}
              {jobFeedback.success && (
                <div style={{ padding: '10px 14px', background: '#d1fae5', color: '#065f46', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {jobFeedback.success}
                </div>
              )}

              <form onSubmit={handleSaveJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
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

                  <div className="form-group">
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

                <div className="grid grid-3" style={{ gap: 12 }}>
                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Location</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Bangalore, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
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

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Available / Opening Date</label>
                    <input
                      className="input"
                      type="date"
                      value={postedDate}
                      onChange={(e) => setPostedDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Application Due Date (Deadline)</label>
                    <input
                      className="input"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Experience Requirement</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. 0 - 1 Years or Fresher"
                    value={experienceReq}
                    onChange={(e) => setExperienceReq(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Job Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Brief description of the opportunity and company mission..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Key Responsibilities (One per line)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Analyze datasets using SQL&#10;Build interactive dashboards in Power BI&#10;Collaborate with software engineers"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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
