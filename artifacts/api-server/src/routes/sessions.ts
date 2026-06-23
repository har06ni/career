import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, usersTable, studentProfilesTable, mentorProfilesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

async function buildSession(session: typeof sessionsTable.$inferSelect) {
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.id, session.studentId)).limit(1);
  const [studentUser] = studentProfile ? await db.select().from(usersTable).where(eq(usersTable.id, studentProfile.userId)).limit(1) : [null];
  const [mentorProfile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.id, session.mentorId)).limit(1);
  const [mentorUser] = mentorProfile ? await db.select().from(usersTable).where(eq(usersTable.id, mentorProfile.userId)).limit(1) : [null];

  return {
    id: session.id,
    studentId: session.studentId,
    mentorId: session.mentorId,
    studentName: studentUser?.name ?? null,
    mentorName: mentorUser?.name ?? null,
    mentorAvatarUrl: mentorUser?.avatarUrl ?? null,
    scheduledAt: session.scheduledAt.toISOString(),
    duration: session.duration,
    topic: session.topic,
    status: session.status,
    price: session.price ? parseFloat(session.price) : null,
    meetingUrl: session.meetingUrl,
    createdAt: session.createdAt.toISOString(),
  };
}

// POST /sessions
router.post("/sessions", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { mentorId, scheduledAt, duration, topic } = req.body;

  const [mentorProfile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.id, mentorId)).limit(1);
  if (!mentorProfile) { res.status(404).json({ error: "Mentor not found" }); return; }

  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!studentProfile) { res.status(404).json({ error: "Student profile not found" }); return; }

  const [session] = await db.insert(sessionsTable).values({
    studentId: studentProfile.id,
    mentorId,
    scheduledAt: new Date(scheduledAt),
    duration: duration ?? 60,
    topic: topic ?? null,
    status: "pending",
    price: mentorProfile.pricePerSession,
  }).returning();

  res.status(201).json(await buildSession(session));
});

// GET /sessions/my
router.get("/sessions/my", requireAuth, async (req: AuthenticatedRequest, res) => {
  let sessions: (typeof sessionsTable.$inferSelect)[] = [];

  if (req.userRole === "student") {
    const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
    if (studentProfile) {
      sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.studentId, studentProfile.id));
    }
  } else if (req.userRole === "mentor") {
    const [mentorProfile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.userId, req.userId!)).limit(1);
    if (mentorProfile) {
      sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.mentorId, mentorProfile.id));
    }
  }

  const results = await Promise.all(sessions.map(buildSession));
  res.json(results);
});

// PATCH /sessions/:sessionId/status
router.patch("/sessions/:sessionId/status", requireAuth, async (req, res) => {
  const sessionId = parseInt(req.params.sessionId as string);
  const { status } = req.body;
  const [session] = await db.update(sessionsTable).set({ status }).where(eq(sessionsTable.id, sessionId)).returning();
  if (!session) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await buildSession(session));
});

export default router;
