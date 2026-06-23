import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable, jobsTable, companyProfilesTable, studentProfilesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

async function buildApplication(app: typeof applicationsTable.$inferSelect) {
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
  const [company] = job ? await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.id, job.companyId)).limit(1) : [null];
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.id, app.studentId)).limit(1);
  const [studentUser] = studentProfile ? await db.select().from(usersTable).where(eq(usersTable.id, studentProfile.userId)).limit(1) : [null];

  return {
    id: app.id,
    jobId: app.jobId,
    studentId: app.studentId,
    jobTitle: job?.title ?? null,
    companyName: company?.companyName ?? null,
    studentName: studentUser?.name ?? null,
    studentEmail: studentUser?.email ?? null,
    studentAvatarUrl: studentUser?.avatarUrl ?? null,
    status: app.status,
    coverLetter: app.coverLetter,
    createdAt: app.createdAt.toISOString(),
  };
}

// POST /applications
router.post("/applications", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!studentProfile) { res.status(404).json({ error: "Student profile not found" }); return; }

  const { jobId, coverLetter } = req.body;
  const [existing] = await db.select().from(applicationsTable)
    .where(and(eq(applicationsTable.jobId, jobId), eq(applicationsTable.studentId, studentProfile.id)))
    .limit(1);
  if (existing) { res.status(400).json({ error: "Already applied" }); return; }

  const [app] = await db.insert(applicationsTable).values({
    jobId,
    studentId: studentProfile.id,
    status: "pending",
    coverLetter: coverLetter ?? null,
  }).returning();

  res.status(201).json(await buildApplication(app));
});

// GET /applications/my
router.get("/applications/my", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!studentProfile) { res.json([]); return; }
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, studentProfile.id));
  const results = await Promise.all(apps.map(buildApplication));
  res.json(results);
});

// GET /applications/job/:jobId
router.get("/applications/job/:jobId", requireAuth, requireRole("company"), async (req, res) => {
  const jobId = parseInt(req.params.jobId as string);
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
  const results = await Promise.all(apps.map(buildApplication));
  res.json(results);
});

// PATCH /applications/:applicationId/status
router.patch("/applications/:applicationId/status", requireAuth, requireRole("company"), async (req, res) => {
  const applicationId = parseInt(req.params.applicationId as string);
  const { status } = req.body;
  const [app] = await db.update(applicationsTable).set({ status }).where(eq(applicationsTable.id, applicationId)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await buildApplication(app));
});

export default router;
