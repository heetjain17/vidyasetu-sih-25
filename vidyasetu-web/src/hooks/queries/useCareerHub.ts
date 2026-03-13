import { useQuery } from "@tanstack/react-query"
import careerHubApi from "@/api/careerHubApi"

export const careerHubKeys = {
  all: ["careerHub"] as const,
  courses: (page?: number, limit?: number, search?: string) =>
    [...careerHubKeys.all, "courses", { page, limit, search }] as const,
  roadmaps: (page?: number, limit?: number, search?: string) =>
    [...careerHubKeys.all, "roadmaps", { page, limit, search }] as const,
  scholarships: (page?: number, limit?: number, search?: string) =>
    [...careerHubKeys.all, "scholarships", { page, limit, search }] as const,
}

export function useCareerCourses(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: careerHubKeys.courses(page, limit, search),
    queryFn: () => careerHubApi.getCourses(page, limit, search),
  })
}

export function useCareerRoadmaps(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: careerHubKeys.roadmaps(page, limit, search),
    queryFn: () => careerHubApi.getRoadmaps(page, limit, search),
  })
}

export function useScholarships(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: careerHubKeys.scholarships(page, limit, search),
    queryFn: () => careerHubApi.getScholarships(),
  })
}
