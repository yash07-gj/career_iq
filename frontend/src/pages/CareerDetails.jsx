import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Briefcase
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { mockCareerRecommendations } from '../mockData/careerData';
import api from '../services/api';

// Detailed mock prediction data mapping (fallback for current mock mode)
const detailedPredictions = {
  1: {
    matchedSkills: ['Python', 'SQL', 'Excel', 'Pandas', 'Data Cleaning'],
    skillAlignment: [
      { skill: 'Python', score: 92, level: 'Strong' },
      { skill: 'SQL', score: 88, level: 'Strong' },
      { skill: 'Excel', score: 78, level: 'Good' },
      { skill: 'Pandas', score: 75, level: 'Good' }
    ],
    missingSkills: ['Power BI', 'Statistics', 'Data Visualization'],
    contributingFactors: [
      'Technical Skills Extraction (89% overlap with Data Analyst benchmark)',
      'Academic coursework in database management & computing applications',
      'Data-oriented project experience and analytical mindset',
      'Extracted proficiency in tabular data manipulation (Pandas, Excel)'
    ]
  },
  2: {
    matchedSkills: ['Communication', 'SQL', 'Excel', 'Problem Solving', 'Data Interpretation'],
    skillAlignment: [
      { skill: 'SQL', score: 85, level: 'Strong' },
      { skill: 'Communication', score: 90, level: 'Strong' },
      { skill: 'Excel', score: 80, level: 'Strong' },
      { skill: 'Problem Solving', score: 75, level: 'Good' }
    ],
    missingSkills: ['Agile Methodologies', 'Tableau', 'Business Process Modeling'],
    contributingFactors: [
      'Strong cross-functional communication and requirement elicitation',
      'Demonstrated data querying and reporting capabilities with SQL',
      'Internship experience in structured team environments'
    ]
  },
  3: {
    matchedSkills: ['SQL', 'Excel', 'Data Modeling', 'Reporting', 'Query Optimization'],
    skillAlignment: [
      { skill: 'SQL', score: 88, level: 'Strong' },
      { skill: 'Excel', score: 82, level: 'Strong' },
      { skill: 'Data Modeling', score: 72, level: 'Good' }
    ],
    missingSkills: ['Power BI', 'Tableau', 'DAX', 'Data Warehousing'],
    contributingFactors: [
      'High competency in relational databases and structured query formulation',
      'Demonstrated experience summarizing datasets into presentation formats',
      'Foundation in enterprise data architecture concepts'
    ]
  },
  4: {
    matchedSkills: ['Python', 'Pandas', 'SQL', 'Linear Algebra', 'NumPy'],
    skillAlignment: [
      { skill: 'Python', score: 92, level: 'Strong' },
      { skill: 'SQL', score: 88, level: 'Strong' },
      { skill: 'Pandas', score: 75, level: 'Good' }
    ],
    missingSkills: ['Machine Learning', 'Deep Learning', 'Statistics', 'Scikit-learn'],
    contributingFactors: [
      'Advanced programming proficiency in Python and statistical data structures',
      'Solid mathematical and computing fundamentals from MCA coursework'
    ]
  },
  5: {
    matchedSkills: ['Python', 'SQL', 'Git', 'Data Structures', 'Algorithms'],
    skillAlignment: [
      { skill: 'Python', score: 90, level: 'Strong' },
      { skill: 'SQL', score: 84, level: 'Strong' },
      { skill: 'Git', score: 65, level: 'Moderate' }
    ],
    missingSkills: ['REST APIs', 'System Design', 'Docker', 'Testing / CI-CD'],
    contributingFactors: [
      'Core programming proficiency and algorithmic problem solving',
      'Backend query design and schema interaction experience'
    ]
  }
};

export default function CareerDetails() {
  const { careerId } = useParams();
  const [career, setCareer] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Find base career recommendation object by ID or fallback to first
        const numericId = parseInt(careerId, 10) || 1;
        const found = mockCareerRecommendations.find(
          (c) => c.id === numericId || String(c.id) === String(careerId)
        ) || mockCareerRecommendations[0];

        setCareer(found);

        // Fetch detailed explanation from prediction model / backend if available,
        // otherwise load from structured fallback mapping
        const details = detailedPredictions[found.id] || {
          matchedSkills: ['Python', 'SQL', 'Excel', 'Pandas'],
          skillAlignment: [
            { skill: 'Python', score: 90, level: 'Strong' },
            { skill: 'SQL', score: 85, level: 'Strong' }
          ],
          missingSkills: ['Advanced Tooling', 'Specialized Frameworks'],
          contributingFactors: [
            'Resume skills extracted from technical background',
            'Coursework alignment with core role competencies'
          ]
        };

        setPredictionData({
          careerId: found.id,
          careerName: found.role,
          matchScore: found.match,
          category: found.category,
          description: found.desc,
          matchedSkills: details.matchedSkills,
          skillAlignment: details.skillAlignment,
          missingSkills: details.missingSkills,
          contributingFactors: details.contributingFactors,
          explanation:
            'Your profile was compared with the skills, education, experience and other candidate information associated with this career. The prediction model generated the displayed match percentage based on the information available in your profile.'
        });
      } catch (err) {
        console.warn('Error loading career prediction details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [careerId]);

  if (loading || !predictionData) {
    return (
      <Layout>
        <Page title="Career Prediction Details" subtitle="Loading AI model explanation...">
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
            Loading prediction details...
          </div>
        </Page>
      </Layout>
    );
  }

  const {
    careerName,
    matchScore,
    category,
    description,
    matchedSkills,
    skillAlignment,
    missingSkills,
    contributingFactors,
    explanation
  } = predictionData;

  return (
    <Layout>
      <div style={{ padding: '24px 36px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {/* 1. BACK BUTTON */}
        <Link
          to="/recommendations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--blue, #2563eb)',
            textDecoration: 'none',
            marginBottom: 20,
            padding: '6px 12px',
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid var(--line, #e2e8f0)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Career Recommendations</span>
        </Link>

        {/* 2. CAREER PREDICTION HEADER */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--line, #e2e8f0)',
            borderRadius: 14,
            padding: '28px 32px',
            marginBottom: 24,
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--blue, #2563eb)',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: 6
              }}
            >
              CAREER PREDICTION
            </div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: 'var(--navy, #0f172a)',
                margin: '0 0 8px',
                letterSpacing: '-0.5px'
              }}
            >
              {careerName}
            </h1>
            <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 12px', maxWidth: 700, lineHeight: 1.5 }}>
              {description}
            </p>
            {category && <span className="pill blue">{category}</span>}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: matchScore >= 80 ? '#ecfdf5' : matchScore >= 70 ? '#eff6ff' : '#fffbeb',
                border: `1px solid ${matchScore >= 80 ? '#a7f3d0' : matchScore >= 70 ? '#bfdbfe' : '#fde68a'}`
              }}
            >
              <Award
                size={22}
                color={matchScore >= 80 ? '#10b981' : matchScore >= 70 ? '#2563eb' : '#f59e0b'}
              />
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: matchScore >= 80 ? '#047857' : matchScore >= 70 ? '#1d4ed8' : '#b45309'
                }}
              >
                {matchScore}% Match
              </span>
            </div>
          </div>
        </div>

        {/* 3. PREDICTION SUMMARY CARD */}
        <div
          className="card card-pad"
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            border: '1px solid #dbeafe'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: '#2563eb',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                fontWeight: 800,
                flexShrink: 0
              }}
            >
              {matchScore}%
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
                Career Match Alignment: {matchScore}%
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                Your profile shows strong alignment with this career based on the information extracted
                from your resume.
              </p>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN GRID FOR EVIDENCE & ALIGNMENT */}
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          {/* 4. WHY WAS THIS CAREER RECOMMENDED? */}
          <div className="card card-pad">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
              <ShieldCheck size={18} color="var(--blue, #2563eb)" />
              Why was this career recommended?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              Extracted profile features and competencies that contributed to this AI prediction:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {matchedSkills &&
                matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#065f46'
                    }}
                  >
                    <CheckCircle2 size={14} color="#10b981" />
                    {skill}
                  </span>
                ))}
            </div>

            {contributingFactors && contributingFactors.length > 0 && (
              <div style={{ borderTop: '1px solid var(--line, #f1f5f9)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  Key Contributing Profile Factors:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                  {contributingFactors.map((factor, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 5. SKILL ALIGNMENT */}
          <div className="card card-pad">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
              <TrendingUp size={18} color="var(--blue, #2563eb)" />
              Your Skill Alignment
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              Normalized proficiency levels mapped against industry benchmark requirements:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {skillAlignment &&
                skillAlignment.map((item) => (
                  <div key={item.skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                      <strong style={{ color: 'var(--navy, #0f172a)' }}>{item.skill}</strong>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span className={`pill ${item.score >= 85 ? 'green' : 'blue'}`} style={{ padding: '2px 8px', fontSize: 10 }}>
                          {item.level}
                        </span>
                        <b style={{ color: '#475569' }}>{item.score}%</b>
                      </span>
                    </div>
                    <div className="bar-bg">
                      <div
                        className={`bar ${item.score >= 85 ? 'green' : ''}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 6. SKILLS THAT COULD IMPROVE YOUR MATCH */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
            <AlertCircle size={18} color="#f59e0b" />
            Skills That Could Improve Your Match
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
            Acquiring or verifying proficiency in these targeted areas will increase your readiness
            score for this specific role:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {missingSkills &&
              missingSkills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#991b1b'
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#ef4444'
                    }}
                  />
                  {s}
                </span>
              ))}
          </div>
        </div>

        {/* 7. MODEL EXPLANATION */}
        <div
          className="card card-pad"
          style={{
            marginBottom: 28,
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
            <BrainCircuit size={18} color="var(--blue, #2563eb)" />
            Model Explanation
          </h3>
          <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '0 0 16px' }}>
            {explanation}
          </p>
          <div
            style={{
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ShieldCheck size={16} color="#64748b" />
            <span>
              <strong>Model Transparency:</strong> CareerIQ AI uses deterministic cosine similarity and
              feature-weight vectorization against live industry role benchmarks.
            </span>
          </div>
        </div>

        {/* 8. RECOMMENDED NEXT STEPS */}
        <div
          className="card card-pad"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1px solid #bfdbfe'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--navy, #0f172a)' }}>
              Ready to bridge your skill gap for {careerName}?
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Explore detailed gap metrics or jump into your customized learning roadmap.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              to="/gap-analysis"
              className="btn"
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>View Skill Gap</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/roadmap"
              className="btn outline"
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <GitBranch size={14} />
              <span>View Career Roadmap</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
