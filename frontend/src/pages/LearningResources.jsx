import React from 'react';
import { BookOpen, PlayCircle, Code2, ExternalLink } from 'lucide-react';
import { Layout, Page } from '../components/Layout';

const resources = [
  ['Machine Learning for Beginners', 'Coursera', 'Beginner', 'Start Learning', BookOpen],
  ['Statistics Essentials', 'Khan Academy', 'Beginner', 'Start Learning', BookOpen],
  ['Scikit-learn Tutorial', 'YouTube', 'Intermediate', 'Watch Now', PlayCircle],
  ['Data Science Hands-on Projects', 'GitHub', 'Intermediate', 'View Resource', Code2],
  ['Deep Learning Specialization', 'Coursera', 'Advanced', 'Start Learning', BookOpen],
];

export default function LearningResources() {
  return (
    <Layout>
      <Page title="Learning Resources" subtitle="Curated resources for your skills">
        <div className="card card-pad">
          {resources.map(([t, p, l, a, Icon]) => (
            <div className="resource" key={t}>
              <div className="resource-icon">
                <Icon size={14} />
              </div>
              <div className="resource-body">
                <strong>{t}</strong>
                <span>{p} · {l}</span>
              </div>
              <button className="btn outline small">
                {a} <ExternalLink size={9} />
              </button>
            </div>
          ))}
        </div>
      </Page>
    </Layout>
  );
}
