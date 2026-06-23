import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable, companyProfilesTable, usersTable, applicationsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

async function buildJob(job: typeof jobsTable.$inferSelect) {
  const [company] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.id, job.companyId)).limit(1);
  const [companyUser] = company ? await db.select().from(usersTable).where(eq(usersTable.id, company.userId)).limit(1) : [null];
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));

  return {
    id: job.id,
    companyId: job.companyId,
    companyName: company?.companyName ?? null,
    companyLogoUrl: company?.logoUrl ?? companyUser?.avatarUrl ?? null,
    title: job.title,
    description: job.description,
    skills: JSON.parse(job.skills ?? "[]"),
    salary: job.salary,
    location: job.location,
    experienceLevel: job.experienceLevel,
    jobType: job.jobType,
    isRemote: job.isRemote,
    isActive: job.isActive,
    applicantCount: Number(count),
    createdAt: job.createdAt.toISOString(),
  };
}

// GET /jobs
router.get("/jobs", requireAuth, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, true)).limit(limit).offset(offset);
  const results = await Promise.all(jobs.map(buildJob));
  res.json(results);
});

// POST /jobs
router.post("/jobs", requireAuth, requireRole("company"), async (req: AuthenticatedRequest, res) => {
  const [company] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.userId, req.userId!)).limit(1);
  if (!company) { res.status(404).json({ error: "Company profile not found" }); return; }

  const { title, description, skills, salary, location, experienceLevel, jobType, isRemote, isActive } = req.body;
  const [job] = await db.insert(jobsTable).values({
    companyId: company.id,
    title,
    description,
    skills: JSON.stringify(skills ?? []),
    salary: salary ?? null,
    location: location ?? null,
    experienceLevel: experienceLevel ?? null,
    jobType: jobType ?? null,
    isRemote: isRemote ?? false,
    isActive: isActive ?? true,
  }).returning();

  res.status(201).json(await buildJob(job));
});

// GET /jobs/my
router.get("/jobs/my", requireAuth, requireRole("company"), async (req: AuthenticatedRequest, res) => {
  const [company] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.userId, req.userId!)).limit(1);
  if (!company) { res.json([]); return; }
  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.companyId, company.id));
  const results = await Promise.all(jobs.map(buildJob));
  res.json(results);
});

// GET /jobs/:jobId
router.get("/jobs/:jobId", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.jobId as string);
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await buildJob(job));
});

// PUT /jobs/:jobId
router.put("/jobs/:jobId", requireAuth, requireRole("company"), async (req: AuthenticatedRequest, res) => {
  const jobId = parseInt(req.params.jobId as string);
  const { title, description, skills, salary, location, experienceLevel, jobType, isRemote, isActive } = req.body;
  const [job] = await db.update(jobsTable).set({
    title, description,
    skills: skills ? JSON.stringify(skills) : undefined,
    salary, location, experienceLevel, jobType,
    isRemote: isRemote ?? undefined,
    isActive: isActive ?? undefined,
  }).where(eq(jobsTable.id, jobId)).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await buildJob(job));
});

// DELETE /jobs/:jobId
router.delete("/jobs/:jobId", requireAuth, requireRole("company"), async (req, res) => {
  const jobId = parseInt(req.params.jobId as string);
  await db.delete(jobsTable).where(eq(jobsTable.id, jobId));
  res.json({ message: "Deleted" });
});

export default router;
