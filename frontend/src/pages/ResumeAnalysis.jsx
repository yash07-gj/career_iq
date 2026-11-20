import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, StatTile, EmptyState } from '../components/ui';
import { Link } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

// Steps shown while the real upload + analysis request is running
const RUN_STEPS = ['Reading resume', 'Extracting skills', 'Matching career roles', 'Building your roadmap'];

export default function ResumeAnalysis() {
  const currentUser = auth.getUser();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  // -1 = hidden, 0..n-1 = active step, n = all steps complete
  const [runStep, setRunStep] = useState(-1);

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

  // Advance the analysis steps while the request is in flight.
  // The last step stays "in progress" until the API actually responds.
  useEffect(() => {
    if (!loading) return undefined;
    const t = setInterval(() => {
      setRunStep((s) => (s < RUN_STEPS.length - 1 ? s + 1 : s));
    }, 600);
    return () => clearInterval(t);
  }, [loading]);

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

  // Drag & drop uses the same validation as the file picker
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
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
    setRunStep(0);

    try {
      const data = await api.uploadResume(file, currentUser.user_id);
      setResult(data);
      setExistingResume({
        has_resume: true,
        file_name: data.file_name,
        skills: data.skills_extracted,
        total_skills: data.total_skills,
      });
      setRunStep(RUN_STEPS.length);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
      setRunStep(-1);
    } finally {
      setLoading(false);
    }
  };

  const skills = result?.skills_extracted || existingResume?.skills || [];
  const fileName = result?.file_name || existingResume?.file_name;

  return (
    <Layout>
      <Page
        title="AI Resume Analysis"
        subtitle="Upload your resume to extract skills, compute readiness score, and generate matching career paths"
      >
        <JourneyBar current="resume" />

        {/* Active Resume Banner if already uploaded */}
        {existingResume && !result && (
          <div className="notice good">
            <FileText size={20} />
            <div className="notice-main">
              <strong>Active Resume: {existingResume.file_name}</strong>
              <p className="muted text-sm" style={{ margin: '2px 0 0' }}>
                {existingResume.total_skills} verified skills extracted. You can upload a new resume below to update your metrics.
              </p>
            </div>
            <Link to="/dashboard" className="btn outline small">
              Go to Dashboard
            </Link>
          </div>
        )}

        <div className="ui-grid split">
          {/* Upload Card */}
          <div className="card card-pad stack">
            <h3 className="card-title row-gap">
              <Sparkles size={18} color="var(--accent)" /> Upload Resume Document
            </h3>

            {error && (
              <div className="notice bad">
                <AlertCircle size={18} />
                <span className="notice-main">{error}</span>
              </div>
            )}

            <div
              className={`upload drop ${dragOver ? 'over' : ''}`}
              style={file ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : undefined}
              onClick={() => document.getElementById('resume-file-input').click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                id="resume-file-input"
                hidden
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              {file ? <FileText size={34} /> : <Upload size={34} />}
              <h3>{file ? file.name : 'Click or drag & drop your resume file here'}</h3>
              <p>
                {file ? `${(file.size / 1024).toFixed(1)} KB — Ready for analysis` : 'Supports PDF, DOCX, and DOC formats'}
              </p>
              {!file && (
                <button
                  type="button"
                  className="btn outline small"
                  style={{ marginTop: 6 }}
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
              className="btn block"
              disabled={!file || loading}
              onClick={handleUploadAndAnalyze}
              style={{ padding: 13, fontSize: 15 }}
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

            {runStep >= 0 && (
              <div className="run-steps" aria-live="polite">
                {RUN_STEPS.map((label, i) => {
                  const state = i < runStep ? 'ok' : i === runStep ? 'active' : '';
                  return (
                    <div key={label} className={`run ${state}`}>
                      <span className="run-dot">{state === 'ok' ? '✓' : ''}</span>
                      {label}{state === 'active' ? '…' : ''}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current analysis */}
          <div className="card card-pad stack">
            <div className="card-head" style={{ marginBottom: 0 }}>
              <h3 className="card-title">Current Analysis</h3>
              {fileName && <span className="pill good">{fileName}</span>}
            </div>
            {skills.length > 0 ? (
              <>
                <p className="muted text-sm" style={{ margin: 0 }}>
                  Verified Skills Extracted from Resume ({skills.length})
                </p>
                <div className="chips">
                  {skills.map((skill) => (
                    <span key={skill} className="pill good">✓ {skill}</span>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={FileText}
                title={existingResume ? `${existingResume.total_skills || 0} verified skills extracted` : 'No resume analysed yet'}
                text="Upload your resume to extract your verified skills."
              />
            )}
          </div>
        </div>

        {/* Analysis Results View */}
        {result && (
          <>
            <div className="notice good">
              <CheckCircle2 size={20} />
              <strong className="notice-main">{result.message}</strong>
            </div>

            <div className="ui-grid cols-3">
              <StatTile
                label="Career Readiness"
                value={`${result.overall_readiness}%`}
                tone="good"
                sub="Evaluated across technical prerequisites"
              />
              <StatTile
                label="Skills Extracted"
                value={result.total_skills}
                sub="Catalog skills matched from text"
              />
              <StatTile
                label="Top Career Match"
                value={result.top_career_match}
                tone="warn"
                sub={`${result.top_match_percentage}% Alignment`}
              />
            </div>

            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Extracted Profile Overview</h3>
              <div className="table-wrap">
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ width: '30%' }}>Candidate Name</th>
                      <td><strong>{result.candidate_name || currentUser?.full_name}</strong></td>
                    </tr>
                    <tr>
                      <th>Email Address</th>
                      <td>{result.candidate_email || currentUser?.email}</td>
                    </tr>
                    <tr>
                      <th>Detected Education</th>
                      <td>{result.education || 'Master / Bachelor Degree in Computer Applications'}</td>
                    </tr>
                    <tr>
                      <th>Detected Experience</th>
                      <td>{result.experience || 'Fresher / Entry Level'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="row-gap">
              <Link to="/dashboard" className="btn" style={{ flex: 1 }}>
                View Full Dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/gap-analysis" className="btn outline" style={{ flex: 1 }}>
                View Skill Gap Analysis
              </Link>
            </div>
          </>
        )}

        <NextStep
          title="Next: see which careers suit you"
          text="Your skills have been matched against every career role."
          to="/recommendations"
          cta="See my career matches"
        />
      </Page>
    </Layout>
  );
}
