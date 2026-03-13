import apiClient from "./client"
import type { Career, College, Course } from "@/types/api"

// Data API Service

export interface CourseCollegeMapping {
  id: string
  course_name: string
  college_name: string
}

export interface RoadmapData {
  id: string
  course: string
  years: number
  internships: number
  placements: number
  upscaling: string
}

export interface CollegeFacility {
  id: string
  college_name: string
  [key: string]: unknown
}

/**
 * Get all careers from the database
 */
export async function getCareers(): Promise<Career[]> {
  const response = await apiClient.get<Career[]>("/data/careers")
  return response.data
}

/**
 * Get all colleges from the database
 */
export async function getColleges(): Promise<College[]> {
  const response = await apiClient.get<College[]>("/data/college-list")
  return response.data
}

/**
 * Get all courses from the database
 */
export async function getCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>("/data/courses")
  return response.data
}

/**
 * Get course-college mappings
 */
export async function getCourseCollegeMappings(): Promise<CourseCollegeMapping[]> {
  const response = await apiClient.get<CourseCollegeMapping[]>("/data/course-college")
  return response.data
}

/**
 * Get roadmap data
 */
export async function getRoadmap(): Promise<RoadmapData[]> {
  const response = await apiClient.get<RoadmapData[]>("/data/roadmap")
  return response.data
}

/**
 * Get college facilities data
 */
export async function getCollegeFacilities(): Promise<CollegeFacility[]> {
  const response = await apiClient.get<CollegeFacility[]>("/data/college-facilities")
  return response.data
}

export default {
  getCareers,
  getColleges,
  getCourses,
  getCourseCollegeMappings,
  getRoadmap,
  getCollegeFacilities,
}
