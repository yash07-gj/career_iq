export const mockUserProfile = {
  name: "John Doe",
  email: "john@example.com",
  education: "MCA - Computer Application",
  experience: "6 Months Internship",
  currentSkills: ["Python", "SQL", "Pandas", "Excel", "Communication"],
  targetRole: "Data Scientist"
};

export const mockCareerRecommendations = [
  { id: 1, role: "Data Analyst", match: 89, category: "Data Science & Technology", desc: "Analyze data to help organizations make better decisions." },
  { id: 2, role: "Business Analyst", match: 82, category: "Business & Technology", desc: "Bridge the gap between business and technology." },
  { id: 3, role: "BI Analyst", match: 79, category: "Business Intelligence", desc: "Work with business intelligence tools and dashboards." },
  { id: 4, role: "Data Scientist", match: 65, category: "Advanced Analytics", desc: "Build predictive models and work with large datasets." },
  { id: 5, role: "Software Developer", match: 60, category: "Software Engineering", desc: "Design and develop software applications." }
];

export const mockJobs = [
  {
    id: 1,
    title: 'Data Analyst',
    company: 'ABC Technologies',
    location: 'Ahmedabad, India',
    type: 'Full-time / Internship',
    experience: '0 - 1 Year',
    salary: '₹4.5 - ₹6.5 LPA',
    match: 89,
    skills: ['Python', 'SQL', 'Excel', 'Power BI'],
    description: 'We are seeking an enthusiastic Data Analyst to interpret data and turn it into actionable information that can improve our business operations.',
    responsibilities: [
      'Extract, clean, and analyze complex datasets using SQL and Python.',
      'Build interactive dashboards and visualizations in Power BI / Excel.',
      'Collaborate with business teams to identify operational insights and KPIs.',
      'Prepare comprehensive reporting summaries for management.'
    ],
    matchedSkills: ['Python', 'SQL', 'Excel', 'Pandas'],
    missingSkills: ['Power BI', 'ETL Pipelines', 'Cloud Warehousing'],
    educationMatch: "MCA / B.Tech in Computer Science or related quantitative field (Matched)",
    experienceMatch: "0-1 year or internship in analytics (Matched)",
    breakdown: [
      { label: 'Technical Skills Overlap', score: 92 },
      { label: 'Educational Background Match', score: 95 },
      { label: 'Domain & Industry Fit', score: 85 },
      { label: 'Experience Level Fit', score: 84 }
    ]
  },
  {
    id: 2,
    title: 'Business Intelligence Analyst',
    company: 'XYZ Solutions',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '0 - 2 Years',
    salary: '₹6.0 - ₹8.5 LPA',
    match: 82,
    skills: ['SQL', 'Tableau', 'Power BI'],
    description: 'Looking for a BI Analyst to develop, maintain, and manage business intelligence solutions and enterprise dashboards.',
    responsibilities: [
      'Design, build, and deploy BI solutions and visual dashboards.',
      'Maintain and query data analytics platforms with advanced SQL.',
      'Synthesize metrics into actionable executive reports.',
      'Conduct unit testing and troubleshooting on reporting pipelines.'
    ],
    matchedSkills: ['SQL', 'Excel', 'Data Modeling', 'Communication'],
    missingSkills: ['Tableau', 'Power BI', 'DAX', 'Data Warehousing'],
    educationMatch: "Degree in Computer Science, IT, or related quantitative area (Matched)",
    experienceMatch: "Entry level with strong database query knowledge (Matched)",
    breakdown: [
      { label: 'Technical Skills Overlap', score: 84 },
      { label: 'Educational Background Match', score: 90 },
      { label: 'Domain & Industry Fit', score: 80 },
      { label: 'Experience Level Fit', score: 75 }
    ]
  },
  {
    id: 3,
    title: 'Junior Data Analyst',
    company: 'TechCorp',
    location: 'Mumbai, India',
    type: 'Full-time',
    experience: '0 - 1 Year',
    salary: '₹4.0 - ₹5.5 LPA',
    match: 78,
    skills: ['Excel', 'SQL', 'Data Visualization'],
    description: 'Join our data consulting practice assisting clients in structured dataset hygiene, analysis, and report distribution.',
    responsibilities: [
      'Maintain dataset integrity and validation procedures.',
      'Formulate standard analytical reports in spreadsheet software and SQL.',
      'Support senior consultants on ad-hoc client query requests.'
    ],
    matchedSkills: ['Excel', 'SQL', 'Data Cleaning'],
    missingSkills: ['Tableau', 'Statistical Modeling'],
    educationMatch: "Bachelor's / Master's degree in IT / Computer Applications (Matched)",
    experienceMatch: "Entry-level candidate welcome (Matched)",
    breakdown: [
      { label: 'Technical Skills Overlap', score: 80 },
      { label: 'Educational Background Match', score: 92 },
      { label: 'Domain & Industry Fit', score: 76 },
      { label: 'Experience Level Fit', score: 70 }
    ]
  },
  {
    id: 4,
    title: 'Data Analyst Intern',
    company: 'StartUpHub',
    location: 'Pune, India',
    type: 'Internship',
    experience: 'Fresher / Student',
    salary: '₹15,000 - ₹25,000 / month',
    match: 72,
    skills: ['Python', 'Excel'],
    description: 'Exciting internship opportunity for students and freshers to gain real-world exposure to production data analysis pipelines.',
    responsibilities: [
      'Assist the growth team in scraping, collecting, and cleaning user interaction data.',
      'Automate repetitive reporting tasks using Python scripts.',
      'Create monthly performance summary spreadsheets.'
    ],
    matchedSkills: ['Python', 'Excel', 'Pandas'],
    missingSkills: ['Git Workflow', 'Automated Web Scraping'],
    educationMatch: "Enrolled in or graduated from MCA / BCA / B.Tech (Matched)",
    experienceMatch: "No prior full-time experience required (Matched)",
    breakdown: [
      { label: 'Technical Skills Overlap', score: 75 },
      { label: 'Educational Background Match', score: 95 },
      { label: 'Domain & Industry Fit', score: 68 },
      { label: 'Experience Level Fit', score: 88 }
    ]
  }
];

export const mockSkillGaps = {
  matched: ["Python", "SQL", "Pandas", "Excel", "Communication"],
  missing: [
    { name: "Statistics", priority: "High" },
    { name: "Machine Learning", priority: "High" },
    { name: "Scikit-learn", priority: "Medium" },
    { name: "Deep Learning", priority: "Medium" },
    { name: "Data Visualization", priority: "Low" }
  ]
};

export const mockRoadmapSteps = [
  { id: 1, title: "Strengthen Basics (Python, SQL)", duration: "1-2 months", desc: "Complete basic to intermediate syntax tracks." },
  { id: 2, title: "Learn Statistics", duration: "2-3 months", desc: "Understand core statistical and mathematical concepts." },
  { id: 3, title: "Learn Machine Learning", duration: "3-4 months", desc: "Start with ML algorithms, theory, and building baseline models." },
  { id: 4, title: "Learn Scikit-learn", duration: "1-2 months", desc: "Hands-on model building with real-world public datasets." },
  { id: 5, title: "Build Projects", duration: "2-3 months", desc: "Work on end-to-end real-world ML projects for your portfolio." }
];

export const mockMarketSkills = [
  { name: "Python", demand: 95 },
  { name: "SQL", demand: 88 },
  { name: "Power BI", demand: 78 },
  { name: "Machine Learning", demand: 75 },
  { name: "AWS", demand: 62 },
  { name: "Tableau", demand: 55 },
  { name: "Excel", demand: 50 },
  { name: "Data Visualization", demand: 50 }
];
