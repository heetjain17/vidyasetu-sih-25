import { useMutation, useQueryClient } from "@tanstack/react-query"
import { login, register, signout, getOAuthUrl } from "@/api/authApi"
import { getStudentProfile } from "@/api/profileApi"
import { useAuthStore } from "@/store/authStore"
import { useProfileStore } from "@/store/profileStore"
import type { LoginRequest, RegisterRequest } from "@/types/api"

// =====================================================
// Auth Query Hooks - with Role Support
// =====================================================

/**
 * Hook for user login
 * Sets access token, refresh token, user ID, and role in auth store
 * Fetches profile to restore is_profile_complete status
 */
export function useLogin() {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { updateProfile, markProfileComplete } = useProfileStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (response) => {
      setAuth({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        role: response.role,
      })
      queryClient.invalidateQueries({ queryKey: ["user"] })

      // Fetch profile to get is_profile_complete status
      if (response.role === "STUDENT") {
        try {
          const profile = await getStudentProfile()
          if (profile.is_profile_complete) {
            updateProfile({
              fullName: profile.full_name || "",
              gender: profile.gender || "",
              locality: profile.locality || "",
              category: profile.category || "",
              budget: profile.budget || 100000,
              extracurriculars: profile.extracurriculars || [],
              hobbies: profile.hobbies || [],
              importanceLocality: profile.importance_locality || 0,
              importanceFinancial: profile.importance_financial || 0,
              importanceEligibility: profile.importance_eligibility || 0,
              importanceEventsHobbies: profile.importance_events_hobbies || 0,
              importanceQuality: profile.importance_quality || 0,
            })
            markProfileComplete()
          }
        } catch (error) {
          // Profile doesn't exist yet, user needs to complete it
          console.error("Failed to fetch profile:", error)
        }
      }
    },
  })
}

/**
 * Hook for user registration
 * Sets access token, refresh token, user ID, and role in auth store
 */
export function useRegister() {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (response) => {
      setAuth({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        role: response.role,
      })
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

/**
 * Hook for user signout
 */
export function useSignout() {
  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: () => signout(accessToken || ""),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
    onError: () => {
      // Even on error, clear local state
      logout()
      queryClient.clear()
    },
  })
}

/**
 * Hook to get OAuth URL
 */
export function useOAuthUrl() {
  return useMutation({
    mutationFn: (provider: "google" | "github") => getOAuthUrl(provider),
    onSuccess: (url) => {
      // Redirect to OAuth provider
      window.location.href = url
    },
  })
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: "STUDENT" | "PARENT" | "COLLEGE"): boolean {
  const userRole = useAuthStore((state) => state.role)
  return userRole === role
}

/**
 * Hook to get current user's role
 */
export function useUserRole() {
  return useAuthStore((state) => state.role)
}
