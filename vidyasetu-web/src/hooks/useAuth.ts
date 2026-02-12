import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register, signout, getOAuthUrl } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import type { LoginRequest, RegisterRequest } from "@/types/api";

// =====================================================
// Auth Query Hooks - with Role Support
// =====================================================

/**
 * Hook for user login
 * Sets access token, refresh token, user ID, and role in auth store
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      setAuth({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        role: response.role,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Hook for user registration
 * Sets access token, refresh token, user ID, and role in auth store
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (response) => {
      setAuth({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        role: response.role,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Hook for user signout
 */
export function useSignout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: () => signout(accessToken || ""),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: () => {
      // Even on error, clear local state
      logout();
      queryClient.clear();
    },
  });
}

/**
 * Hook to get OAuth URL
 */
export function useOAuthUrl() {
  return useMutation({
    mutationFn: (provider: "google" | "github") => getOAuthUrl(provider),
    onSuccess: (url) => {
      // Redirect to OAuth provider
      window.location.href = url;
    },
  });
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: "STUDENT" | "PARENT" | "COLLEGE"): boolean {
  const userRole = useAuthStore((state) => state.role);
  return userRole === role;
}

/**
 * Hook to get current user's role
 */
export function useUserRole() {
  return useAuthStore((state) => state.role);
}
