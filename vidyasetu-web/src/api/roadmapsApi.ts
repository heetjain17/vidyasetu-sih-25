import type { RoadmapTemplate, RoadmapsResponse } from "@/types/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getRoadmaps(): Promise<RoadmapsResponse> {
  const response = await fetch(`${API_BASE}/roadmaps/`);
  if (!response.ok) {
    throw new Error("Failed to fetch roadmaps");
  }
  return response.json();
}

export async function getRoadmapById(id: number): Promise<RoadmapTemplate> {
  const response = await fetch(`${API_BASE}/roadmaps/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch roadmap");
  }
  return response.json();
}
