import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole } from "@/types/api";

// =====================================================
// Auth Store - with Role Support (sessionStorage for multi-tab)
// =====================================================

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (data: {
    accessToken: string;
    refreshToken?: string;
    userId: string;
    role: UserRole;
  }) => void;
  logout: () => void;
  checkAuth: () => boolean;
  isStudent: () => boolean;
  isParent: () => boolean;
  isCollege: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      role: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, refreshToken, userId, role }) =>
        set({
          accessToken,
          refreshToken: refreshToken || null,
          userId,
          role,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          role: null,
          isAuthenticated: false,
        }),

      checkAuth: () => {
        const { accessToken } = get();
        return !!accessToken;
      },

      isStudent: () => get().role === "STUDENT",
      isParent: () => get().role === "PARENT",
      isCollege: () => get().role === "COLLEGE",
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
