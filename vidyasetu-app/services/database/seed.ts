// services/database/seed.ts - Seed database with test data

import { db } from './db-config';
import * as schema from './schema';

/**
 * Seed the database with test data
 * Use this for testing and development
 */

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    await clearDatabase();

    // 1. Seed Users
    console.log('👥 Seeding users...');
    const users = await db.insert(schema.users).values([
      {
        id: schema.generateId(),
        name: 'Aarav Kumar',
        email: 'aarav@example.com',
      },
      {
        id: schema.generateId(),
        name: 'Priya Sharma',
        email: 'priya@example.com',
      },
      {
        id: schema.generateId(),
        name: 'Rohan Singh',
        email: 'rohan@example.com',
      },
    ]).returning();
    console.log(`✅ Added ${users.length} users`);

    // 2. Seed Careers (with RIASEC scores)
    console.log('💼 Seeding careers...');
    const careers = await db.insert(schema.careers).values([
      { id: schema.generateId(), careerName: 'Software Engineer', r: 3, i: 9, a: 4, s: 5, e: 6, c: 7 },
      { id: schema.generateId(), careerName: 'Doctor', r: 4, i: 8, a: 3, s: 9, e: 5, c: 6 },
      { id: schema.generateId(), careerName: 'Lawyer', r: 2, i: 7, a: 5, s:6, e: 9, c: 8 },
      { id: schema.generateId(), careerName: 'Teacher', r: 3, i: 6, a: 5, s: 9, e: 4, c: 7 },
      { id: schema.generateId(), careerName: 'Civil Engineer', r: 7, i: 8, a: 4, s: 5, e: 6, c: 8 },
      { id: schema.generateId(), careerName: 'Nurse', r: 4, i: 6, a: 3, s: 9, e: 4, c: 7 },
      { id: schema.generateId(), careerName: 'Accountant', r: 2, i: 5, a: 3, s: 4, e: 6, c: 9 },
    ]).returning();
    console.log(`✅ Added ${careers.length} careers`);

    // 3. Seed Colleges
    console.log('🏫 Seeding colleges...');
    const colleges = await db.insert(schema.collegeList).values([
      {
        id: schema.generateId(),
        name: 'National Institute of Technology Srinagar',
        district: 'Srinagar',
        website: 'https://www.nitsri.ac.in',
      },
      {
        id: schema.generateId(),
        name: 'Government Medical College Srinagar',
        district: 'Srinagar',
        website: 'https://www.gmcsrinagar.edu.in',
      },
      {
        id: schema.generateId(),
        name: 'University of Kashmir',
        district: 'Srinagar',
        website: 'https://www.kashmiruniversity.net',
      },
      {
        id: schema.generateId(),
        name: 'Government College for Engineering & Technology Jammu',
        district: 'Jammu',
        website: 'https://www.gcetjammu.ac.in',
      },
      {
        id: schema.generateId(),
        name: 'Islamic University of Science & Technology',
        district: 'Pulwama',
        website: 'https://www.iust.ac.in',
      },
      {
        id: schema.generateId(),
        name: 'Cluster University Srinagar',
        district: 'Srinagar',
        website: 'https://www.cusrinagar.edu.in',
      },
      {
        id: schema.generateId(),
        name: 'Govt. Degree College Anantnag',
        district: 'Anantnag',
        website: null,
      },
    ]).returning();
    console.log(`✅ Added ${colleges.length} colleges`);

    // 4. Seed Courses
    console.log('📚 Seeding courses...');
    const courses = await db.insert(schema.courses).values([
      { id: schema.generateId(), career: careers[0].id, course: 'B.Tech Computer Science' },
      { id: schema.generateId(), career: careers[0].id, course: 'BCA' },
      { id: schema.generateId(), career: careers[1].id, course: 'MBBS' },
      { id: schema.generateId(), career: careers[1].id, course: 'BAMS' },
      { id: schema.generateId(), career: careers[2].id, course: 'LLB' },
      { id: schema.generateId(), career: careers[2].id, course: 'BA LLB' },
      { id: schema.generateId(), career: careers[3].id, course: 'B.Ed' },
      { id: schema.generateId(), career: careers[4].id, course: 'B.Tech Civil Engineering' },
      { id: schema.generateId(), career: careers[5].id, course: 'B.Sc Nursing' },
      { id: schema.generateId(), career: careers[6].id, course: 'B.Com' },
    ]).returning();
    console.log(`✅ Added ${courses.length} courses`);

    // 5. Seed Course-College Relationships
    console.log('🔗 Seeding course-college relationships...');
    const courseColleges = await db.insert(schema.courseCollege).values([
      // NIT Srinagar
      { id: schema.generateId(), courseName: courses[0].course, collegeName: colleges[0].name },
      { id: schema.generateId(), courseName: courses[7].course, collegeName: colleges[0].name },
      
      // GMC Srinagar
      { id: schema.generateId(), courseName: courses[2].course, collegeName: colleges[1].name },
      { id: schema.generateId(), courseName: courses[8].course, collegeName: colleges[1].name },
      
      // University of Kashmir
      { id: schema.generateId(), courseName: courses[1].course, collegeName: colleges[2].name },
      { id: schema.generateId(), courseName: courses[6].course, collegeName: colleges[2].name },
      { id: schema.generateId(), courseName: courses[9].course, collegeName: colleges[2].name },
      
      // GCET Jammu
      { id: schema.generateId(), courseName: courses[0].course, collegeName: colleges[3].name },
      
      // IUST Pulwama
      { id: schema.generateId(), courseName: courses[0].course, collegeName: colleges[4].name },
      { id: schema.generateId(), courseName: courses[7].course, collegeName: colleges[4].name },
      
      // Cluster University
      { id: schema.generateId(), courseName: courses[1].course, collegeName: colleges[5].name },
      { id: schema.generateId(), courseName: courses[4].course, collegeName: colleges[5].name },
    ]).returning();
    console.log(`✅ Added ${courseColleges.length} course-college relationships`);

    // 6. Seed Roadmaps
    console.log('🗺️ Seeding roadmaps...');
    const roadmaps = await db.insert(schema.roadmap).values([
      {
        id: schema.generateId(),
        course: courses[0].course,
        years: 4,
        internships: 2,
        placements: 85,
        upscaling: 'Master in Computer Science, Certifications (AWS, Azure)',
      },
      {
        id: schema.generateId(),
        course: courses[2].course,
        years: 5,
        internships: 1,
        placements: 100,
        upscaling: 'MD/MS specialization, Fellowship programs',
      },
      {
        id: schema.generateId(),
        course: courses[4].course,
        years: 3,
        internships: 1,
        placements: 70,
        upscaling: 'LLM, Judicial Services preparation',
      },
      {
        id: schema.generateId(),
        course: courses[7].course,
        years: 4,
        internships: 2,
        placements: 75,
        upscaling: 'M.Tech, Professional certifications',
      },
    ]).returning();
    console.log(`✅ Added ${roadmaps.length} roadmaps`);

    // 7. Seed College Facilities
    console.log('🏢 Seeding college facilities...');
    const facilities = await db.insert(schema.collegeFacilities).values([
      // NIT Srinagar
      {
        id: schema.generateId(),
        collegeName: colleges[0].name,
        infrastructure: 9,
        library: 'Yes - Central Library with 50,000+ books',
        computerLabNos: 15,
        scienceLabNos: 10,
        sportsFacility: 'Yes - Indoor & Outdoor facilities',
        medicalFacility: 'Yes - 24/7 Medical Center',
        canteen: 'Yes - 3 canteens',
        locality: 'Hazratbal, Srinagar',
        hostel: 'Yes - Separate boys and girls hostels',
        fees: 125000,
        scholarships: 'Merit-based, Need-based, SC/ST scholarships',
        reservation: JSON.stringify(['SC', 'ST', 'OBC', 'EWS']),
        festsFlags: JSON.stringify({ techFest: true, culturalFest: true, sportsFest: true }),
      },
      // GMC Srinagar
      {
        id: schema.generateId(),
        collegeName: colleges[1].name,
        infrastructure: 8,
        library: 'Yes - Medical Library',
        computerLabNos: 5,
        scienceLabNos: 20,
        sportsFacility: 'Yes',
        medicalFacility: 'Teaching Hospital attached',
        canteen: 'Yes',
        locality: 'Karan Nagar, Srinagar',
        hostel: 'Yes - Both boys and girls',
        fees: 50000,
        scholarships: 'Government scholarships available',
        reservation: JSON.stringify(['SC', 'ST', 'OBC', 'EWS']),
        festsFlags: JSON.stringify({ medFest: true, culturalFest: true }),
      },
      // University of Kashmir
      {
        id: schema.generateId(),
        collegeName: colleges[2].name,
        infrastructure: 8,
        library: 'Yes - Allama Iqbal Library',
        computerLabNos: 12,
        scienceLabNos: 15,
        sportsFacility: 'Yes - Sports Complex',
        medicalFacility: 'Yes',
        canteen: 'Yes - Multiple outlets',
        locality: 'Hazratbal, Srinagar',
        hostel: 'Yes - Multiple hostels',
        fees: 30000,
        scholarships: 'Merit cum means, Minority scholarships',
        reservation: JSON.stringify(['SC', 'ST', 'OBC', 'EWS', 'RBA']),
        festsFlags: JSON.stringify({ culturalFest: true, sportsFest: true }),
      },
      // IUST Pulwama
      {
        id: schema.generateId(),
        collegeName: colleges[4].name,
        infrastructure: 7,
        library: 'Yes - Digital Library',
        computerLabNos: 8,
        scienceLabNos: 12,
        sportsFacility: 'Yes',
        medicalFacility: 'Yes',
        canteen: 'Yes',
        locality: 'Awantipora, Pulwama',
        hostel: 'Yes',
        fees: 75000,
        scholarships: 'Available',
        reservation: JSON.stringify(['SC', 'ST', 'OBC', 'EWS']),
        festsFlags: JSON.stringify({ techFest: true, culturalFest: true }),
      },
    ]).returning();
    console.log(`✅ Added ${facilities.length} college facilities`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${careers.length} careers`);
    console.log(`   - ${colleges.length} colleges`);
    console.log(`   - ${courses.length} courses`);
    console.log(`   - ${courseColleges.length} course-college links`);
    console.log(`   - ${roadmaps.length} roadmaps`);
    console.log(`   - ${facilities.length} facilities`);

    return {
      users,
      careers,
      colleges,
      courses,
      courseColleges,
      roadmaps,
      facilities,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear all data from the database
 */
export async function clearDatabase() {
  console.log('🗑️ Clearing database...');
  
  try {
    // Delete in reverse order of dependencies
    await db.delete(schema.collegeFacilities);
    await db.delete(schema.roadmap);
    await db.delete(schema.courseCollege);
    await db.delete(schema.courses);
    await db.delete(schema.collegeList);
    await db.delete(schema.careers);
    await db.delete(schema.users);
    
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Reset database (clear and reseed)
 */
export async function resetDatabase() {
  console.log('🔄 Resetting database...');
  await clearDatabase();
  await seedDatabase();
  console.log('✅ Database reset complete');
}

export default {
  seedDatabase,
  clearDatabase,
  resetDatabase,
};
