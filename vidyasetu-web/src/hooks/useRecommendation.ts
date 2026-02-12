import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getRecommendations,
  getRecommendationsAndSave,
} from "@/api/recommendApi";
import { getCareers, getColleges, getCourses } from "@/api/dataApi";
import type { RecommenderRequest } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

// =====================================================
// Recommendation Query Hooks
// =====================================================

/**
 * Mutation hook for getting recommendations (public, no save)
 * Use this when user is not authenticated
 */
export function useRecommendation() {
  return useMutation({
    mutationFn: (request: RecommenderRequest) => getRecommendations(request),
    mutationKey: ["recommendations"],
  });
}

/**
 * Mutation hook for getting recommendations AND saving to database
 * Use this when user is authenticated
 */
export function useAuthenticatedRecommendation() {
  const accessToken = useAuthStore.getState().accessToken;

  return useMutation({
    mutationFn: (request: RecommenderRequest) => {
      if (accessToken) {
        return getRecommendationsAndSave(request, accessToken);
      }
      // Fallback to public endpoint if no token
      return getRecommendations(request);
    },
    mutationKey: ["recommendations", "authenticated"],
  });
}

/**
 * Query hook for fetching all careers
 */
export function useCareers() {
  return useQuery({
    queryKey: ["careers"],
    queryFn: getCareers,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Query hook for fetching all colleges
 */
export function useColleges() {
  return useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Query hook for fetching all courses
 */
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
