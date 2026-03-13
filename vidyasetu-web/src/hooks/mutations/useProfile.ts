import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateStudentProfile, type StudentProfileUpdate } from "@/api/profileApi"

export const profileKeys = {
  all: ["profile"] as const,
  student: (userId: string) => [...profileKeys.all, "student", userId] as const,
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StudentProfileUpdate) => updateStudentProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}

export function useStudentProfile(userId: string) {
  const queryClient = useQueryClient()

  return {
    data: queryClient.getQueryData(profileKeys.student(userId)),
    refetch: () => queryClient.invalidateQueries({ queryKey: profileKeys.student(userId) }),
  }
}
