// services/data/hooks/useCareers.ts
// Hooks for career data - reads directly from JSON files instead of database

import { useState, useEffect, useMemo } from "react";
import careerWeights from "@/services/assets/riasec_score_to_career_weights.json";
import careerCourseList from "@/services/assets/Career_to_course.json";

// Type for career data (matching RIASEC JSON structure)
interface RIASECCareer {
  Title: string;
  Realistic: number;
  Investigative: number;
  Artistic: number;
  Social: number;
  Enterprising: number;
  Conventional: number;
  desc?: string;
}

// Career type expected by components
export interface Career {
  id: number;
  careerName: string;
  description: string | null;
  r: number;
  i: number;
  a: number;
  s: number;
  e: number;
  c: number;
}

// Transform JSON career to component-expected format
function transformCareer(career: RIASECCareer, index: number): Career {
  return {
    id: index + 1,
    careerName: career.Title,
    description: career.desc || null,
    r: career.Realistic,
    i: career.Investigative,
    a: career.Artistic,
    s: career.Social,
    e: career.Enterprising,
    c: career.Conventional,
  };
}

/**
 * Hook to get all careers from JSON data
 */
export function useCareers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Transform careers from JSON
  const careers = useMemo(() => {
    try {
      return (careerWeights as RIASECCareer[]).map(transformCareer);
    } catch (e) {
      setError(e as Error);
      return [];
    }
  }, []);

  useEffect(() => {
    // Simulate async loading (data is already loaded via import)
    setLoading(false);
  }, []);

  return { careers, loading, error };
}

/**
 * Hook to get a single career by ID with its courses
 */
export function useCareer(id: string) {
  const [loading, setLoading] = useState(true);

  const data = useMemo(() => {
    const careerId = parseInt(id, 10);
    const allCareers = (careerWeights as RIASECCareer[]).map(transformCareer);
    const career = allCareers.find((c) => c.id === careerId) || null;

    // Get courses for this career from mapping
    let courses: { id: number; course: string }[] = [];
    if (career) {
      const careerCourses = (careerCourseList as Record<string, string[]>)[
        career.careerName
      ];
      if (careerCourses) {
        courses = careerCourses.map((courseName, idx) => ({
          id: idx + 1,
          course: courseName,
        }));
      }
    }

    return { career, courses };
  }, [id]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { ...data, loading };
}

export default { useCareers, useCareer };
