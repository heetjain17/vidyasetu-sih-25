import { apiClient } from "./client";

// ============================================================
// Student Profile API
// ============================================================

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  phone?: string;
  locality?: string;
  district?: string;
  state?: string;
  category?: string;
  grade?: string;
  board?: string;
  school_name?: string;
  budget?: number;
  extracurriculars?: string[];
  hobbies?: string[];
  importance_locality?: number;
  importance_financial?: number;
  importance_eligibility?: number;
  importance_events_hobbies?: number;
  importance_quality?: number;
  is_profile_complete?: boolean;
  invite_code?: string;
}

export interface StudentProfileUpdate {
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  phone?: string;
  locality?: string;
  district?: string;
  state?: string;
  category?: string;
  grade?: string;
  board?: string;
  school_name?: string;
  budget?: number;
  extracurriculars?: string[];
  hobbies?: string[];
  importance_locality?: number;
  importance_financial?: number;
  importance_eligibility?: number;
  importance_events_hobbies?: number;
  importance_quality?: number;
}

/**
 * Get current student's profile
 */
export async function getStudentProfile(): Promise<StudentProfile> {
  const response = await apiClient.get<StudentProfile>("/profile/student");
  return response.data;
}

/**
 * Update current student's profile
 */
export async function updateStudentProfile(
  data: StudentProfileUpdate
): Promise<StudentProfile> {
  const response = await apiClient.put<StudentProfile>(
    "/profile/student",
    data
  );
  return response.data;
}
