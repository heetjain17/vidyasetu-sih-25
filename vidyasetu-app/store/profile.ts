import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// J&K Districts for locality dropdown
export const LOCALITIES = [
  "Srinagar",
  "Jammu",
  "Anantnag",
  "Baramulla",
  "Pulwama",
  "Kupwara",
  "Budgam",
  "Ganderbal",
  "Bandipora",
  "Shopian",
  "Kulgam",
  "Doda",
  "Kishtwar",
  "Ramban",
  "Reasi",
  "Udhampur",
  "Kathua",
  "Samba",
  "Poonch",
  "Rajouri",
] as const;

export const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"] as const;
export const GENDERS = ["Male", "Female"] as const;

// Profile data matching web's ProfileData interface
export interface ProfileData {
  // Basic info
  fullName: string;
  gender: string;
  district: string;
  category: string;
  budget: number;
  grade?: string;
  board?: string;

  // Interests (arrays)
  extracurriculars: string[];
  hobbies: string[];

  // Preferences (1-5 scale)
  importanceLocality: number;
  importanceFinancial: number;
  importanceEligibility: number;
  importanceEventsHobbies: number;
  importanceQuality: number;

  // Status
  isProfileComplete: boolean;
}

// Backend API format for StudentActual
export interface StudentActual {
  Extra_curriculars: string[];
  Hobbies: string[];
  Student_Locality: string;
  Gender: string;
  Students_Category: string;
  Budget: number;
}

// Backend API format for StudentPreferences
export interface StudentPreferences {
  Importance_Locality: number;
  Importance_Financial: number;
  Importance_Eligibility: number;
  Importance_Events_hobbies: number;
  Importance_Quality: number;
}

interface ProfileStore {
  profile: ProfileData;
  setProfile: (profile: Partial<ProfileData>) => void;
  updateProfile: (updates: Partial<ProfileData>) => void;
  clearProfile: () => void;
  markProfileComplete: () => void;

  // Utility functions for API format
  getStudentActual: () => StudentActual;
  getStudentPreferences: () => StudentPreferences;
}

const initialProfile: ProfileData = {
  fullName: "",
  gender: "",
  district: "",
  category: "",
  budget: 100000,
  grade: "",
  board: "",
  extracurriculars: [],
  hobbies: [],
  importanceLocality: 3,
  importanceFinancial: 3, // Default to 3 (Somewhat Important)
  importanceEligibility: 3,
  importanceEventsHobbies: 3,
  importanceQuality: 3,
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
          Student_Locality: profile.district.toLowerCase(),
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
