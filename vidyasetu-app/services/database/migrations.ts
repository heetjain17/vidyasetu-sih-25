import { sql } from "drizzle-orm";
import { db } from "./db-config";

/**
 * Initialize database by creating all tables
 * This runs the SQL CREATE TABLE statements for all tables in the schema
 */
export async function initializeDatabase() {
  console.log("🔧 Initializing database...");

  try {
    // Create users table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at INTEGER
      )
    `);

    // Create careers table with REAL for decimal RIASEC scores
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS careers (
        id INTEGER PRIMARY KEY NOT NULL,
        career_name TEXT NOT NULL UNIQUE,
        r REAL NOT NULL,
        i REAL NOT NULL,
        a REAL NOT NULL,
        s REAL NOT NULL,
        e REAL NOT NULL,
        c REAL NOT NULL,
        description TEXT
      )
    `);

    // Create roadmap_templates table (NEW - for CSV data)
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS roadmap_templates (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL UNIQUE,
        semester TEXT,
        internships TEXT,
        exams TEXT,
        certifications TEXT,
        upscaling TEXT
      )
    `);

    // Create college_list table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS college_list (
        id TEXT PRIMARY KEY NOT NULL,
        aishe_code TEXT,
        name TEXT NOT NULL UNIQUE,
        district TEXT,
        state TEXT,
        website TEXT,
        year_of_establishment INTEGER,
        location TEXT,
        college_type TEXT,
        management TEXT,
        university_aishe_code TEXT,
        university_name TEXT,
        university_type TEXT,
        for_girls INTEGER
      )
    `);

    // Create courses table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY NOT NULL,
        course_name TEXT NOT NULL UNIQUE,
        roadmap_id INTEGER,
        stream TEXT,
        FOREIGN KEY (roadmap_id) REFERENCES roadmap_templates(id)
      )
    `);

    // Create career_course junction table (NEW - for CSV data)
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS career_course (
        id INTEGER PRIMARY KEY NOT NULL,
        career_name TEXT NOT NULL,
        course_name TEXT NOT NULL
      )
    `);

    // Create course_college junction table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS course_college (
        id INTEGER PRIMARY KEY NOT NULL,
        course_name TEXT NOT NULL,
        college_name TEXT NOT NULL
      )
    `);

    // Create roadmap table (legacy)
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS roadmap (
        id TEXT PRIMARY KEY NOT NULL,
        course TEXT NOT NULL,
        years INTEGER NOT NULL,
        internships INTEGER NOT NULL,
        placements INTEGER NOT NULL,
        upscaling TEXT
      )
    `);

    // Create college_facilities table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS college_facilities (
        id TEXT PRIMARY KEY NOT NULL,
        college_name TEXT NOT NULL,
        infrastructure INTEGER,
        library TEXT,
        computer_lab_nos INTEGER,
        science_lab_nos INTEGER,
        sports_facility TEXT,
        medical_facility TEXT,
        canteen TEXT,
        locality TEXT,
        hostel TEXT,
        fees INTEGER,
        scholarships TEXT,
        reservation TEXT,
        fests_flags TEXT
      )
    `);

    console.log("✅ Database initialized successfully!");
    console.log(
      "📊 Created tables: users, careers, roadmap_templates, college_list, courses, career_course, course_college, roadmap, college_facilities"
    );

    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

/**
 * Check if database is already initialized by checking if tables exist
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const result = await db.get<{ name: string }>(sql`
      SELECT name FROM sqlite_master WHERE type='table' AND name='users'
    `);
    return !!result;
  } catch (error) {
    return false;
  }
}

/**
 * Get database statistics (table row counts)
 */
export async function getDatabaseStats() {
  try {
    const stats = {
      users: await db.run(sql`SELECT COUNT(*) as count FROM users`),
      careers: await db.run(sql`SELECT COUNT(*) as count FROM careers`),
      colleges: await db.run(sql`SELECT COUNT(*) as count FROM college_list`),
      courses: await db.run(sql`SELECT COUNT(*) as count FROM courses`),
      courseColleges: await db.run(
        sql`SELECT COUNT(*) as count FROM course_college`
      ),
      roadmaps: await db.run(sql`SELECT COUNT(*) as count FROM roadmap`),
      facilities: await db.run(
        sql`SELECT COUNT(*) as count FROM college_facilities`
      ),
    };

    return stats;
  } catch (error) {
    console.error("Error getting database stats:", error);
    return null;
  }
}

/**
 * Reset database by dropping all tables and recreating them
 * WARNING: This will delete ALL data!
 */
export async function resetDatabase() {
  console.log("🗑️ Resetting database - dropping all tables...");

  try {
    // Drop all tables in reverse dependency order
    await db.run(sql`DROP TABLE IF EXISTS course_college`);
    await db.run(sql`DROP TABLE IF EXISTS career_course`);
    await db.run(sql`DROP TABLE IF EXISTS courses`);
    await db.run(sql`DROP TABLE IF EXISTS college_facilities`);
    await db.run(sql`DROP TABLE IF EXISTS college_list`);
    await db.run(sql`DROP TABLE IF EXISTS roadmap_templates`);
    await db.run(sql`DROP TABLE IF EXISTS roadmap`);
    await db.run(sql`DROP TABLE IF EXISTS careers`);
    await db.run(sql`DROP TABLE IF EXISTS users`);

    console.log("✅ All tables dropped");

    // Recreate all tables
    await initializeDatabase();

    console.log("✅ Database reset complete - ready for fresh seeding");
    return true;
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}
