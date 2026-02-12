import {
  normalizeStudentWillVector,
  manualEmbedFromTokens,
} from "@/services/utils/model2";

import {
  localityMatchScore,
  financialMatchScore,
  eligibilityMatchScore,
  culturalMatchScore,
  qualityScore,
  finalCollegeMatchScore,
} from "@/services/utils/score";

import type { Student, College, WillVector } from "@/services/utils/model2";

// Main Recommender (pure synchronous)
export function college_recommender(
  student: Student,
  studentWill: WillVector,
  colleges: College[]
) {
  console.log("🔬 Inside college_recommender");
  console.log("  Student:", student);
  console.log("  Colleges to process:", colleges.length);
  
  // CATEGORY keyword lists (simple tokens)
  const CATEGORY_TEXT: Record<string, string[]> = {
    cultural: ["music", "dance", "art", "painting", "theatre", "singing"],
    sport: ["football", "cricket", "running", "basketball"],
    technical: ["coding", "programming", "robotics", "ai"],
    others: ["charity", "volunteering", "socialwork"],
  };

  // Build embeddings for each category
  const CATEGORY_EMB: Record<string, number[]> = {};
  for (const cat of Object.keys(CATEGORY_TEXT)) {
    CATEGORY_EMB[cat] = manualEmbedFromTokens(CATEGORY_TEXT[cat]);
  }

  // Stage 1: compute individual match aspects
  const college_match_score: Record<string, number[]> = {};

  for (const college of colleges) {
    const localityScore = Number(
      localityMatchScore(student, college).toFixed(4)
    );

    const financeScore = Number(
      financialMatchScore(student, college).toFixed(4)
    );

    const eligibilityScore = Number(
      eligibilityMatchScore(student, college).toFixed(4)
    );

    const culturalScore = Number(
      culturalMatchScore(student, college, CATEGORY_EMB, CATEGORY_TEXT).toFixed(
        4
      )
    );

    const qualityScoreVal = Number(qualityScore(college).toFixed(4));

    // Order = matches what studentWill weights expect
    college_match_score[college.Name] = [
      localityScore,
      financeScore,
      eligibilityScore,
      culturalScore,
      qualityScoreVal,
    ];
  }

  console.log("  College match scores computed:", Object.keys(college_match_score).length);

  // Stage 2: normalize student willingness vector
  const normalizedStudentWill = normalizeStudentWillVector(studentWill);
  console.log("  Normalized student will:", normalizedStudentWill);

  // Stage 3: produce final weighted scores
  const final_scores: Record<string, number> = {};

  for (const collegeName in college_match_score) {
    const metrics = college_match_score[collegeName];
    final_scores[collegeName] = Number(
      finalCollegeMatchScore(normalizedStudentWill, metrics).toFixed(4)
    );
  }

  console.log("  Final scores:", final_scores);
  console.log("  Total recommendations:", Object.keys(final_scores).length);

  return {
    college_match_score,
    final_scores,
  };
}
