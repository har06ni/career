import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, studentProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function buildStudentProfile(user: typeof usersTable.$inferSelect, profile: typeof studentProfilesTable.$inferSelect) {
  const skills = JSON.parse(profile.skills ?? "[]");
  const projects = JSON.parse(profile.projects ?? "[]");
  const certifications = JSON.parse(profile.certifications ?? "[]");
  const experience = JSON.parse(profile.experience ?? "[]");

  const total = 4 + (projects?.length > 0 ? 1 : 0) + (skills?.length > 0 ? 1 : 0) + (certifications?.length > 0 ? 1 : 0);
  let completed = 0;
  if (user.name) completed++;
  if (user.email) completed++;
  if (profile.college) completed++;
  if (profile.bio) completed++;
  if (skills?.length > 0) completed++;
  if (projects?.length > 0) completed++;
  if (certifications?.length > 0) completed++;
  const profileCompletion = Math.round((completed / Math.max(total, 7)) * 100);

  return {
    id: profile.id,
    userId: profile.userId,
    name: user.name,
    email: user.email,
    college: profile.college,
    degree: profile.degree,
    graduationYear: profile.graduationYear,
    skills,
    bio: profile.bio,
    avatarUrl: user.avatarUrl,
    resumeUrl: profile.resumeUrl,
    projects,
    certifications,
    experience,
    profileCompletion,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
  };
}

// GET /students/profile (current)
router.get("/students/profile", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!user || !profile) { res.status(404).json({ error: "Profile not found" }); return; }
  res.json(buildStudentProfile(user, profile));
});

// PUT /students/profile
router.put("/students/profile", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const { college, degree, graduationYear, skills, bio, avatarUrl, resumeUrl, certifications, linkedinUrl, githubUrl } = req.body;
  const updateData: Partial<typeof studentProfilesTable.$inferInsert> = {};
  if (college !== undefined) updateData.college = college;
  if (degree !== undefined) updateData.degree = degree;
  if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
  if (skills !== undefined) updateData.skills = JSON.stringify(skills);
  if (bio !== undefined) updateData.bio = bio;
  if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
  if (certifications !== undefined) updateData.certifications = JSON.stringify(certifications);
  if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) updateData.githubUrl = githubUrl;

  if (avatarUrl !== undefined) {
    await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, req.userId!));
  }

  const [profile] = await db.update(studentProfilesTable).set(updateData).where(eq(studentProfilesTable.userId, req.userId!)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  res.json(buildStudentProfile(user, profile));
});

// GET /students/:studentId
router.get("/students/:studentId", requireAuth, async (req, res) => {
  const studentId = parseInt(req.params.studentId as string);
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.id, studentId)).limit(1);
  if (!profile) { res.status(404).json({ error: "Not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(buildStudentProfile(user, profile));
});

// GET /students (list for companies)
router.get("/students", requireAuth, async (req: AuthenticatedRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const profiles = await db.select().from(studentProfilesTable).limit(limit).offset(offset);
  const results = await Promise.all(profiles.map(async (profile) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);
    return user ? buildStudentProfile(user, profile) : null;
  }));
  res.json(results.filter(Boolean));
});

export default router;
