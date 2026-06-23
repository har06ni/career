import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // student | mentor | company
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const studentProfilesTable = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  college: text("college"),
  degree: text("degree"),
  graduationYear: integer("graduation_year"),
  skills: text("skills").notNull().default("[]"),
  bio: text("bio"),
  resumeUrl: text("resume_url"),
  projects: text("projects").notNull().default("[]"),
  certifications: text("certifications").notNull().default("[]"),
  experience: text("experience").notNull().default("[]"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;

export const companyProfilesTable = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  website: text("website"),
  description: text("description"),
  logoUrl: text("logo_url"),
  location: text("location"),
  size: text("size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type CompanyProfile = typeof companyProfilesTable.$inferSelect;

export const mentorProfilesTable = pgTable("mentor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  company: text("company"),
  title: text("title"),
  experience: integer("experience"),
  skills: text("skills").notNull().default("[]"),
  bio: text("bio"),
  rating: text("rating"),
  sessionsCompleted: integer("sessions_completed").notNull().default(0),
  pricePerSession: text("price_per_session"),
  availability: text("availability").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMentorProfileSchema = createInsertSchema(mentorProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMentorProfile = z.infer<typeof insertMentorProfileSchema>;
export type MentorProfile = typeof mentorProfilesTable.$inferSelect;
