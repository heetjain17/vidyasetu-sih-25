/**
 * Career Hub API - Fetch study materials, roadmaps, and scholarships
 */

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface StudyMaterial {
  courses: string;
  link: string;
  duration: string;
  materials: string;
}

export interface CareerRoadmap {
  id: number;
  courses: string;
  industry: string;
  government_exams: string;
  company_names: string;
  higher_education: string;
}

export interface Scholarship {
  id: number;
  scheme: string;
  eligibility: string;
  benefit: string;
  link: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function getCourses(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedResponse<StudyMaterial>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);

  const res = await fetch(`${API_URL}/career-hub/courses?${params}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export async function getAllCourses(): Promise<{
  data: StudyMaterial[];
  total: number;
}> {
  const res = await fetch(`${API_URL}/career-hub/courses/all`);
  if (!res.ok) throw new Error("Failed to fetch all courses");
  return res.json();
}

export async function getRoadmaps(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedResponse<CareerRoadmap>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);

  const res = await fetch(`${API_URL}/career-hub/roadmaps?${params}`);
  if (!res.ok) throw new Error("Failed to fetch roadmaps");
  return res.json();
}

export async function getAllRoadmaps(): Promise<{
  data: CareerRoadmap[];
  total: number;
}> {
  const res = await fetch(`${API_URL}/career-hub/roadmaps/all`);
  if (!res.ok) throw new Error("Failed to fetch all roadmaps");
  return res.json();
}

export async function getRoadmapById(id: number): Promise<CareerRoadmap> {
  const res = await fetch(`${API_URL}/career-hub/roadmaps/${id}`);
  if (!res.ok) throw new Error("Failed to fetch roadmap");
  return res.json();
}

export async function getScholarships(): Promise<{
  data: Scholarship[];
  total: number;
}> {
  const res = await fetch(`${API_URL}/career-hub/scholarships`);
  if (!res.ok) throw new Error("Failed to fetch scholarships");
  return res.json();
}
