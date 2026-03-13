import apiClient from "./client"
import type {
  RecommenderRequest,
  RecommenderResponse,
  TranslateRequest,
  TranslateResponse,
} from "@/types/api"

// Get career and college recommendations (public, no save)
export async function getRecommendations(
  request: RecommenderRequest
): Promise<RecommenderResponse> {
  const response = await apiClient.post<RecommenderResponse>("/recommend/", request)
  return response.data
}

// Get recommendations AND save to database (authenticated)
export async function getRecommendationsAndSave(
  request: RecommenderRequest,
  accessToken: string
): Promise<RecommenderResponse> {
  const response = await apiClient.post<RecommenderResponse>("/recommend/full", request, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.data
}

// Translate text on-demand (when user switches language)
export async function translateText(
  text: string,
  targetLanguage: "hindi" | "urdu" | "kashmiri" | "dogri"
): Promise<string> {
  const response = await apiClient.post<TranslateResponse>("/recommend/translate", {
    text,
    target_language: targetLanguage,
  } as TranslateRequest)
  return response.data.translation
}

export default {
  getRecommendations,
  getRecommendationsAndSave,
  translateText,
}
