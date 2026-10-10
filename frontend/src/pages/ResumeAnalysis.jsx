import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, Target, BrainCircuit, Award } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

export default function ResumeAnalysis() {
  const currentUser = auth.getUser();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [existingResume, setExistingResume] = useState(null);

  // Check if user already has an active resume on load
  useEffect(() => {
    async function checkStatus() {
      if (!currentUser?.user_id) return;
      try {
        const res = await api.getResumeStatus(currentUser.user_id);
        if (res && res.has_resume) {
          setExistingResume(res);
        }
      } catch (e) {
        console.warn('Status check notice:', e);
      }
    }
    checkStatus();
  }, [currentUser?.user_id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
        setError('Please choose a valid PDF or DOCX file.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    if (!currentUser?.user_id) {
      setError('Please sign in to upload and analyze your resume.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.uploadResume(file, currentUser.user_id);
      setResult(data);
      setExistingResume({
        has_resume: true,
        file_name: data.file_name,
        skills: data.skills_extracted,
        total_skills: data.total_skills,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Page
        title="AI Resume Analysis"
        subtitle="Upload your resume to extract skills, compute readiness score, and generate matching career paths"
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          
          {/* Active Resume Banner if already uploaded */}
          {existingResume && !result && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#059669" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#065f46' }}>
                    Active Resume: {existingResume.file_name}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#047857' }}>
                    {existingResume.total_skills} verified skills extracted. You can upload a new resume below to update your metrics.
                  </p>
                </div>
              </div>
              <Link to="/dashboard" className="btn outline small" style={{ color: '#059669', borderColor: '#059669' }}>
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Upload Card */}
          <div className="card card-pad">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color="var(--blue)" /> Upload Resume Document
            </h3>

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div
              className="upload"
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 14,
                padding: '36px 20px',
                textAlign: 'center',
                background: file ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => document.getElementById('resume-file-input').click()}
            >
              <input
                id="resume-file-input"
                hidden
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: file ? '#dbeafe' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                {file ? <FileText size={28} color="#2563eb" /> : <Upload size={28} color="#64748b" />}
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: file ? '#1e40af' : '#1e293b' }}>
                {file ? file.name : 'Click or drag & drop your resume file here'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB — Ready for analysis` : 'Supports PDF, DOCX, and DOC formats'}
              </p>
              {!file && (
                <button
                  type="button"
                  className="btn outline small"
                  style={{ marginTop: 16 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('resume-file-input').click();
                  }}
                >
                  Choose File
                </button>
              )}
            </div>

            <button
              className="btn"
              disabled={!file || loading}
              onClick={handleUploadAndAnalyze}
              style={{
                marginTop: 18,
                width: '100%',
                padding: '13px',
                fontSize: 15,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: !file || loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Analyzing Resume with NLP & Matching Engine...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Resume & Update Dashboard
                </>
              )}
            </button>
          </div>

          {/* Analysis Results View */}
          {result && (
            <div style={{ marginTop: 24 }}>
              {/* Success Notification */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#047857',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '14px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                <CheckCircle2 size={20} color="#10b981" />
                <span>{result.message}</span>
              </div>

              {/* Top Result Metrics */}
              <div className="grid grid-3" style={{ marginBottom: 20 }}>
                <div className="card card-pad">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                    <Target size={16} color="#10b981" /> CAREER READINESS
                  </div>
                  <strong className="metric-value green" style={{ fontSize: 32 }}>
                    {result.overall_readiness}%
                  </strong>
                  <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    Evaluated across technical prerequisites
                  </span>
                </div>

                <div className="card card-pad">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                    <BrainCircuit size={16} color="#2563eb" /> SKILLS EXTRACTED
                  </div>
                  <strong className="metric-value blue" style={{ fontSize: 32 }}>
                    {result.total_skills}
                  </strong>
                  <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    Catalog skills matched from text
                  </span>
                </div>

                <div className="card card-pad">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                    <Award size={16} color="#f59e0b" /> TOP CAREER MATCH
                  </div>
                  <strong className="metric-value orange" style={{ fontSize: 22, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {result.top_career_match}
                  </strong>
                  <span style={{ display: 'block', fontSize: 12, color: '#f59e0b', fontWeight: 700, marginTop: 4 }}>
                    {result.top_match_percentage}% Alignment
                  </span>
                </div>
              </div>

              {/* Extracted Skills Badges */}
              <div className="card card-pad" style={{ marginBottom: 20 }}>
                <h3 className="card-title" style={{ marginBottom: 12 }}>
                  Verified Skills Extracted from Resume ({result.skills_extracted.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.skills_extracted.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted Candidate Profile Table */}
              <div className="card card-pad" style={{ marginBottom: 24 }}>
                <h3 className="card-title" style={{ marginBottom: 14 }}>
                  Extracted Profile Overview
                </h3>
                <table className="table" style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <th style={{ width: '25%', color: '#64748b', fontWeight: 600 }}>Candidate Name</th>
                      <td><strong>{result.candidate_name || currentUser?.full_name}</strong></td>
                    </tr>
                    <tr>
                      <th style={{ color: '#64748b', fontWeight: 600 }}>Email Address</th>
                      <td>{result.candidate_email || currentUser?.email}</td>
                    </tr>
                    <tr>
                      <th style={{ color: '#64748b', fontWeight: 600 }}>Detected Education</th>
                      <td>{result.education || 'Master / Bachelor Degree in Computer Applications'}</td>
                    </tr>
                    <tr>
                      <th style={{ color: '#64748b', fontWeight: 600 }}>Detected Experience</th>
                      <td>{result.experience || 'Fresher / Entry Level'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons to View Live Insights */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link
                  to="/dashboard"
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    textDecoration: 'none',
                  }}
                >
                  View Full Dashboard <ArrowRight size={16} />
                </Link>
                <Link
                  to="/gap-analysis"
                  className="btn outline"
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    textDecoration: 'none',
                  }}
                >
                  View Skill Gap Analysis
                </Link>
              </div>

            </div>
          )}

        </div>
      </Page>
    </Layout>
  );
}
