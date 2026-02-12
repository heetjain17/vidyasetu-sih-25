import apiClient from "./client";

// Types for chatbot responses
export interface CollegeCard {
  college: string;
  district: string;
  course?: string;
  hostel?: string;
  fees?: string;
}

export interface CareerCard {
  career: string;
  courses: string[];
  colleges: string[];
}

export interface FuturisticCareerItem {
  title: string;
  description?: string;
  why_suitable?: string;
  skills_needed?: string[];
  getting_started?: string[];
  future_demand?: string;
  salary_potential?: string;
}

export interface FuturisticCareerResponse {
  success: boolean;
  careers: FuturisticCareerItem[];
  answer_text?: string;
  note?: string;
  error?: string;
}

export interface ChatbotResponse {
  answer: string;
  sources?: Record<string, unknown>[];
  colleges?: CollegeCard[];
  career_cards?: CareerCard[];
  futuristic_careers?: FuturisticCareerItem[];
  is_futuristic_query?: boolean;
}

export interface ChatbotHealthResponse {
  qdrant: string;
  ollama: string;
}

/**
 * Send a question to the chatbot (REST endpoint)
 * Use this as a fallback when WebSocket is not available
 */
export const askChatbot = async (
  question: string
): Promise<ChatbotResponse> => {
  const response = await apiClient.post<ChatbotResponse>("/chatbot/ask", {
    question,
  });
  return response.data;
};

/**
 * Generate futuristic career suggestions
 */
export const generateFuturisticCareers = async (
  interests: string
): Promise<FuturisticCareerResponse> => {
  const response = await apiClient.post<FuturisticCareerResponse>(
    "/chatbot/futuristic-careers",
    {
      interests,
      num_careers: 4,
    }
  );
  return response.data;
};

/**
 * Check chatbot health status
 */
export const getChatbotHealth = async (): Promise<ChatbotHealthResponse> => {
  const response =
    await apiClient.get<ChatbotHealthResponse>("/chatbot/health");
  return response.data;
};

/**
 * Get WebSocket URL for streaming chat
 */
export const getChatbotWebSocketUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const wsUrl = baseUrl.replace(/^http/, "ws");
  return `${wsUrl}/chatbot/ws`;
};
