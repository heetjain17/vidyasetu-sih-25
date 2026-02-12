import apiClient from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  OAuthUrlResponse,
} from "@/types/api";

// =====================================================
// Auth API Service
// =====================================================

/**
 * Register a new user with email and password
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);
  return response.data;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data;
}

/**
 * Get OAuth login URL for a provider (google, github)
 */
export async function getOAuthUrl(
  provider: "google" | "github"
): Promise<string> {
  const response = await apiClient.get<OAuthUrlResponse>(
    `/auth/oauth/${provider}`
  );
  return response.data.url;
}

/**
 * Sign out the current user
 */
export async function signout(token: string): Promise<void> {
  await apiClient.post("/auth/signout", null, {
    params: { token },
  });
}

export default {
  register,
  login,
  getOAuthUrl,
  signout,
};
