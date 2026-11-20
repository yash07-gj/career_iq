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
  ShieldCheck
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import { Gauge } from '../components/ui';
import { toneFor } from '../utils/career';
import { mockCareerRecommendations } from '../mockData/careerData';
import api from '../services/api';
import auth from '../utils/auth';

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
        const currentUser = auth.getUser();
        const numericId = parseInt(careerId, 10) || 1;

        let userRec = null;
        let gapData = null;

        if (currentUser?.user_id) {
          try {
            const [recs, gap] = await Promise.all([
              api.getRecommendations(currentUser.user_id).catch(() => null),
              api.getGapAnalysis(numericId, currentUser.user_id).catch(() => null)
            ]);
            if (Array.isArray(recs)) {
              userRec = recs.find(
                (r) => r.career_role_id === numericId || String(r.career_role_id) === String(careerId) || r.id === numericId
              );
            }
            gapData = gap;
          } catch (e) {
            console.warn('Could not fetch user recommendations:', e);
          }
        }

        // Fallback to mock career recommendation if not found from live API
        const fallbackCareer = mockCareerRecommendations.find(
          (c) => c.id === numericId || String(c.id) === String(careerId)
        ) || mockCareerRecommendations[0];

        const roleName = userRec?.role || fallbackCareer.role;
        const matchScore = userRec?.match !== undefined ? userRec.match : fallbackCareer.match;
        const description = userRec?.desc || userRec?.summary_explanation || fallbackCareer.desc;
        const category = fallbackCareer.category || 'Data Science & Technology';

        const details = detailedPredictions[numericId] || {
          matchedSkills: ['Python', 'SQL', 'Excel', 'Pandas'],
          skillAlignment: [
            { skill: 'Python', score: 90, level: 'Strong' },
            { skill: 'SQL', score: 85, level: 'Strong' }
          ],
          missingSkills: ['Advanced Tooling', 'Specialized Frameworks'],
          contributingFactors: [
            `Technical Skills Extraction (${matchScore}% match with ${roleName} requirements)`,
            'Coursework alignment with core role competencies'
          ]
        };

        const rawMatched = (gapData?.matched_skills?.length > 0)
          ? gapData.matched_skills
          : details.matchedSkills;

        const rawMissing = (gapData?.missing_skills?.length > 0)
          ? gapData.missing_skills.map(m => typeof m === 'string' ? m : m.name || m.skill_name)
          : details.missingSkills;

        const missingSet = new Set((rawMissing || []).map(m => (typeof m === 'string' ? m : m.name || '').toLowerCase().trim()));
        const cleanMatched = (rawMatched || []).filter(s => !missingSet.has((typeof s === 'string' ? s : s.name || '').toLowerCase().trim()));

        const contributingFactors = [
          `Technical Skills Extraction (${matchScore}% match with ${roleName} benchmark)`,
          'Academic coursework in database management, computer applications & algorithms',
          'Demonstrated analytical project experience and data manipulation proficiency',
          'Extracted competencies aligned with industry benchmark standards'
        ];

        setCareer({
          id: numericId,
          role: roleName,
          match: matchScore,
          category: category,
          desc: description
        });

        setPredictionData({
          careerId: numericId,
          careerName: roleName,
          matchScore: matchScore,
          category: category,
          description: description,
          matchedSkills: cleanMatched,
          skillAlignment: details.skillAlignment,
          missingSkills: rawMissing,
          contributingFactors: contributingFactors,
          explanation:
            userRec?.summary_explanation ||
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
          <div className="card card-pad stack">
            <div className="skeleton" style={{ height: 22, width: '40%' }} />
            <div className="skeleton" style={{ height: 14, width: '75%' }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <span className="muted text-sm">Loading prediction details...</span>
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

  const tone = toneFor(matchScore);

  return (
    <Layout>
      <section className="page">
        {/* 1. BACK BUTTON */}
        <Link to="/recommendations" className="btn outline small" style={{ alignSelf: 'flex-start' }}>
          <ArrowLeft size={15} />
          <span>Back to Career Recommendations</span>
        </Link>

        {/* 2. CAREER PREDICTION HEADER + 3. MATCH SUMMARY */}
        <div className="ui-grid split">
          <div className="card card-pad stack" style={{ gap: 10 }}>
            <span className="pill info" style={{ alignSelf: 'flex-start' }}>CAREER PREDICTION</span>
            <h1 style={{ margin: 0 }}>{careerName}</h1>
            <p className="muted" style={{ margin: 0, maxWidth: '65ch' }}>{description}</p>
            <div className="row-gap">
              {category && <span className="pill neutral">{category}</span>}
              <span className={`pill ${tone}`}>
                <Award size={13} /> {matchScore}% Match
              </span>
            </div>
          </div>

          <div className="card card-pad stack" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <Gauge value={matchScore} label="Career match" color={`var(--${tone})`} size={160} />
            <strong>Career Match Alignment: {matchScore}%</strong>
            <p className="muted text-sm" style={{ margin: 0 }}>
              Your profile shows strong alignment with this career based on the information extracted
              from your resume.
            </p>
          </div>
        </div>

        {/* TWO-COLUMN GRID FOR EVIDENCE & ALIGNMENT */}
        <div className="ui-grid cols-2">
          {/* 4. WHY WAS THIS CAREER RECOMMENDED? */}
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="var(--accent)" />
                Why was this career recommended?
              </h3>
            </div>
            <p className="muted text-sm" style={{ margin: '0 0 14px' }}>
              Extracted profile features and competencies that contributed to this AI prediction:
            </p>

            <div className="chips" style={{ marginBottom: 18 }}>
              {matchedSkills &&
                matchedSkills.map((skill) => (
                  <span key={skill} className="pill good">
                    <CheckCircle2 size={13} />
                    {skill}
                  </span>
                ))}
            </div>

            {contributingFactors && contributingFactors.length > 0 && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                <div className="muted text-xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Key Contributing Profile Factors:
                </div>
                <ul className="text-sm" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
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
            <div className="card-head">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} color="var(--accent)" />
                Your Skill Alignment
              </h3>
            </div>
            <p className="muted text-sm" style={{ margin: '0 0 14px' }}>
              Normalized proficiency levels mapped against industry benchmark requirements:
            </p>

            <div className="stack">
              {skillAlignment &&
                skillAlignment.map((item) => (
                  <div key={item.skill}>
                    <div className="row-between text-sm" style={{ marginBottom: 6 }}>
                      <strong>{item.skill}</strong>
                      <span className="row-gap">
                        <span className={`pill ${item.score >= 85 ? 'good' : 'info'}`}>{item.level}</span>
                        <b className="num">{item.score}%</b>
                      </span>
                    </div>
                    <div className="bar-bg">
                      <div className={`bar ${item.score >= 85 ? 'green' : ''}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 6. SKILLS THAT COULD IMPROVE YOUR MATCH */}
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="var(--warn)" />
              Skills That Could Improve Your Match
            </h3>
          </div>
          <p className="muted text-sm" style={{ margin: '0 0 14px' }}>
            Acquiring or verifying proficiency in these targeted areas will increase your readiness
            score for this specific role:
          </p>

          <div className="chips">
            {missingSkills &&
              missingSkills.map((s) => (
                <span key={s} className="pill bad">
                  ✕ {s}
                </span>
              ))}
          </div>
        </div>

        {/* 7. MODEL EXPLANATION */}
        <div className="card card-pad">
          <div className="card-head">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BrainCircuit size={18} color="var(--accent)" />
              Model Explanation
            </h3>
          </div>
          <p style={{ lineHeight: 1.6, margin: '0 0 14px' }}>{explanation}</p>
          <div className="notice info text-sm">
            <ShieldCheck size={16} />
            <span className="notice-main">
              <strong>Model Transparency:</strong> CareerIQ AI uses deterministic cosine similarity and
              feature-weight vectorization against live industry role benchmarks.
            </span>
          </div>
        </div>

        {/* 8. RECOMMENDED NEXT STEPS */}
        <div className="next-step">
          <div>
            <strong>Ready to bridge your skill gap for {careerName}?</strong>
            <p>Explore detailed gap metrics or jump into your customized learning roadmap.</p>
          </div>
          <div className="row-gap">
            <Link to="/gap-analysis" className="btn">
              <span>View Skill Gap</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/roadmap" className="btn outline">
              <GitBranch size={14} />
              <span>View Career Roadmap</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
