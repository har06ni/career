import { Router } from "express";
import { createHash } from "crypto";
import { db } from "@workspace/db";
import {
  usersTable,
  studentProfilesTable,
  companyProfilesTable,
  mentorProfilesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "careeraisalt").digest("hex");
}

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  const { name, email, password, role, college, degree, graduationYear, companyName, industry, website, experience } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (!["student", "mentor", "company"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
  }).returning();

  if (role === "student") {
    await db.insert(studentProfilesTable).values({
      userId: user.id,
      college: college ?? null,
      degree: degree ?? null,
      graduationYear: graduationYear ?? null,
    });
  } else if (role === "company") {
    await db.insert(companyProfilesTable).values({
      userId: user.id,
      companyName: companyName ?? name,
      industry: industry ?? null,
      website: website ?? null,
    });
  } else if (role === "mentor") {
    await db.insert(mentorProfilesTable).values({
      userId: user.id,
      experience: experience ?? null,
    });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
    token,
  });
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
    token,
  });
});

// POST /auth/logout
router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt });
});

export default router;
