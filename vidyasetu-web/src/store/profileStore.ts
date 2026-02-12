import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudentActual, StudentPreferences } from "@/types/api";

// =====================================================
// Profile Data - matches backend API format
// =====================================================

export interface ProfileData {
  // === Student Actual (for backend) ===
  fullName: string;
  gender: string; // "Male" | "Female"
  locality: string; // Student_Locality
  category: string; // Students_Category: "General" | "OBC" | "SC" | "ST" | "EWS"
  budget: number; // Annual budget in INR
  extracurriculars: string[]; // Extra_curriculars
  hobbies: string[]; // Hobbies array

  // === Student Preferences (1-5 scale) ===
  importanceLocality: number;
  importanceFinancial: number;
  importanceEligibility: number;
  importanceEventsHobbies: number;
  importanceQuality: number;

  // === App-specific fields ===
  email?: string;
  grade?: string;
  board?: string;
  isProfileComplete: boolean;
}

interface ProfileStore {
  profile: ProfileData;
  setProfile: (profile: Partial<ProfileData>) => void;
  updateProfile: (updates: Partial<ProfileData>) => void;
  clearProfile: () => void;
  markProfileComplete: () => void;

  // Utility functions to convert to API format
  getStudentActual: () => StudentActual;
  getStudentPreferences: () => StudentPreferences;
}

const initialProfile: ProfileData = {
  // Student Actual
  fullName: "",
  gender: "",
  locality: "",
  category: "",
  budget: 100000,
  extracurriculars: [],
  hobbies: [],

  // Student Preferences (default: all medium importance)
  importanceLocality: 0,
  importanceFinancial: 0,
  importanceEligibility: 0,
  importanceEventsHobbies: 0,
  importanceQuality: 0,

  // App-specific
  email: "",
  grade: "",
  board: "",
  isProfileComplete: false,
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: initialProfile,

      setProfile: (profile) =>
        set(() => ({
          profile: { ...initialProfile, ...profile },
        })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      clearProfile: () =>
        set(() => ({
          profile: initialProfile,
        })),

      markProfileComplete: () =>
        set((state) => ({
          profile: { ...state.profile, isProfileComplete: true },
        })),

      // Convert profile to backend StudentActual format
      getStudentActual: (): StudentActual => {
        const { profile } = get();
        return {
          Extra_curriculars: profile.extracurriculars,
          Hobbies: profile.hobbies,
          Student_Locality: profile.locality.toLowerCase(),
          Gender: profile.gender,
          Students_Category: profile.category,
          Budget: profile.budget,
        };
      },

      // Convert profile to backend StudentPreferences format
      getStudentPreferences: (): StudentPreferences => {
        const { profile } = get();
        return {
          Importance_Locality: profile.importanceLocality,
          Importance_Financial: profile.importanceFinancial,
          Importance_Eligibility: profile.importanceEligibility,
          Importance_Events_hobbies: profile.importanceEventsHobbies,
          Importance_Quality: profile.importanceQuality,
        };
      },
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
