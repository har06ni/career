import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  studentProfilesTable,
  companyProfilesTable,
  mentorProfilesTable,
  jobsTable,
  applicationsTable,
  sessionsTable,
  courseEnrollmentsTable,
} from "@workspace/db";
import { eq, sql, and, gt } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// GET /dashboard/student
router.get("/dashboard/student", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const skills: string[] = JSON.parse(profile.skills ?? "[]");
  const projects = JSON.parse(profile.projects ?? "[]");
  const certifications: string[] = JSON.parse(profile.certifications ?? "[]");
  const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, profile.id));
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.studentId, profile.id));
  const enrollments = await db.select().from(courseEnrollmentsTable).where(eq(courseEnrollmentsTable.studentId, profile.id));

  let score = 10;
  score += Math.min(skills.length * 5, 30);
  score += Math.min(projects.length * 8, 24);
  score += profile.bio ? 8 : 0;
  score += Math.min(certifications.length * 4, 12);
  score += Math.min(applications.length * 2, 10);
  score += Math.min(sessions.length * 3, 6);
  score = Math.min(score, 100);

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

  const recentJobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, true)).limit(4);
  const recentMentorProfiles = await db.select().from(mentorProfilesTable).limit(3);
  const upcomingSessions = await db.select().from(sessionsTable)
    .where(and(eq(sessionsTable.studentId, profile.id), gt(sessionsTable.scheduledAt, new Date())))
    .limit(3);

  const recentJobsData = await Promise.all(recentJobs.map(async (job) => {
    const [company] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.id, job.companyId)).limit(1);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
    return {
      id: job.id, companyId: job.companyId,
      companyName: company?.companyName ?? null,
      companyLogoUrl: company?.logoUrl ?? null,
      title: job.title, description: job.description,
      skills: JSON.parse(job.skills ?? "[]"),
      salary: job.salary, location: job.location,
      experienceLevel: job.experienceLevel,
      jobType: job.jobType, isRemote: job.isRemote, isActive: job.isActive,
      applicantCount: Number(count), createdAt: job.createdAt.toISOString(),
    };
  }));

  const recentMentors = await Promise.all(recentMentorProfiles.map(async (mp) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, mp.userId)).limit(1);
    return {
      id: mp.id, userId: mp.userId,
      name: user?.name ?? "", email: user?.email ?? "",
      company: mp.company, title: mp.title, experience: mp.experience,
      skills: JSON.parse(mp.skills ?? "[]"), bio: mp.bio,
      avatarUrl: user?.avatarUrl ?? null,
      rating: mp.rating ? parseFloat(mp.rating) : null,
      sessionsCompleted: mp.sessionsCompleted,
      pricePerSession: mp.pricePerSession ? parseFloat(mp.pricePerSession) : null,
      availability: JSON.parse(mp.availability ?? "[]"),
    };
  }));

  const upcomingSessionsData = await Promise.all(upcomingSessions.map(async (s) => {
    const [mentorProfile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.id, s.mentorId)).limit(1);
    const [mentorUser] = mentorProfile ? await db.select().from(usersTable).where(eq(usersTable.id, mentorProfile.userId)).limit(1) : [null];
    return {
      id: s.id, studentId: s.studentId, mentorId: s.mentorId,
      studentName: null, mentorName: mentorUser?.name ?? null, mentorAvatarUrl: mentorUser?.avatarUrl ?? null,
      scheduledAt: s.scheduledAt.toISOString(), duration: s.duration, topic: s.topic,
      status: s.status, price: s.price ? parseFloat(s.price) : null,
      meetingUrl: s.meetingUrl, createdAt: s.createdAt.toISOString(),
    };
  }));

  const recentApplicationsData = await Promise.all(applications.slice(0, 3).map(async (app) => {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
    const [company] = job ? await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.id, job.companyId)).limit(1) : [null];
    return {
      id: app.id, jobId: app.jobId, studentId: app.studentId,
      jobTitle: job?.title ?? null, companyName: company?.companyName ?? null,
      studentName: null, studentEmail: null, studentAvatarUrl: null,
      status: app.status, coverLetter: app.coverLetter, createdAt: app.createdAt.toISOString(),
    };
  }));

  res.json({
    careerScore: score,
    profileCompletion,
    applicationsCount: applications.length,
    sessionsCount: sessions.length,
    enrollmentsCount: enrollments.length,
    recentJobs: recentJobsData,
    recentMentors,
    upcomingSessions: upcomingSessionsData,
    recentApplications: recentApplicationsData,
  });
});

// GET /dashboard/company
router.get("/dashboard/company", requireAuth, requireRole("company"), async (req: AuthenticatedRequest, res) => {
  const [company] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.userId, req.userId!)).limit(1);
  if (!company) { res.status(404).json({ error: "Company profile not found" }); return; }

  const companyJobs = await db.select().from(jobsTable).where(eq(jobsTable.companyId, company.id));
  const activeJobsCount = companyJobs.filter(j => j.isActive).length;

  const allApplications = await Promise.all(companyJobs.map(j =>
    db.select().from(applicationsTable).where(eq(applicationsTable.jobId, j.id))
  ));
  const flatApplications = allApplications.flat();

  const totalApplicationsCount = flatApplications.length;
  const shortlistedCount = flatApplications.filter(a => a.status === "shortlisted").length;
  const hiredCount = flatApplications.filter(a => a.status === "hired").length;

  const recentApplicationsData = await Promise.all(flatApplications.slice(0, 5).map(async (app) => {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
    const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.id, app.studentId)).limit(1);
    const [studentUser] = studentProfile ? await db.select().from(usersTable).where(eq(usersTable.id, studentProfile.userId)).limit(1) : [null];
    return {
      id: app.id, jobId: app.jobId, studentId: app.studentId,
      jobTitle: job?.title ?? null, companyName: company.companyName,
      studentName: studentUser?.name ?? null, studentEmail: studentUser?.email ?? null,
      studentAvatarUrl: studentUser?.avatarUrl ?? null,
      status: app.status, coverLetter: app.coverLetter, createdAt: app.createdAt.toISOString(),
    };
  }));

  const recentJobsData = await Promise.all(companyJobs.slice(0, 5).map(async (job) => {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
    return {
      id: job.id, companyId: job.companyId, companyName: company.companyName, companyLogoUrl: company.logoUrl,
      title: job.title, description: job.description, skills: JSON.parse(job.skills ?? "[]"),
      salary: job.salary, location: job.location, experienceLevel: job.experienceLevel,
      jobType: job.jobType, isRemote: job.isRemote, isActive: job.isActive,
      applicantCount: Number(count), createdAt: job.createdAt.toISOString(),
    };
  }));

  res.json({
    activeJobsCount,
    totalApplicationsCount,
    shortlistedCount,
    hiredCount,
    recentApplications: recentApplicationsData,
    recentJobs: recentJobsData,
  });
});

// GET /dashboard/mentor
router.get("/dashboard/mentor", requireAuth, requireRole("mentor"), async (req: AuthenticatedRequest, res) => {
  const [mentorProfile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.userId, req.userId!)).limit(1);
  if (!mentorProfile) { res.status(404).json({ error: "Mentor profile not found" }); return; }

  const allSessions = await db.select().from(sessionsTable).where(eq(sessionsTable.mentorId, mentorProfile.id));
  const upcomingSessions = allSessions.filter(s => s.status === "confirmed" || s.status === "pending");
  const completedSessions = allSessions.filter(s => s.status === "completed");

  let totalEarnings = 0;
  for (const s of completedSessions) {
    if (s.price) totalEarnings += parseFloat(s.price);
  }

  const recentSessionsData = await Promise.all(allSessions.slice(0, 5).map(async (s) => {
    const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.id, s.studentId)).limit(1);
    const [studentUser] = studentProfile ? await db.select().from(usersTable).where(eq(usersTable.id, studentProfile.userId)).limit(1) : [null];
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, mentorProfile.userId)).limit(1);
    return {
      id: s.id, studentId: s.studentId, mentorId: s.mentorId,
      studentName: studentUser?.name ?? null, mentorName: user?.name ?? null, mentorAvatarUrl: user?.avatarUrl ?? null,
      scheduledAt: s.scheduledAt.toISOString(), duration: s.duration, topic: s.topic,
      status: s.status, price: s.price ? parseFloat(s.price) : null,
      meetingUrl: s.meetingUrl, createdAt: s.createdAt.toISOString(),
    };
  }));

  res.json({
    totalSessions: allSessions.length,
    upcomingSessions: upcomingSessions.length,
    completedSessions: completedSessions.length,
    rating: mentorProfile.rating ? parseFloat(mentorProfile.rating) : null,
    totalEarnings,
    recentSessions: recentSessionsData,
  });
});

export default router;
