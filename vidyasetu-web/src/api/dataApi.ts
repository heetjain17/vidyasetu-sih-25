import apiClient from "./client";
import type { Career, College, Course } from "@/types/api";

// Data API Service

/**
 * Get all careers from the database
 */
export async function getCareers(): Promise<Career[]> {
  const response = await apiClient.get<Career[]>("/data/careers");
  return response.data;
}

/**
 * Get all colleges from the database
 */
export async function getColleges(): Promise<College[]> {
  const response = await apiClient.get<College[]>("/data/college-list");
  return response.data;
}

/**
 * Get all courses from the database
 */
export async function getCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>("/data/courses");
  return response.data;
}

/**
 * Get course-college mappings
 */
export async function getCourseCollegeMappings(): Promise<unknown[]> {
  const response = await apiClient.get("/data/course-college");
  return response.data;
}

/**
 * Get roadmap data
 */
export async function getRoadmap(): Promise<unknown[]> {
  const response = await apiClient.get("/data/roadmap");
  return response.data;
}

export default {
  getCareers,
  getColleges,
  getCourses,
  getCourseCollegeMappings,
  getRoadmap,
};
