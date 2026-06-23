import { Router } from "express";
import { db } from "@workspace/db";
import {
  studentProfilesTable,
  jobsTable,
  applicationsTable,
  sessionsTable,
  courseEnrollmentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function computeCareerScore(
  skills: string[],
  projects: unknown[],
  bio: string | null,
  applicationsCount: number,
  sessionsCount: number,
  certifications: string[]
): number {
  let score = 10;
  score += Math.min(skills.length * 5, 30);
  score += Math.min(projects.length * 8, 24);
  score += bio ? 8 : 0;
  score += Math.min(certifications.length * 4, 12);
  score += Math.min(applicationsCount * 2, 10);
  score += Math.min(sessionsCount * 3, 6);
  return Math.min(score, 100);
}

// GET /ai/career-score
router.get("/ai/career-score", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const skills = JSON.parse(profile.skills ?? "[]");
  const projects = JSON.parse(profile.projects ?? "[]");
  const certifications = JSON.parse(profile.certifications ?? "[]");
  const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, profile.id));
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.studentId, profile.id));

  const score = computeCareerScore(skills, projects, profile.bio, applications.length, sessions.length, certifications);

  let level = "Beginner";
  if (score >= 80) level = "Expert";
  else if (score >= 60) level = "Advanced";
  else if (score >= 40) level = "Intermediate";

  const total = 7;
  let completed = 0;
  if (profile.college) completed++;
  if (profile.bio) completed++;
  if (skills.length > 0) completed++;
  if (projects.length > 0) completed++;
  if (certifications.length > 0) completed++;
  if (profile.resumeUrl) completed++;
  if (profile.linkedinUrl) completed++;
  const profileCompletion = Math.round((completed / total) * 100);

  const insights: string[] = [];
  if (skills.length < 3) insights.push("Add more skills to improve your career score");
  if (projects.length === 0) insights.push("Add projects to showcase your work");
  if (!profile.bio) insights.push("Complete your bio to attract recruiters");
  if (applications.length === 0) insights.push("Start applying to jobs to gain experience");
  if (sessions.length === 0) insights.push("Book a mentor session to accelerate growth");
  if (insights.length === 0) insights.push("Great profile! Keep building your skills");

  res.json({
    score,
    level,
    profileCompletion,
    skillsCount: skills.length,
    projectsCount: projects.length,
    applicationsCount: applications.length,
    sessionsCount: sessions.length,
    insights,
  });
});

// GET /ai/recommendations
router.get("/ai/recommendations", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const skills: string[] = JSON.parse(profile.skills ?? "[]");

  const allPaths = [
    {
      title: "Software Engineer",
      description: "Build and maintain software systems across web, mobile, and backend",
      requiredSkills: ["JavaScript", "TypeScript", "React", "Node.js", "Git"],
      averageSalary: "$90,000 - $150,000",
      growthRate: "25% (much faster than average)",
    },
    {
      title: "Data Scientist",
      description: "Analyze data to generate insights and build predictive models",
      requiredSkills: ["Python", "Machine Learning", "SQL", "Statistics", "TensorFlow"],
      averageSalary: "$100,000 - $160,000",
      growthRate: "36% (much faster than average)",
    },
    {
      title: "Product Manager",
      description: "Lead product strategy, roadmap, and cross-functional execution",
      requiredSkills: ["Product Strategy", "Agile", "User Research", "Analytics", "Communication"],
      averageSalary: "$95,000 - $170,000",
      growthRate: "19% (faster than average)",
    },
    {
      title: "UX Designer",
      description: "Design intuitive and engaging user experiences for digital products",
      requiredSkills: ["Figma", "User Research", "Prototyping", "Design Systems", "CSS"],
      averageSalary: "$75,000 - $130,000",
      growthRate: "16% (faster than average)",
    },
    {
      title: "DevOps Engineer",
      description: "Build and maintain CI/CD pipelines and cloud infrastructure",
      requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
      averageSalary: "$100,000 - $155,000",
      growthRate: "21% (faster than average)",
    },
  ];

  const skillsLower = skills.map(s => s.toLowerCase());
  const careerPaths = allPaths.map(path => {
    const matched = path.requiredSkills.filter(s => skillsLower.some(us => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us)));
    const match = Math.round((matched.length / path.requiredSkills.length) * 100);
    return { ...path, match };
  }).sort((a, b) => b.match - a.match);

  const learningPlan = [
    { title: "Build a portfolio project", description: "Create a real-world project to demonstrate your skills", priority: "high" as const, estimatedTime: "2-4 weeks" },
    { title: "Contribute to open source", description: "Find a project on GitHub and make meaningful contributions", priority: "medium" as const, estimatedTime: "Ongoing" },
    { title: "Complete an online certification", description: "Earn a recognized certification in your target field", priority: "high" as const, estimatedTime: "4-8 weeks" },
    { title: "Network with professionals", description: "Connect with people in your target role on LinkedIn", priority: "medium" as const, estimatedTime: "1-2 hours/week" },
    { title: "Practice technical interviews", description: "Solve LeetCode problems and mock interviews", priority: "high" as const, estimatedTime: "30 min/day" },
  ];

  res.json({
    careerPaths: careerPaths.slice(0, 3),
    learningPlan,
    recommendedRoles: careerPaths.slice(0, 3).map(p => p.title),
  });
});

// GET /ai/skill-gap
router.get("/ai/skill-gap", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const skills: string[] = JSON.parse(profile.skills ?? "[]");

  const currentSkills = skills.map(name => ({
    name,
    level: "intermediate",
    importance: "high",
  }));

  const allInDemandSkills = ["TypeScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Git", "System Design", "Machine Learning"];
  const missingSkills = allInDemandSkills
    .filter(s => !skills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
    .slice(0, 5)
    .map(name => ({ name, level: null, importance: "high" }));

  const strengthAreas = skills.length > 0 ? ["Technical Implementation", "Problem Solving"] : [];
  const improvementAreas = ["Cloud Infrastructure", "System Design", "Leadership & Communication"];

  res.json({ currentSkills, missingSkills, strengthAreas, improvementAreas });
});

// GET /ai/job-matches
router.get("/ai/job-matches", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const skills: string[] = JSON.parse(profile.skills ?? "[]");
  const skillsLower = skills.map(s => s.toLowerCase());

  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, true)).limit(10);

  const matches = jobs.map(job => {
    const jobSkills: string[] = JSON.parse(job.skills ?? "[]");
    const matched = jobSkills.filter(s => skillsLower.some(us => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us)));
    const matchScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 50;
    const matchReasons = matched.length > 0
      ? [`Your ${matched.slice(0, 2).join(" and ")} skills match this role`]
      : ["This role aligns with your career goals"];

    return {
      job: {
        id: job.id,
        companyId: job.companyId,
        companyName: null,
        companyLogoUrl: null,
        title: job.title,
        description: job.description,
        skills: jobSkills,
        salary: job.salary,
        location: job.location,
        experienceLevel: job.experienceLevel,
        jobType: job.jobType,
        isRemote: job.isRemote,
        isActive: job.isActive,
        applicantCount: 0,
        createdAt: job.createdAt.toISOString(),
      },
      matchScore,
      matchReasons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  res.json(matches.slice(0, 5));
});

// POST /ai/analyze-resume
router.post("/ai/analyze-resume", requireAuth, async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) { res.status(400).json({ error: "Resume text required" }); return; }

  const lowerText = resumeText.toLowerCase();
  const skillKeywords = ["javascript", "typescript", "python", "react", "node", "sql", "aws", "docker", "git", "java", "css", "html", "machine learning", "figma", "agile"];
  const skills = skillKeywords.filter(k => lowerText.includes(k)).map(k => k.charAt(0).toUpperCase() + k.slice(1));

  const strengths = [];
  const weaknesses = [];
  if (resumeText.length > 500) strengths.push("Detailed and comprehensive resume");
  else weaknesses.push("Resume is too brief — add more detail");
  if (skills.length >= 3) strengths.push(`Strong technical skill set: ${skills.slice(0, 3).join(", ")}`);
  else weaknesses.push("Add more technical skills");
  if (lowerText.includes("project")) strengths.push("Includes project experience");
  else weaknesses.push("No projects mentioned — add a projects section");
  if (lowerText.includes("experience") || lowerText.includes("work")) strengths.push("Work experience included");

  const allInDemand = ["TypeScript", "AWS", "Docker", "System Design", "Kubernetes"];
  const missingSkills = allInDemand.filter(s => !lowerText.includes(s.toLowerCase()));

  const suitableRoles = skills.includes("React") || skills.includes("Javascript")
    ? ["Frontend Developer", "Full Stack Developer", "UI Engineer"]
    : skills.includes("Python") || skills.includes("Machine learning")
    ? ["Data Scientist", "ML Engineer", "Backend Developer"]
    : ["Software Engineer", "Technical Program Manager", "Product Manager"];

  const overallScore = Math.min(30 + skills.length * 5 + strengths.length * 5, 95);

  res.json({
    skills,
    strengths,
    weaknesses,
    missingSkills,
    suitableRoles,
    overallScore,
    summary: `Your resume demonstrates ${strengths.length > 0 ? "solid" : "developing"} technical foundations with ${skills.length} identified skills. ${weaknesses.length > 0 ? "Focus on: " + weaknesses[0] : "Keep building on your strengths."}`,
  });
});

export default router;
