import apiClient from "./client";
import type {
  CollegeListResponse,
  CollegeDetail,
  DistrictsResponse,
} from "@/types/api";

// Get all colleges with optional filters and pagination
export async function getColleges(filters?: {
  district?: string;
  location?: string;
  for_girls?: boolean;
  page?: number;
  limit?: number;
}): Promise<CollegeListResponse> {
  const params = new URLSearchParams();
  if (filters?.district) params.append("district", filters.district);
  if (filters?.location) params.append("location", filters.location);
  if (filters?.for_girls !== undefined)
    params.append("for_girls", String(filters.for_girls));
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));

  const url = `/colleges/${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get<CollegeListResponse>(url);
  return response.data;
}

// Search colleges by name with pagination
export async function searchColleges(
  query: string,
  page: number = 1,
  limit: number = 12
): Promise<CollegeListResponse> {
  const response = await apiClient.get<CollegeListResponse>(
    `/colleges/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  return response.data;
}

// Get college details with courses
export async function getCollegeDetails(name: string): Promise<CollegeDetail> {
  const response = await apiClient.get<CollegeDetail>(
    `/colleges/${encodeURIComponent(name)}`
  );
  return response.data;
}

// Get unique districts for filter
export async function getDistricts(): Promise<DistrictsResponse> {
  const response = await apiClient.get<DistrictsResponse>(
    "/colleges/districts"
  );
  return response.data;
}

export default {
  getColleges,
  searchColleges,
  getCollegeDetails,
  getDistricts,
};
