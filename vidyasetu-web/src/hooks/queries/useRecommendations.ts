import { useQuery, useMutation } from "@tanstack/react-query"
import recommendApi from "@/api/recommendApi"
import type { RecommenderRequest } from "@/types/api"
import { useAuthStore } from "@/store/authStore"

export const recommendKeys = {
  all: ["recommendations"] as const,
  basic: (request: RecommenderRequest) => [...recommendKeys.all, "basic", request] as const,
  full: (request: RecommenderRequest) => [...recommendKeys.all, "full", request] as const,
}

export function useRecommendations(request: RecommenderRequest, enabled = true) {
  return useQuery({
    queryKey: recommendKeys.basic(request),
    queryFn: () => recommendApi.getRecommendations(request),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useFullRecommendations(request: RecommenderRequest, enabled = true) {
  const { accessToken } = useAuthStore()

  return useQuery({
    queryKey: recommendKeys.full(request),
    queryFn: () => recommendApi.getRecommendationsAndSave(request, accessToken || ""),
    enabled: enabled && !!accessToken,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTranslateText() {
  return useMutation({
    mutationFn: (data: { text: string; targetLanguage: "hindi" | "urdu" | "kashmiri" | "dogri" }) =>
      recommendApi.translateText(data.text, data.targetLanguage),
  })
}
