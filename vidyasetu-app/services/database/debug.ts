// services/database/debug.ts - Simple database viewer utility

import { db } from './db-config';
import * as schema from './schema';

/**
 * Utility functions to view database contents
 * Call these from your app to inspect data
 */

export const dbDebug = {
  // View all users
  async viewUsers() {
    const users = await db.select().from(schema.users);
    console.log('📋 Users:', JSON.stringify(users, null, 2));
    return users;
  },

  // View all careers
  async viewCareers() {
    const careers = await db.select().from(schema.careers);
    console.log('📋 Careers:', JSON.stringify(careers, null, 2));
    return careers;
  },

  // View all colleges
  async viewColleges() {
    const colleges = await db.select().from(schema.collegeList);
    console.log('📋 Colleges:', JSON.stringify(colleges, null, 2));
    return colleges;
  },

  // View all courses
  async viewCourses() {
    const courses = await db.select().from(schema.courses);
    console.log('📋 Courses:', JSON.stringify(courses, null, 2));
    return courses;
  },

  // View all facilities
  async viewFacilities() {
    const facilities = await db.select().from(schema.collegeFacilities);
    console.log('📋 Facilities:', JSON.stringify(facilities, null, 2));
    return facilities;
  },

  // View all roadmaps
  async viewRoadmaps() {
    const roadmaps = await db.select().from(schema.roadmap);
    console.log('📋 Roadmaps:', JSON.stringify(roadmaps, null, 2));
    return roadmaps;
  },

  // View all courseColleges
  async viewCourseColleges() {
    const courseColleges = await db.select().from(schema.courseCollege);
    console.log('📋 Course-Colleges:', JSON.stringify(courseColleges, null, 2));
    return courseColleges;
  },

  // View all tables at once
  async viewAll() {
    console.log('🔍 DATABASE CONTENTS:');
    console.log('='.repeat(50));
    
    await this.viewUsers();
    await this.viewCareers();
    await this.viewColleges();
    await this.viewCourses();
    await this.viewFacilities();
    await this.viewRoadmaps();
    await this.viewCourseColleges();
    
    console.log('='.repeat(50));
  },

  // Count records in each table
  async getStats() {
    const stats = {
      users: await db.select().from(schema.users).then(r => r.length),
      careers: await db.select().from(schema.careers).then(r => r.length),
      colleges: await db.select().from(schema.collegeList).then(r => r.length),
      courses: await db.select().from(schema.courses).then(r => r.length),
      facilities: await db.select().from(schema.collegeFacilities).then(r => r.length),
      roadmaps: await db.select().from(schema.roadmap).then(r => r.length),
      courseColleges: await db.select().from(schema.courseCollege).then(r => r.length),
    };
    
    console.log('📊 Database Stats:', stats);
    return stats;
  }
};

// Export for use in app
export default dbDebug;
