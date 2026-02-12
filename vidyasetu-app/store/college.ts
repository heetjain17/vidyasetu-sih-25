import { create } from "zustand";
import { college_recommender } from "@/services/logic/college.recommend";
import type { Student, College, WillVector } from "@/services/utils/model2";
import { CollegeRecommendation } from "@/types/college";

type CollegeStore = {
  studentProfile: Student | null;
  colleges: College[];
  studentWill: WillVector;

  rawScores: Record<string, number[]>;
  finalScores: Record<string, number>;
  collegeRecommendations: CollegeRecommendation[];

  setStudentProfile: (p: Student) => void;
  setColleges: (c: College[]) => void;
  setStudentWill: (w: WillVector) => void;

  runRecommendation: () => CollegeRecommendation[];
};

export const useCollegeStore = create<CollegeStore>((set, get) => ({
  studentProfile: null,
  colleges: [],
  studentWill: {
    Importance_Locality: 1,
    Importance_Financial: 1,
    Importance_Eligibility: 1,
    Importance_Events_hobbies: 1,
    Importance_Quality: 1,
  },

  rawScores: {},
  finalScores: {},
  collegeRecommendations: [],

  setStudentProfile: (p) => set({ studentProfile: p }),
  setColleges: (c) => set({ colleges: c }),
  setStudentWill: (w) => set({ studentWill: w }),

  runRecommendation: () => {
    const { studentProfile, studentWill, colleges } = get();
    console.log("🎓 Running college recommendation...");
    console.log("  Student Profile:", studentProfile);
    console.log("  Colleges count:", colleges.length);
    console.log("  Student Will:", studentWill);
    
    if (!studentProfile) {
      console.warn("❌ No student profile found!");
      return [];
    }
    
    if (colleges.length === 0) {
      console.warn("❌ No colleges loaded!");
      return [];
    }

    const { college_match_score, final_scores } = college_recommender(
      studentProfile,
      studentWill,
      colleges
    );

    // Build structured recommendation array
    const recs: CollegeRecommendation[] = Object.keys(final_scores).map(
      (name) => {
        const [locality, financial, eligibility, cultural, quality] =
          college_match_score[name];

        return {
          name,
          finalScore: final_scores[name],
          breakdown: {
            locality,
            financial,
            eligibility,
            cultural,
            quality,
          },
        };
      }
    );

    console.log("  Built recs array:", recs.length, "items");
    console.log("  First rec:", recs[0]);

    // Sort high → low
    recs.sort((a, b) => b.finalScore - a.finalScore);

    console.log("  After sorting, recs:", recs.length);

    set({
      rawScores: college_match_score,
      finalScores: final_scores,
      collegeRecommendations: recs,
    });
    
    console.log("  ✅ Stored in college store, recommendations:", recs.length);
    
    // Return the recs array directly
    return recs;
  },
}));
