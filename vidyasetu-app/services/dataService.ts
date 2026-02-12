// services/dataService.ts
// Data service that loads from JSON files (converted from CSV)
// Provides offline-first data access for mobile app

// ==================== Types ====================

export interface Career {
  Title: string;
  Realistic: number;
  Investigative: number;
  Artistic: number;
  Social: number;
  Enterprising: number;
  Conventional: number;
  desc: string;
}

export interface College {
  "Aishe Code": string;
  Name: string;
  District: string;
  State: string;
  Website: string;
  "Year Of Establishment": string;
  Location: string;
  "College Type": string;
  Manegement: string;
  "University Aishe Code": string;
  "University Name": string;
  "University Type": string;
  For_girls: string;
}

export interface Course {
  id: string;
  Courses: string;
  roadmap_id: string;
  stream: string;
}

export interface RoadmapTemplate {
  id: string;
  title: string;
  semester: string;
  internships: string;
  exams: string;
  certifications: string;
  upscaling: string;
}

export interface CareerCourse {
  id: string;
  careers: string;
  courses: string;
}

export interface CourseCollege {
  id: string;
  courses: string;
  colleges: string;
}

// ==================== Data Imports ====================

// Import JSON data (bundled with the app)
import careersData from "../data/careers.json";
import collegesData from "../data/colleges.json";
import coursesData from "../data/courses.json";
import roadmapsData from "../data/roadmaps.json";
import careerCourseData from "../data/careerCourse.json";
import courseCollegeData from "../data/courseCollege.json";

// ==================== Data Getters ====================

export function getCareers(): Career[] {
  return careersData as Career[];
}

export function getColleges(): College[] {
  return collegesData as College[];
}

export function getCourses(): Course[] {
  return coursesData as Course[];
}

export function getRoadmaps(): RoadmapTemplate[] {
  return roadmapsData as RoadmapTemplate[];
}

export function getCareerCourses(): CareerCourse[] {
  return careerCourseData as CareerCourse[];
}

export function getCourseColleges(): CourseCollege[] {
  return courseCollegeData as CourseCollege[];
}

// ==================== Helper Functions ====================

export function getCoursesForCareer(careerName: string): Course[] {
  const careerCourses = getCareerCourses();
  const courses = getCourses();

  const courseNames = careerCourses
    .filter((cc) => cc.careers === careerName)
    .map((cc) => cc.courses);

  return courses.filter((c) => courseNames.includes(c.Courses));
}

export function getCollegesForCourse(courseName: string): College[] {
  const courseColleges = getCourseColleges();
  const colleges = getColleges();

  const collegeNames = courseColleges
    .filter((cc) => cc.courses === courseName)
    .map((cc) => cc.colleges);

  return colleges.filter((c) => collegeNames.includes(c.Name));
}

export function getRoadmapForCourse(courseId: number): RoadmapTemplate | null {
  const courses = getCourses();
  const roadmaps = getRoadmaps();

  const course = courses.find((c) => parseInt(c.id) === courseId);
  if (!course) return null;

  return (
    roadmaps.find((r) => parseInt(r.id) === parseInt(course.roadmap_id)) || null
  );
}

export function searchCareers(query: string): Career[] {
  const careers = getCareers();
  const lowerQuery = query.toLowerCase();
  return careers.filter(
    (c) =>
      c.Title.toLowerCase().includes(lowerQuery) ||
      c.desc.toLowerCase().includes(lowerQuery)
  );
}

export function searchColleges(query: string): College[] {
  const colleges = getColleges();
  const lowerQuery = query.toLowerCase();
  return colleges.filter(
    (c) =>
      c.Name.toLowerCase().includes(lowerQuery) ||
      c.District.toLowerCase().includes(lowerQuery)
  );
}

export function searchCourses(query: string): Course[] {
  const courses = getCourses();
  const lowerQuery = query.toLowerCase();
  return courses.filter((c) => c.Courses.toLowerCase().includes(lowerQuery));
}

export function getCoursesByStream(stream: string): Course[] {
  const courses = getCourses();
  return courses.filter((c) => c.stream.toLowerCase() === stream.toLowerCase());
}

export function getCollegesByDistrict(district: string): College[] {
  const colleges = getColleges();
  return colleges.filter(
    (c) => c.District.toLowerCase() === district.toLowerCase()
  );
}

// ==================== Statistics ====================

export function getDataStats() {
  return {
    careers: getCareers().length,
    colleges: getColleges().length,
    courses: getCourses().length,
    roadmaps: getRoadmaps().length,
    careerCourseRelations: getCareerCourses().length,
    courseCollegeRelations: getCourseColleges().length,
  };
}
