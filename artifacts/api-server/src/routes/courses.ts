import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, courseEnrollmentsTable, studentProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function buildCourse(course: typeof coursesTable.$inferSelect) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    instructor: course.instructor,
    thumbnailUrl: course.thumbnailUrl,
    duration: course.duration,
    level: course.level,
    rating: course.rating ? parseFloat(course.rating) : null,
    enrollmentCount: course.enrollmentCount,
    skills: JSON.parse(course.skills ?? "[]"),
    isFree: course.isFree,
    price: course.price ? parseFloat(course.price) : null,
  };
}

async function buildEnrollment(enrollment: typeof courseEnrollmentsTable.$inferSelect) {
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, enrollment.courseId)).limit(1);
  return {
    id: enrollment.id,
    courseId: enrollment.courseId,
    studentId: enrollment.studentId,
    courseTitle: course?.title ?? null,
    courseThumbnailUrl: course?.thumbnailUrl ?? null,
    courseCategory: course?.category ?? null,
    progress: enrollment.progress,
    completed: enrollment.completed,
    createdAt: enrollment.createdAt.toISOString(),
  };
}

// GET /courses
router.get("/courses", requireAuth, async (req, res) => {
  const { category, search } = req.query;
  let courses = await db.select().from(coursesTable);
  if (category) courses = courses.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  if (search) courses = courses.filter(c => c.title.toLowerCase().includes((search as string).toLowerCase()));
  res.json(courses.map(buildCourse));
});

// GET /courses/my/enrollments
router.get("/courses/my/enrollments", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!studentProfile) { res.json([]); return; }
  const enrollments = await db.select().from(courseEnrollmentsTable).where(eq(courseEnrollmentsTable.studentId, studentProfile.id));
  const results = await Promise.all(enrollments.map(buildEnrollment));
  res.json(results);
});

// GET /courses/:courseId
router.get("/courses/:courseId", requireAuth, async (req, res) => {
  const courseId = parseInt(req.params.courseId as string);
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
  if (!course) { res.status(404).json({ error: "Not found" }); return; }
  res.json(buildCourse(course));
});

// POST /courses/:courseId/enroll
router.post("/courses/:courseId/enroll", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const courseId = parseInt(req.params.courseId as string);
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!studentProfile) { res.status(404).json({ error: "Profile not found" }); return; }

  const [existing] = await db.select().from(courseEnrollmentsTable)
    .where(and(eq(courseEnrollmentsTable.courseId, courseId), eq(courseEnrollmentsTable.studentId, studentProfile.id)))
    .limit(1);
  if (existing) { res.status(400).json({ error: "Already enrolled" }); return; }

  const [enrollment] = await db.insert(courseEnrollmentsTable).values({
    courseId,
    studentId: studentProfile.id,
    progress: 0,
    completed: false,
  }).returning();

  await db.update(coursesTable).set({ enrollmentCount: (await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1))[0].enrollmentCount + 1 }).where(eq(coursesTable.id, courseId));

  res.status(201).json(await buildEnrollment(enrollment));
});

// PATCH /courses/:courseId/progress
router.patch("/courses/:courseId/progress", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const courseId = parseInt(req.params.courseId as string);
  const { progress, completed } = req.body;
  const [studentProfile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, req.userId!)).limit(1);
  if (!studentProfile) { res.status(404).json({ error: "Profile not found" }); return; }

  const [enrollment] = await db.update(courseEnrollmentsTable)
    .set({ progress, completed: completed ?? false })
    .where(and(eq(courseEnrollmentsTable.courseId, courseId), eq(courseEnrollmentsTable.studentId, studentProfile.id)))
    .returning();
  if (!enrollment) { res.status(404).json({ error: "Not enrolled" }); return; }
  res.json(await buildEnrollment(enrollment));
});

export default router;
