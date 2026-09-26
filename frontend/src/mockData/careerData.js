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
