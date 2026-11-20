import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, BookOpen, ExternalLink, ArrowRight, Sparkles, Undo2 } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { JourneyBar, NextStep, Gauge, EmptyState } from '../components/ui';
import useToast from '../hooks/useToast';
import { Link } from 'react-router-dom';
import api from '../services/api';
import auth from '../utils/auth';

// completion_status values used by the database: 'completed' | 'in_progress' | 'not_started'
const DONE = 'completed';
const NOT_DONE = 'not_started';

const statusPill = (status) => {
  if (status === DONE) return <span className="pill good">Completed</span>;
  if (status === 'in_progress') return <span className="pill info">In progress</span>;
  return <span className="pill neutral">Not started</span>;
};

export default function Roadmap() {
  const currentUser = auth.getUser();
  const [roadmap, setRoadmap] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [toast, showToast] = useToast();

  useEffect(() => {
    async function loadRoadmap() {
      if (!currentUser?.user_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getRoadmap(currentUser.user_id);
        if (res) {
          setRoadmap(res);
        }
      } catch (err) {
        console.warn('Roadmap fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [currentUser?.user_id]);

  const steps = roadmap?.steps || [];
  const hasSteps = steps.length > 0;
  const completed = steps.filter((s) => s.completion_status === DONE).length;
  const percent = hasSteps ? Math.round((completed / steps.length) * 100) : 0;
  const currentStep = steps.find((s) => s.completion_status !== DONE);

  const setStepStatus = (stepId, status) =>
    setRoadmap((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.roadmap_step_id === stepId ? { ...s, completion_status: status } : s)),
    }));

  const toggleDone = async (step) => {
    const previous = step.completion_status;
    const next = previous === DONE ? NOT_DONE : DONE;
    setSavingId(step.roadmap_step_id);
    setStepStatus(step.roadmap_step_id, next); // optimistic update
    try {
      await api.updateRoadmapStep(step.roadmap_step_id, next);
      showToast(next === DONE ? `Milestone completed: ${step.skill_name}` : `Milestone reopened: ${step.skill_name}`);
    } catch (err) {
      setStepStatus(step.roadmap_step_id, previous); // revert
      showToast(`Could not update milestone: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Layout>
      <Page
        title="Your Career Roadmap"
        subtitle={roadmap?.title || "Step-by-step learning milestones to bridge your career skill gaps"}
      >
        <JourneyBar current="roadmap" />

        {!hasSteps ? (
          <div className="card card-pad">
            {loading ? (
              <div className="stack">
                <div className="skeleton" style={{ height: 18, width: '40%' }} />
                <div className="skeleton" style={{ height: 70 }} />
                <div className="skeleton" style={{ height: 70 }} />
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No Career Roadmap Generated Yet"
                text="Upload your resume so our AI engine can calculate your specific skill deficiencies and generate an accelerated 30-day learning roadmap tailored to your dream career."
                action={
                  <Link to="/resume" className="btn">
                    Upload Resume to Build Roadmap <ArrowRight size={16} />
                  </Link>
                }
              />
            )}
          </div>
        ) : (
          <div className="ui-grid split">
            {/* Milestone Timeline */}
            <div className="card card-pad">
              <div className="card-head">
                <h3 className="card-title">Milestone Timeline</h3>
                <span className="pill info">Target: {roadmap.target_role}</span>
              </div>

              <div className="row-between text-xs muted" style={{ marginBottom: 6 }}>
                <span>Progress</span>
                <span className="num">{completed} of {steps.length} completed</span>
              </div>
              <div className="track" style={{ marginBottom: 18 }}>
                <div className="fill good" style={{ width: `${percent}%` }} />
              </div>

              <div className="tl">
                {steps.map((s) => {
                  const done = s.completion_status === DONE;
                  const isCurrent = currentStep && currentStep.roadmap_step_id === s.roadmap_step_id;
                  return (
                    <div
                      className={`tl-item ${done ? 'done' : isCurrent ? 'cur' : ''}`}
                      key={s.roadmap_step_id || s.step_number}
                    >
                      <span className="tl-dot">{done ? <CheckCircle2 size={16} /> : s.step_number}</span>
                      <div
                        className="tl-body"
                        onClick={() => setActiveStep(s.step_number)}
                        style={{
                          cursor: 'pointer',
                          borderColor: activeStep === s.step_number ? 'var(--accent)' : undefined,
                        }}
                      >
                        <div className="tl-top">
                          <strong>Master {s.skill_name}</strong>
                          {statusPill(s.completion_status)}
                        </div>
                        <p className="muted text-sm" style={{ margin: 0 }}>
                          Curated resource: {s.resource_title}
                        </p>
                        <div className="row-between">
                          <span className="muted text-xs row-gap">
                            <Clock size={12} /> {s.expected_days} Days
                          </span>
                          <button
                            type="button"
                            className={`btn small ${done ? 'outline' : 'green'}`}
                            disabled={savingId === s.roadmap_step_id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDone(s);
                            }}
                          >
                            {done ? (<><Undo2 size={14} /> Undo</>) : (<><CheckCircle2 size={14} /> Mark as done</>)}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side: progress + resources for the selected step */}
            <div className="stack" style={{ alignSelf: 'start' }}>
              <div className="card card-pad">
                <Gauge value={percent} label="Roadmap complete" color="var(--good)" />
              </div>

              <div className="card card-pad">
                <h3 className="card-title">Curated Learning Resources</h3>
                <p className="card-sub" style={{ marginBottom: 14 }}>
                  Recommended study material for Milestone {activeStep}.
                </p>

                {steps
                  .filter((s) => s.step_number === activeStep)
                  .map((s) => (
                    <div className="list-row" key={s.roadmap_step_id || s.step_number} style={{ margin: 0 }}>
                      <span className="list-icon"><BookOpen size={18} /></span>
                      <div className="list-main">
                        <strong>{s.resource_title}</strong>
                        <span>Provider: <strong style={{ display: 'inline' }}>{s.provider}</strong> · Type: {s.resource_type}</span>
                      </div>
                      <a
                        href={s.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn small"
                      >
                        Study <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <NextStep
          title="Next: see what learning will change"
          text="Simulate your readiness before you start a course."
          to="/simulation"
          cta="Open simulation"
        />
        {toast}
      </Page>
    </Layout>
  );
}
