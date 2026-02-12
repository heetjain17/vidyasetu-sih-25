// =====================================================
// Auth Types
// =====================================================

/** User role enum matching backend */
export type UserRole = "STUDENT" | "PARENT" | "COLLEGE";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole; // Defaults to STUDENT on backend
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  role: UserRole;
  user_id: string;
}

export interface OAuthUrlResponse {
  url: string;
}

// =====================================================
// Recommendation Types
// =====================================================

/** Aptitude scores from the quiz (7 dimensions) */
export interface RecommenderScores {
  Logical_reasoning: number;
  Quantitative_reasoning: number;
  Analytical_reasoning: number;
  Verbal_reasoning: number;
  Spatial_reasoning: number;
  Creativity: number;
  Enter: number;
  language?: string;
}

/** Student's actual profile data for college matching */
export interface StudentActual {
  Extra_curriculars: string[];
  Hobbies: string[];
  Student_Locality: string;
  Gender: string;
  Students_Category: string;
  Budget: number;
}

/** Student's preference weights (0-5 scale) */
export interface StudentPreferences {
  Importance_Locality: number;
  Importance_Financial: number;
  Importance_Eligibility: number;
  Importance_Events_hobbies: number;
  Importance_Quality: number;
}

export interface RecommenderRequest {
  scores: RecommenderScores;
  student_actual: StudentActual;
  student_preferences: StudentPreferences;
}

/** Career with English explanation (translate on-demand) */
export interface CareerExplanation {
  career: string;
  explanation: string; // English only
}

export interface CollegeRecommendation {
  name: string;
  score: number;
}

export interface RecommenderResponse {
  riasec_scores: number[];
  top_careers: string[];
  recommended_colleges: CollegeRecommendation[];
  career_explanations: CareerExplanation[]; // English only
  college_explanations: Record<string, string>; // English only
  // Optional fields (kept for backwards compatibility)
  career_courses?: { career: string; courses: string[] }[];
  course_colleges?: { course: string; colleges: string[] }[];
  unique_colleges?: string[];
  college_components?: Record<string, number[]>;
}

// =====================================================
// Translation Types
// =====================================================

export interface TranslateRequest {
  text: string;
  target_language: "hindi" | "urdu" | "kashmiri" | "dogri";
}

export interface TranslateResponse {
  translation: string;
}

// =====================================================
// Data API Types
// =====================================================

export interface Career {
  id: string;
  title: string;
  description?: string;
}

export interface College {
  id: string;
  name: string;
  location?: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
}

// =====================================================
// College Explorer Types
// =====================================================

export interface CollegeListItem {
  name: string;
  district: string;
  state: string;
  location: string;
  year_of_establishment: number | null;
  college_type: string;
  for_girls: boolean;
  website: string;
}

export interface CollegeDetail extends CollegeListItem {
  aishe_code: string;
  management: string;
  university_name: string;
  courses_offered: string[];
  total_courses: number;
}

export interface CollegeListResponse {
  colleges: CollegeListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DistrictsResponse {
  districts: string[];
}

// =====================================================
// Roadmap Template Types
// =====================================================

export interface RoadmapSemester {
  year1: string[];
  year2: string[];
  year3: string[];
}

export interface RoadmapTemplate {
  id: number;
  title: string;
  semester: RoadmapSemester;
  internships: string[];
  exams: string[];
  certifications: string[];
  upscaling: string[];
}

export interface RoadmapsResponse {
  roadmaps: RoadmapTemplate[];
}
