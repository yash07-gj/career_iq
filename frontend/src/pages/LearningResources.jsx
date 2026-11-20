import React, { useState } from 'react';
import { BookOpen, PlayCircle, Code2, ExternalLink } from 'lucide-react';
import { Layout, Page } from '../components/Layout';

const resources = [
  ['Machine Learning for Beginners', 'Coursera', 'Beginner', 'Start Learning', BookOpen],
  ['Statistics Essentials', 'Khan Academy', 'Beginner', 'Start Learning', BookOpen],
  ['Scikit-learn Tutorial', 'YouTube', 'Intermediate', 'Watch Now', PlayCircle],
  ['Data Science Hands-on Projects', 'GitHub', 'Intermediate', 'View Resource', Code2],
  ['Deep Learning Specialization', 'Coursera', 'Advanced', 'Start Learning', BookOpen],
];

const levelTone = (l) => (l === 'Beginner' ? 'good' : l === 'Intermediate' ? 'warn' : 'info');

export default function LearningResources() {
  const [tab, setTab] = useState('All');
  return (
    <Layout>
      <Page title="Learning Resources" subtitle="Curated resources for your skills">
        <div className="seg" role="tablist" aria-label="Resource type">
          {['All', 'Recommended', 'Courses', 'YouTube', 'Documentation'].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={tab === t ? 'on' : ''} aria-pressed={tab === t}>
              {t}
            </button>
          ))}
        </div>

        <div className="ui-grid cols-2">
          {resources.map(([t, p, l, a, I]) => (
            <div className="card card-pad list-row" key={t} style={{ margin: 0 }}>
              <span className="list-icon"><I size={18} /></span>
              <div className="list-main">
                <strong>{t}</strong>
                <span>{p} · <span className={`pill ${levelTone(l)}`}>{l}</span></span>
              </div>
              <div className="list-end">
                <button type="button" className="btn outline small">
                  {a} <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Page>
    </Layout>
  );
}
