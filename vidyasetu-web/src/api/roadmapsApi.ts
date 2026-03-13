import apiClient from "./client"
import type { RoadmapTemplate, RoadmapsResponse } from "@/types/api"

export async function getRoadmaps(): Promise<RoadmapsResponse> {
  const response = await apiClient.get<RoadmapsResponse>("/roadmaps/")
  return response.data
}

export async function getRoadmapById(id: number): Promise<RoadmapTemplate> {
  const response = await apiClient.get<RoadmapTemplate>(`/roadmaps/${id}`)
  return response.data
}

export default {
  getRoadmaps,
  getRoadmapById,
}
