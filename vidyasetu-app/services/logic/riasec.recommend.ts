import paramToRIASEC from "@/services/assets/testparam_to_riasec_weights.json";
import careerWeights from "@/services/assets/riasec_score_to_career_weights.json";
import careerCourseList from "@/services/assets/Career_to_course.json";
import courseCollegeList from "@/services/assets/Course_to_college.json";

import {
  UserParamScores,
  RIASECScore,
  NormalizedRIASEC,
  CareerRecommendation,
} from "../../types";

const TRAITS = [
  "Realistic",
  "Investigative",
  "Artistic",
  "Social",
  "Enterprising",
  "Conventional",
] as const;

const PARAMS = [
  "Logical",
  "Quant",
  "Analytical",
  "Verbal",
  "Spatial",
  "Creativity",
  "Enterpreneurial",
] as const;

/*
=====================================================
  Compute RIASEC scores from user parameters
=====================================================
*/
export function computeRIASEC(params: UserParamScores): RIASECScore {
  const result: any = {};

  TRAITS.forEach((trait) => {
    let total = 0;
    PARAMS.forEach((p) => {
      const weight = (paramToRIASEC as any)[trait][p] || 0;
      const value = (params as any)[p] || 0;
      total += value * weight;
    });
    result[trait] = total;
  });

  return result as RIASECScore;
}

/*
=====================================================
  Normalize RIASEC vector
=====================================================
*/
export function normalizeRIASEC(raw: RIASECScore): NormalizedRIASEC {
  const sum = TRAITS.reduce((s, t) => s + raw[t], 0);

  const norm: any = {};
  TRAITS.forEach((t) => {
    norm[t] = raw[t] / (sum || 1);
  });

  return norm as NormalizedRIASEC;
}

/*
=====================================================
  Cosine similarity between two RIASEC vectors
=====================================================
*/
function cosineSimilarity(vecA: NormalizedRIASEC, vecB: any): number {
  let dot = 0,
    magA = 0,
    magB = 0;

  TRAITS.forEach((t) => {
    const a = vecA[t];
    const b = vecB[t];
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/*
=====================================================
  Get career recommendations based on user scores
=====================================================
*/
export function getRecommendations(
  params: UserParamScores,
  limit = 10
): CareerRecommendation[] {
  const riasecRaw = computeRIASEC(params);
  const studentVector = normalizeRIASEC(riasecRaw);

  const results = careerWeights.map((cw: any) => ({
    title: cw.title || cw.Title,
    score: cosineSimilarity(studentVector, cw),
  }));

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/*
=====================================================
  Map careers to courses
=====================================================
*/
export interface CareerCourseMapping {
  career: string;
  courses: string[];
}

export function careerToCourse(scores: UserParamScores): CareerCourseMapping[] {
  const selectedCareers = getRecommendations(scores, 10).map((c) => c.title);

  const result: CareerCourseMapping[] = [];
  for (const career of selectedCareers) {
    const courses = (careerCourseList as any)[career];
    if (!courses || courses.length === 0) continue; // skip missing
    result.push({ career, courses });
  }

  return result;
}

/*
=====================================================
  Map courses to colleges
=====================================================
*/
export interface CourseCollegeMapping {
  course: string;
  colleges: string[];
}

export function courseToCollege(
  scores: UserParamScores
): CourseCollegeMapping[] {
  const courseObjects = careerToCourse(scores); // [{career, courses: [...] }]

  const result: CourseCollegeMapping[] = [];
  for (const obj of courseObjects) {
    for (const course of obj.courses) {
      const colleges = (courseCollegeList as any)[course];
      if (!colleges || colleges.length === 0) continue; // skip missing
      result.push({ course, colleges });
    }
  }

  return result;
}

export default {
  computeRIASEC,
  normalizeRIASEC,
  cosineSimilarity,
  getRecommendations,
  careerToCourse,
  courseToCollege,
};
