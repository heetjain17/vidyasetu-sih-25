// services/csvDataService.ts
// Direct CSV data loading for offline-first mobile app
// Use this instead of SQLite for simpler data management

import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

// ==================== Types ====================

export interface Career {
  id: number;
  careerName: string;
  r: number;
  i: number;
  a: number;
  s: number;
  e: number;
  c: number;
  description: string;
}

export interface College {
  aisheCode: string;
  name: string;
  district: string;
  state: string;
  website: string;
  yearOfEstablishment: number;
  location: string;
  collegeType: string;
  management: string;
  universityAisheCode: string;
  universityName: string;
  universityType: string;
  forGirls: boolean;
}

export interface Course {
  id: number;
  name: string;
  roadmapId: number;
  stream: string;
}

export interface RoadmapTemplate {
  id: number;
  title: string;
  semester: string;
  internships: string;
  exams: string;
  certifications: string;
  upscaling: string;
}

export interface CareerCourse {
  id: number;
  career: string;
  course: string;
}

export interface CourseCollege {
  id: number;
  course: string;
  college: string;
}

// ==================== CSV Cache ====================

let careersCache: Career[] | null = null;
let collegesCache: College[] | null = null;
let coursesCache: Course[] | null = null;
let roadmapsCache: RoadmapTemplate[] | null = null;
let careerCourseCache: CareerCourse[] | null = null;
let courseCollegeCache: CourseCollege[] | null = null;

// ==================== CSV Parser ====================

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV<T>(
  csvContent: string,
  mapper: (values: string[], index: number) => T
): T[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const results: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    try {
      results.push(mapper(values, i));
    } catch (e) {
      console.warn(`Error parsing CSV line ${i}:`, e);
    }
  }
  return results;
}

// ==================== Data Loaders ====================

// For React Native, we'll use require to import bundled CSV data
// These will be pre-processed at build time

// Import the raw data from the data folder
const RIASEC_DATA = require("../../data/RIASEC_rows.csv");
const COLLEGES_DATA = require("../../data/CollegeList_rows.csv");
const COURSES_CSV = require("../../data/Courses_rows.csv");
const ROADMAPS_CSV = require("../../data/roadmap_templates_rows.csv");
const CAREER_COURSE_CSV = require("../../data/career_to_course_rows.csv");
const COURSE_COLLEGE_CSV = require("../../data/course_to_college_rows.csv");

// ==================== Data Getters ====================

export async function getCareers(): Promise<Career[]> {
  if (careersCache) return careersCache;

  try {
    const content = RIASEC_DATA;
    careersCache = parseCSV(content, (v, idx) => ({
      id: idx,
      careerName: v[0],
      r: parseFloat(v[1]) || 0,
      i: parseFloat(v[2]) || 0,
      a: parseFloat(v[3]) || 0,
      s: parseFloat(v[4]) || 0,
      e: parseFloat(v[5]) || 0,
      c: parseFloat(v[6]) || 0,
      description: v[7] || "",
    }));
    console.log(`📊 Loaded ${careersCache.length} careers from CSV`);
    return careersCache;
  } catch (error) {
    console.error("Error loading careers:", error);
    return [];
  }
}

export async function getColleges(): Promise<College[]> {
  if (collegesCache) return collegesCache;

  try {
    const content = COLLEGES_DATA;
    collegesCache = parseCSV(content, (v) => ({
      aisheCode: v[0],
      name: v[1],
      district: v[2],
      state: v[3],
      website: v[4],
      yearOfEstablishment: parseInt(v[5]) || 0,
      location: v[6],
      collegeType: v[7],
      management: v[8],
      universityAisheCode: v[9],
      universityName: v[10],
      universityType: v[11],
      forGirls: v[12]?.toLowerCase() === "true",
    }));
    console.log(`🏫 Loaded ${collegesCache.length} colleges from CSV`);
    return collegesCache;
  } catch (error) {
    console.error("Error loading colleges:", error);
    return [];
  }
}

export async function getCourses(): Promise<Course[]> {
  if (coursesCache) return coursesCache;

  try {
    const content = COURSES_CSV;
    coursesCache = parseCSV(content, (v) => ({
      id: parseInt(v[0]) || 0,
      name: v[1],
      roadmapId: parseInt(v[2]) || 0,
      stream: v[3],
    }));
    console.log(`📚 Loaded ${coursesCache.length} courses from CSV`);
    return coursesCache;
  } catch (error) {
    console.error("Error loading courses:", error);
    return [];
  }
}

export async function getRoadmaps(): Promise<RoadmapTemplate[]> {
  if (roadmapsCache) return roadmapsCache;

  try {
    const content = ROADMAPS_CSV;
    roadmapsCache = parseCSV(content, (v) => ({
      id: parseInt(v[0]) || 0,
      title: v[1],
      semester: v[2],
      internships: v[3],
      exams: v[4],
      certifications: v[5],
      upscaling: v[6],
    }));
    console.log(`🗺️ Loaded ${roadmapsCache.length} roadmaps from CSV`);
    return roadmapsCache;
  } catch (error) {
    console.error("Error loading roadmaps:", error);
    return [];
  }
}

export async function getCareerCourses(): Promise<CareerCourse[]> {
  if (careerCourseCache) return careerCourseCache;

  try {
    const content = CAREER_COURSE_CSV;
    careerCourseCache = parseCSV(content, (v) => ({
      id: parseInt(v[0]) || 0,
      career: v[1],
      course: v[2],
    }));
    console.log(
      `🔗 Loaded ${careerCourseCache.length} career-course relations from CSV`
    );
    return careerCourseCache;
  } catch (error) {
    console.error("Error loading career-course relations:", error);
    return [];
  }
}

export async function getCourseColleges(): Promise<CourseCollege[]> {
  if (courseCollegeCache) return courseCollegeCache;

  try {
    const content = COURSE_COLLEGE_CSV;
    courseCollegeCache = parseCSV(content, (v) => ({
      id: parseInt(v[0]) || 0,
      course: v[1],
      college: v[2],
    }));
    console.log(
      `🔗 Loaded ${courseCollegeCache.length} course-college relations from CSV`
    );
    return courseCollegeCache;
  } catch (error) {
    console.error("Error loading course-college relations:", error);
    return [];
  }
}

// ==================== Helper Functions ====================

export async function getCoursesForCareer(
  careerName: string
): Promise<Course[]> {
  const careerCourses = await getCareerCourses();
  const courses = await getCourses();

  const courseNames = careerCourses
    .filter((cc) => cc.career === careerName)
    .map((cc) => cc.course);

  return courses.filter((c) => courseNames.includes(c.name));
}

export async function getCollegesForCourse(
  courseName: string
): Promise<College[]> {
  const courseColleges = await getCourseColleges();
  const colleges = await getColleges();

  const collegeNames = courseColleges
    .filter((cc) => cc.course === courseName)
    .map((cc) => cc.college);

  return colleges.filter((c) => collegeNames.includes(c.name));
}

export async function getRoadmapForCourse(
  courseId: number
): Promise<RoadmapTemplate | null> {
  const courses = await getCourses();
  const roadmaps = await getRoadmaps();

  const course = courses.find((c) => c.id === courseId);
  if (!course) return null;

  return roadmaps.find((r) => r.id === course.roadmapId) || null;
}

export async function searchCareers(query: string): Promise<Career[]> {
  const careers = await getCareers();
  const lowerQuery = query.toLowerCase();
  return careers.filter(
    (c) =>
      c.careerName.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery)
  );
}

export async function searchColleges(query: string): Promise<College[]> {
  const colleges = await getColleges();
  const lowerQuery = query.toLowerCase();
  return colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.district.toLowerCase().includes(lowerQuery)
  );
}

// ==================== Cache Control ====================

export function clearCache(): void {
  careersCache = null;
  collegesCache = null;
  coursesCache = null;
  roadmapsCache = null;
  careerCourseCache = null;
  courseCollegeCache = null;
  console.log("🗑️ CSV cache cleared");
}

export async function preloadAllData(): Promise<void> {
  console.log("⏳ Preloading all CSV data...");
  await Promise.all([
    getCareers(),
    getColleges(),
    getCourses(),
    getRoadmaps(),
    getCareerCourses(),
    getCourseColleges(),
  ]);
  console.log("✅ All CSV data preloaded!");
}
