// services/authService.ts
// Authentication API service

import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { useAuthStore, UserRole } from "@/store/auth";

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  role: UserRole;
  user_id: string;
}

interface AuthError {
  detail: string;
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  role: UserRole = "STUDENT",
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.auth.register}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role, name }),
      }
    );

    if (!response.ok) {
      const error: AuthError = await response.json();
      return { success: false, error: error.detail || "Registration failed" };
    }

    const data: AuthResponse = await response.json();

    // Store auth data
    useAuthStore.getState().setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: data.user_id,
      role: data.role,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Login user
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.login}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      return { success: false, error: error.detail || "Login failed" };
    }

    const data: AuthResponse = await response.json();

    // Store auth data
    useAuthStore.getState().setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: data.user_id,
      role: data.role,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.signout}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: accessToken }),
      });
    } catch (error) {
      console.error("Signout API error:", error);
    }
  }

  // Clear local auth state
  useAuthStore.getState().logout();
}

export default { register, login, logout };
