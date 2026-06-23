import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, companyProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function buildCompanyProfile(user: typeof usersTable.$inferSelect, profile: typeof companyProfilesTable.$inferSelect) {
  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    email: user.email,
    industry: profile.industry,
    website: profile.website,
    description: profile.description,
    logoUrl: profile.logoUrl ?? user.avatarUrl,
    location: profile.location,
    size: profile.size,
  };
}

// GET /companies/profile
router.get("/companies/profile", requireAuth, requireRole("company"), async (req: AuthenticatedRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  const [profile] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.userId, req.userId!)).limit(1);
  if (!user || !profile) { res.status(404).json({ error: "Profile not found" }); return; }
  res.json(buildCompanyProfile(user, profile));
});

// PUT /companies/profile
router.put("/companies/profile", requireAuth, requireRole("company"), async (req: AuthenticatedRequest, res) => {
  const { companyName, industry, website, description, logoUrl, location, size } = req.body;
  const updateData: Partial<typeof companyProfilesTable.$inferInsert> = {};
  if (companyName !== undefined) updateData.companyName = companyName;
  if (industry !== undefined) updateData.industry = industry;
  if (website !== undefined) updateData.website = website;
  if (description !== undefined) updateData.description = description;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (location !== undefined) updateData.location = location;
  if (size !== undefined) updateData.size = size;

  const [profile] = await db.update(companyProfilesTable).set(updateData).where(eq(companyProfilesTable.userId, req.userId!)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  res.json(buildCompanyProfile(user, profile));
});

export default router;
