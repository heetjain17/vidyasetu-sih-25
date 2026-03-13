import { useQuery } from "@tanstack/react-query"
import collegesApi from "@/api/collegesApi"

export const collegeKeys = {
  all: ["colleges"] as const,
  lists: () => [...collegeKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>, page?: number, limit?: number) =>
    [...collegeKeys.lists(), { filters, page, limit }] as const,
  search: (query: string, page?: number, limit?: number) =>
    [...collegeKeys.all, "search", query, page, limit] as const,
  details: () => [...collegeKeys.all, "detail"] as const,
  detail: (name: string) => [...collegeKeys.details(), name] as const,
  districts: () => [...collegeKeys.all, "districts"] as const,
}

export function useColleges(filters?: {
  district?: string
  location?: string
  for_girls?: boolean
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: collegeKeys.list(filters),
    queryFn: () => collegesApi.getColleges(filters),
  })
}

export function useSearchColleges(query: string, page = 1, limit = 12, enabled = true) {
  return useQuery({
    queryKey: collegeKeys.search(query, page, limit),
    queryFn: () => collegesApi.searchColleges(query, page, limit),
    enabled: enabled && query.length > 0,
  })
}

export function useCollege(collegeName: string, enabled = true) {
  return useQuery({
    queryKey: collegeKeys.detail(collegeName),
    queryFn: () => collegesApi.getCollegeDetails(collegeName),
    enabled: enabled && !!collegeName,
  })
}

export function useDistricts() {
  return useQuery({
    queryKey: collegeKeys.districts(),
    queryFn: collegesApi.getDistricts,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
