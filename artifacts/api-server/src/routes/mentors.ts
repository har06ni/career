import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, mentorProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function buildMentorProfile(user: typeof usersTable.$inferSelect, profile: typeof mentorProfilesTable.$inferSelect) {
  return {
    id: profile.id,
    userId: profile.userId,
    name: user.name,
    email: user.email,
    company: profile.company,
    title: profile.title,
    experience: profile.experience,
    skills: JSON.parse(profile.skills ?? "[]"),
    bio: profile.bio,
    avatarUrl: user.avatarUrl,
    rating: profile.rating ? parseFloat(profile.rating) : null,
    sessionsCompleted: profile.sessionsCompleted,
    pricePerSession: profile.pricePerSession ? parseFloat(profile.pricePerSession) : null,
    availability: JSON.parse(profile.availability ?? "[]"),
  };
}

// GET /mentors
router.get("/mentors", requireAuth, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const profiles = await db.select().from(mentorProfilesTable).limit(limit).offset(offset);
  const results = await Promise.all(profiles.map(async (profile) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);
    return user ? buildMentorProfile(user, profile) : null;
  }));
  res.json(results.filter(Boolean));
});

// GET /mentors/profile
router.get("/mentors/profile", requireAuth, requireRole("mentor"), async (req: AuthenticatedRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  const [profile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.userId, req.userId!)).limit(1);
  if (!user || !profile) { res.status(404).json({ error: "Profile not found" }); return; }
  res.json(buildMentorProfile(user, profile));
});

// PUT /mentors/profile
router.put("/mentors/profile", requireAuth, requireRole("mentor"), async (req: AuthenticatedRequest, res) => {
  const { company, title, experience, skills, bio, avatarUrl, pricePerSession, availability } = req.body;
  const updateData: Partial<typeof mentorProfilesTable.$inferInsert> = {};
  if (company !== undefined) updateData.company = company;
  if (title !== undefined) updateData.title = title;
  if (experience !== undefined) updateData.experience = experience;
  if (skills !== undefined) updateData.skills = JSON.stringify(skills);
  if (bio !== undefined) updateData.bio = bio;
  if (pricePerSession !== undefined) updateData.pricePerSession = String(pricePerSession);
  if (availability !== undefined) updateData.availability = JSON.stringify(availability);

  if (avatarUrl !== undefined) {
    await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, req.userId!));
  }

  const [profile] = await db.update(mentorProfilesTable).set(updateData).where(eq(mentorProfilesTable.userId, req.userId!)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  res.json(buildMentorProfile(user, profile));
});

// GET /mentors/:mentorId
router.get("/mentors/:mentorId", requireAuth, async (req, res) => {
  const mentorId = parseInt(req.params.mentorId as string);
  const [profile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.id, mentorId)).limit(1);
  if (!profile) { res.status(404).json({ error: "Not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(buildMentorProfile(user, profile));
});

export default router;
