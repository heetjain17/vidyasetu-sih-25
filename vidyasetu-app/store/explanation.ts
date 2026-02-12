import { create } from "zustand";
import type {
  CareerExplanation,
  CollegeExplanation,
} from "@/services/utils/explanation";

type ExplanationStore = {
  careerExplanations: CareerExplanation[];
  collegeExplanations: CollegeExplanation[];

  setCareerExplanations: (e: CareerExplanation[]) => void;
  setCollegeExplanations: (e: CollegeExplanation[]) => void;
  reset: () => void;
};

export const useExplanationStore = create<ExplanationStore>((set) => ({
  careerExplanations: [],
  collegeExplanations: [],

  setCareerExplanations: (e) => set({ careerExplanations: e }),
  setCollegeExplanations: (e) => set({ collegeExplanations: e }),
  reset: () =>
    set({
      careerExplanations: [],
      collegeExplanations: [],
    }),
}));
