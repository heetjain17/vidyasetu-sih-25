import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Helper to generate UUID (React Native compatible)
export const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Users table
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Careers table (with RIASEC scores from CSV - using real for decimals)
export const careers = sqliteTable("careers", {
  id: integer("id").primaryKey(),
  careerName: text("career_name").notNull().unique(),
  r: real("r").notNull(), // Realistic (decimal)
  i: real("i").notNull(), // Investigative (decimal)
  a: real("a").notNull(), // Artistic (decimal)
  s: real("s").notNull(), // Social (decimal)
  e: real("e").notNull(), // Enterprising (decimal)
  c: real("c").notNull(), // Conventional (decimal)
  description: text("description"), // Career description from CSV
});

// Roadmap Templates table (from roadmap_templates_rows.csv)
export const roadmapTemplates = sqliteTable("roadmap_templates", {
  id: integer("id").primaryKey(),
  title: text("title").notNull().unique(),
  semester: text("semester"), // JSON: {year1: [...], year2: [...], year3: [...]}
  internships: text("internships"), // JSON array
  exams: text("exams"), // JSON array
  certifications: text("certifications"), // JSON array
  upscaling: text("upscaling"), // JSON array
});

// College List table (from CollegeList_rows.csv)
export const collegeList = sqliteTable("college_list", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  aisheCode: text("aishe_code"),
  name: text("name").notNull().unique(),
  district: text("district"),
  state: text("state"),
  website: text("website"),
  yearOfEstablishment: integer("year_of_establishment"),
  location: text("location"), // Urban/Rural
  collegeType: text("college_type"),
  management: text("management"),
  universityAisheCode: text("university_aishe_code"),
  universityName: text("university_name"),
  universityType: text("university_type"),
  forGirls: integer("for_girls", { mode: "boolean" }),
});

// Courses table (from Courses_rows.csv)
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey(),
  courseName: text("course_name").notNull().unique(),
  roadmapId: integer("roadmap_id").references(() => roadmapTemplates.id),
  stream: text("stream"), // Arts, Science, Commerce
});

// Career to Course junction table (from career_to_course_rows.csv)
export const careerCourse = sqliteTable("career_course", {
  id: integer("id").primaryKey(),
  careerName: text("career_name").notNull(),
  courseName: text("course_name").notNull(),
});

// Course to College junction table (from course_to_college_rows.csv)
export const courseCollege = sqliteTable("course_college", {
  id: integer("id").primaryKey(),
  courseName: text("course_name").notNull(),
  collegeName: text("college_name").notNull(),
});

// Legacy roadmap table (keeping for compatibility)
export const roadmap = sqliteTable("roadmap", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  course: text("course").notNull(),
  years: integer("years").notNull(),
  internships: integer("internships").notNull(),
  placements: integer("placements").notNull(),
  upscaling: text("upscaling"),
});

// College Facilities table
export const collegeFacilities = sqliteTable("college_facilities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  collegeName: text("college_name").notNull(),
  infrastructure: integer("infrastructure"),
  library: text("library"),
  computerLabNos: integer("computer_lab_nos"),
  scienceLabNos: integer("science_lab_nos"),
  sportsFacility: text("sports_facility"),
  medicalFacility: text("medical_facility"),
  canteen: text("canteen"),
  locality: text("locality"),
  hostel: text("hostel"),
  fees: integer("fees"),
  scholarships: text("scholarships"),
  reservation: text("reservation"),
  festsFlags: text("fests_flags"),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Career = typeof careers.$inferSelect;
export type NewCareer = typeof careers.$inferInsert;

export type RoadmapTemplate = typeof roadmapTemplates.$inferSelect;
export type NewRoadmapTemplate = typeof roadmapTemplates.$inferInsert;

export type College = typeof collegeList.$inferSelect;
export type NewCollege = typeof collegeList.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CareerCourse = typeof careerCourse.$inferSelect;
export type NewCareerCourse = typeof careerCourse.$inferInsert;

export type CourseCollege = typeof courseCollege.$inferSelect;
export type NewCourseCollege = typeof courseCollege.$inferInsert;

export type Roadmap = typeof roadmap.$inferSelect;
export type NewRoadmap = typeof roadmap.$inferInsert;

export type CollegeFacility = typeof collegeFacilities.$inferSelect;
export type NewCollegeFacility = typeof collegeFacilities.$inferInsert;
