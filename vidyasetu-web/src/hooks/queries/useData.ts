import { useQuery } from "@tanstack/react-query"
import dataApi from "@/api/dataApi"

export const dataKeys = {
  all: ["data"] as const,
  careers: () => [...dataKeys.all, "careers"] as const,
  colleges: () => [...dataKeys.all, "colleges"] as const,
  courses: () => [...dataKeys.all, "courses"] as const,
  courseMappings: () => [...dataKeys.all, "course-mappings"] as const,
  roadmaps: () => [...dataKeys.all, "roadmaps"] as const,
  facilities: () => [...dataKeys.all, "facilities"] as const,
}

export function useCareers() {
  return useQuery({
    queryKey: dataKeys.careers(),
    queryFn: dataApi.getCareers,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCollegeList() {
  return useQuery({
    queryKey: dataKeys.colleges(),
    queryFn: dataApi.getColleges,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCourses() {
  return useQuery({
    queryKey: dataKeys.courses(),
    queryFn: dataApi.getCourses,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCourseMappings() {
  return useQuery({
    queryKey: dataKeys.courseMappings(),
    queryFn: dataApi.getCourseCollegeMappings,
    staleTime: 1000 * 60 * 10,
  })
}

export function useRoadmaps() {
  return useQuery({
    queryKey: dataKeys.roadmaps(),
    queryFn: dataApi.getRoadmap,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCollegeFacilities() {
  return useQuery({
    queryKey: dataKeys.facilities(),
    queryFn: dataApi.getCollegeFacilities,
    staleTime: 1000 * 60 * 10,
  })
}
