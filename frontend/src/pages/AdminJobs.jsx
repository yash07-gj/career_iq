import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  Building2,
  MapPin,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';

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
      responsibilities: responsibilities.trim() || null
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
          <button
            type="button"
            className="btn"
            onClick={handleOpenAddModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add New Job</span>
          </button>
        }
      >
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <strong>Active Openings ({jobs.length})</strong>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Real corporate and internship data linked with MySQL
              </div>
            </div>
            <button
              type="button"
              className="btn outline small"
              onClick={fetchJobs}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              Loading jobs from MySQL...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              No jobs found. Click "Add New Job" to post an opportunity.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>Job Title & Role</th>
                    <th>Type</th>
                    <th>Location & Mode</th>
                    <th>Salary</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.job_id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{j.job_id}</td>
                      <td>
                        <strong style={{ color: 'var(--navy, #0f172a)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Building2 size={14} color="var(--blue, #2563eb)" />
                          {j.company_name}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{j.job_title}</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{j.role_name}</span>
                      </td>
                      <td>
                        <span className={`pill ${j.job_type === 'Internship' ? 'orange' : 'blue'}`} style={{ fontSize: 11 }}>
                          {j.job_type || 'Full-time'}
                        </span>
                      </td>
                      <td>
                        <div>{j.location}</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{j.work_mode}</span>
                      </td>
                      <td style={{ color: '#047857', fontWeight: 600 }}>{j.salary_range || 'Competitive'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Link
                            to={`/job-details/${j.job_id}`}
                            className="btn outline small"
                            style={{ padding: '6px 10px', textDecoration: 'none' }}
                            title="View Public Details"
                          >
                            <Eye size={12} />
                          </Link>
                          <button
                            type="button"
                            className="btn outline small"
                            onClick={() => handleOpenEditModal(j)}
                            style={{ padding: '6px 10px' }}
                            title="Edit Job"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            type="button"
                            className="btn small"
                            onClick={() => handleDeleteJob(j.job_id)}
                            style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 10px' }}
                            title="Delete Job"
                          >
                            <Trash2 size={12} />
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
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--line, #e2e8f0)',
                borderRadius: 16,
                width: '100%',
                maxWidth: 600,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--line, #e2e8f0)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--navy, #0f172a)' }}>
                  {editingJob ? `Edit Job #${editingJob.job_id}` : 'Add New Corporate Job / Internship'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: 'auto' }}>
                {feedback.error && (
                  <div style={{ display: 'flex', gap: 8, padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                    <AlertCircle size={16} />
                    <span>{feedback.error}</span>
                  </div>
                )}
                {feedback.success && (
                  <div style={{ display: 'flex', gap: 8, padding: 10, background: '#ecfdf5', color: '#065f46', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>{feedback.success}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontSize: 12 }}>Job Title *</label>
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
                    <label className="label" style={{ fontSize: 12 }}>Company Name *</label>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontSize: 12 }}>Career Category Role</label>
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
                    <label className="label" style={{ fontSize: 12 }}>Employment Type</label>
                    <select className="select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-time / Internship">Full-time / Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontSize: 12 }}>Location</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Bangalore, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontSize: 12 }}>Work Mode</label>
                    <select className="select" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontSize: 12 }}>Experience Required</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. 0 - 1 Years / Fresher"
                      value={experienceReq}
                      onChange={(e) => setExperienceReq(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontSize: 12 }}>Salary / Stipend Range</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. ₹12.0 - ₹18.0 LPA or ₹50,000/mo"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="label" style={{ fontSize: 12 }}>Job Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Summary of what the candidate will be doing..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ height: 'auto', padding: 8 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="label" style={{ fontSize: 12 }}>Key Duties & Responsibilities (one per line)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Analyze datasets using SQL&#10;Build interactive dashboards&#10;Collaborate with product team"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    style={{ height: 'auto', padding: 8 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
