import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Edit3, Building2, RefreshCw, X, CheckCircle2, AlertCircle, Eye, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';
import { EmptyState } from '../components/ui';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [careerRoles, setCareerRoles] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  // Form Fields
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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobsData, rolesData] = await Promise.all([
        api.getJobs(),
        api.getCareerRoles().catch(() => [])
      ]);
      if (Array.isArray(jobsData)) setJobs(jobsData);
      if (Array.isArray(rolesData)) setCareerRoles(rolesData);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenAddModal = () => {
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
    setFeedback({ error: '', success: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (j) => {
    setEditingJob(j);
    setJobTitle(j.job_title || '');
    setCompanyName(j.company_name || '');
    setCareerRoleId(j.career_role_id || 1);
    setLocation(j.location || 'Bangalore, India');
    setWorkMode(j.work_mode || 'Hybrid');
    setJobType(j.job_type || 'Full-time');
    setExperienceReq(j.experience_requirement || '0 - 1 Years');
    setSalaryRange(j.salary_range || '');
    setDescription(j.description || '');
    setResponsibilities(j.responsibilities || '');
    setPostedDate(j.posted_date || new Date().toISOString().split('T')[0]);
    setDueDate(j.due_date || '');
    setFeedback({ error: '', success: '' });
    setShowModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job from MySQL database?')) return;
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
    } catch (err) {
      alert('Failed to delete job: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ error: '', success: '' });

    const payload = {
      career_role_id: parseInt(careerRoleId, 10),
      job_title: jobTitle.trim(),
      company_name: companyName.trim(),
      location: location.trim(),
      work_mode: workMode,
      job_type: jobType,
      experience_requirement: experienceReq.trim(),
      salary_range: salaryRange.trim() || null,
      description: description.trim() || null,
      responsibilities: responsibilities.trim() || null,
      posted_date: postedDate || null,
      due_date: dueDate || null
    };

    try {
      if (editingJob) {
        const updated = await api.updateJob(editingJob.job_id, payload);
        setJobs((prev) => prev.map((j) => (j.job_id === editingJob.job_id ? updated : j)));
        setFeedback({ error: '', success: 'Job updated in MySQL database successfully!' });
      } else {
        const created = await api.createJob(payload);
        setJobs((prev) => [...prev, created]);
        setFeedback({ error: '', success: 'New job inserted into MySQL database successfully!' });
      }
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setFeedback({ error: err.message || 'Operation failed', success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout admin>
      <Page
        title="Job & Internship Management"
        subtitle="Manage live opportunities stored directly in MySQL — changes appear instantly across CareerIQ"
        action={
          <button type="button" className="btn" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Add New Job</span>
          </button>
        }
      >
        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h3 className="card-title">Active Openings ({jobs.length})</h3>
              <p className="card-sub">Real corporate and internship data linked with MySQL</p>
            </div>
            <button type="button" className="btn outline small" onClick={fetchJobs}>
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={22} className="spin" />
              <p>Loading jobs from MySQL...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title='No jobs found. Click "Add New Job" to post an opportunity.' />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>Job Title & Role</th>
                    <th>Type</th>
                    <th>Location & Mode</th>
                    <th>Salary</th>
                    <th>Available & Due Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.job_id}>
                      <td className="muted text-xs num">#{j.job_id}</td>
                      <td>
                        <strong className="row-gap" style={{ gap: 6, flexWrap: 'nowrap' }}>
                          <Building2 size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          {j.company_name}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{j.job_title}</div>
                        <span className="muted text-xs">{j.role_name}</span>
                      </td>
                      <td>
                        <span className={`pill ${j.job_type === 'Internship' ? 'warn' : 'info'}`}>
                          {j.job_type || 'Full-time'}
                        </span>
                      </td>
                      <td>
                        <div>{j.location}</div>
                        <span className="muted text-xs">{j.work_mode}</span>
                      </td>
                      <td className="text-good" style={{ fontWeight: 600 }}>{j.salary_range || 'Competitive'}</td>
                      <td>
                        <div className="stack text-xs" style={{ gap: 3 }}>
                          {j.posted_date && (
                            <span className="row-gap muted" style={{ gap: 4, flexWrap: 'nowrap' }}>
                              <Calendar size={12} style={{ color: 'var(--accent)' }} />
                              <span>From: {new Date(j.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </span>
                          )}
                          {j.due_date && (
                            <span
                              className={`row-gap ${new Date(j.due_date) < new Date() ? 'text-bad' : 'text-warn'}`}
                              style={{ gap: 4, fontWeight: 600, flexWrap: 'nowrap' }}
                            >
                              <Clock size={12} />
                              <span>Due: {new Date(j.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-gap" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap', gap: 6 }}>
                          <Link to={`/job-details/${j.job_id}`} className="btn outline small" title="View Public Details">
                            <Eye size={13} />
                          </Link>
                          <button
                            type="button"
                            className="btn outline small"
                            onClick={() => handleOpenEditModal(j)}
                            title="Edit Job"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn outline small danger"
                            onClick={() => handleDeleteJob(j.job_id)}
                            title="Delete Job"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: ADD / EDIT JOB */}
        {showModal && (
          <div className="modal-bg" onClick={() => setShowModal(false)}>
            <div className="modal wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="modal-head">
                <h3>{editingJob ? `Edit Job #${editingJob.job_id}` : 'Add New Corporate Job / Internship'}</h3>
                <button type="button" className="icon-btn" onClick={() => setShowModal(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="stack">
                {feedback.error && (
                  <div className="notice bad">
                    <AlertCircle size={16} />
                    <span className="notice-main">{feedback.error}</span>
                  </div>
                )}
                {feedback.success && (
                  <div className="notice good">
                    <CheckCircle2 size={16} />
                    <span className="notice-main" style={{ fontWeight: 600 }}>{feedback.success}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Job Title *</label>
                    <input
                      className="input"
                      type="text"
                      required
                      placeholder="e.g. Data Analyst (Graduate)"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Company Name *</label>
                    <input
                      className="input"
                      type="text"
                      required
                      placeholder="e.g. Google, Microsoft, TCS"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Career Category Role</label>
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
                    <label className="label">Employment Type</label>
                    <select className="select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-time / Internship">Full-time / Internship</option>
                      <option value="Contract">Contract</option>
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
                    <label className="label">Work Mode</label>
                    <select className="select" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Experience Required</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. 0 - 1 Years / Fresher"
                      value={experienceReq}
                      onChange={(e) => setExperienceReq(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Salary / Stipend Range</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. ₹12.0 - ₹18.0 LPA or ₹50,000/mo"
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
                  <label className="label">Job Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Summary of what the candidate will be doing..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label">Key Duties & Responsibilities (one per line)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Analyze datasets using SQL&#10;Build interactive dashboards&#10;Collaborate with product team"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn" disabled={submitting}>
                    {submitting ? 'Saving to MySQL...' : editingJob ? 'Save Changes' : 'Publish Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Page>
    </Layout>
  );
}
