// services/database/migrate.ts - Database migration utilities

import { db } from "./db-config";
import { sql } from "drizzle-orm";

/**
 * Drop all tables and recreate with new schema
 * Use this when schema changes require table structure updates
 */
export async function recreateDatabase() {
  console.log("🔄 Recreating database with new schema...");

  try {
    // Drop all tables in reverse order of dependencies
    await db.run(sql`DROP TABLE IF EXISTS college_facilities`);
    await db.run(sql`DROP TABLE IF EXISTS roadmap`);
    await db.run(sql`DROP TABLE IF EXISTS course_college`);
    await db.run(sql`DROP TABLE IF EXISTS career_course`);
    await db.run(sql`DROP TABLE IF EXISTS courses`);
    await db.run(sql`DROP TABLE IF EXISTS roadmap_templates`);
    await db.run(sql`DROP TABLE IF EXISTS college_list`);
    await db.run(sql`DROP TABLE IF EXISTS careers`);
    await db.run(sql`DROP TABLE IF EXISTS users`);

    console.log("✅ Old tables dropped");
    console.log("📋 Database will be recreated on next initialization");

    return true;
  } catch (error) {
    console.error("❌ Error recreating database:", error);
    return false;
  }
}
