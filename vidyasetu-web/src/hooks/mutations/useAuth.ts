import { useMutation, useQueryClient } from "@tanstack/react-query"
import authApi from "@/api/authApi"
import type { RegisterRequest, LoginRequest } from "@/types/api"
import { useAuthStore } from "@/store/authStore"

export function useRegister() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        role: response.role,
      })
    },
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userId: response.user_id,
        role: response.role,
      })
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.signout,
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })
}
