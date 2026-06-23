import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  instructor: text("instructor"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  level: text("level"),
  rating: text("rating"),
  enrollmentCount: integer("enrollment_count").notNull().default(0),
  skills: text("skills").notNull().default("[]"),
  isFree: boolean("is_free").notNull().default(true),
  price: text("price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const courseEnrollmentsTable = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  studentId: integer("student_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type CourseEnrollment = typeof courseEnrollmentsTable.$inferSelect;

export const aiReportsTable = pgTable("ai_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  careerScore: integer("career_score").notNull().default(0),
  recommendations: text("recommendations").notNull().default("{}"),
  skillGap: text("skill_gap").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAiReportSchema = createInsertSchema(aiReportsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiReport = z.infer<typeof insertAiReportSchema>;
export type AiReport = typeof aiReportsTable.$inferSelect;
