/**
 * Career Hub API - Fetch study materials, roadmaps, and scholarships
 */

import apiClient from "./client"

export interface StudyMaterial {
  courses: string
  link: string
  duration: string
  materials: string
}

export interface CareerRoadmap {
  id: number
  courses: string
  industry: string
  government_exams: string
  company_names: string
  higher_education: string
}

export interface Scholarship {
  id: number
  scheme: string
  eligibility: string
  benefit: string
  link: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export async function getCourses(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedResponse<StudyMaterial>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  if (search) params.append("search", search)

  const response = await apiClient.get<PaginatedResponse<StudyMaterial>>(
    `/career-hub/courses?${params}`
  )
  return response.data
}

export async function getAllCourses(): Promise<{
  data: StudyMaterial[]
  total: number
}> {
  const response = await apiClient.get<{
    data: StudyMaterial[]
    total: number
  }>("/career-hub/courses/all")
  return response.data
}

export async function getRoadmaps(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedResponse<CareerRoadmap>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  if (search) params.append("search", search)

  const response = await apiClient.get<PaginatedResponse<CareerRoadmap>>(
    `/career-hub/roadmaps?${params}`
  )
  return response.data
}

export async function getAllRoadmaps(): Promise<{
  data: CareerRoadmap[]
  total: number
}> {
  const response = await apiClient.get<{
    data: CareerRoadmap[]
    total: number
  }>("/career-hub/roadmaps/all")
  return response.data
}

export async function getRoadmapById(id: number): Promise<CareerRoadmap> {
  const response = await apiClient.get<CareerRoadmap>(`/career-hub/roadmaps/${id}`)
  return response.data
}

export async function getScholarships(): Promise<{
  data: Scholarship[]
  total: number
}> {
  const response = await apiClient.get<{
    data: Scholarship[]
    total: number
  }>("/career-hub/scholarships")
  return response.data
}

export default {
  getCourses,
  getAllCourses,
  getRoadmaps,
  getAllRoadmaps,
  getRoadmapById,
  getScholarships,
}
