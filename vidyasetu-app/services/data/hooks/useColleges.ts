// services/data/hooks/useColleges.ts
// Hooks for college data - reads from JSON asset file

import { useState, useEffect, useMemo } from "react";
import collegeData from "@/services/assets/colleges.json";

// College type expected by components
export interface College {
  id: number;
  aishe_code: string | null;
  name: string;
  district: string | null;
  state: string | null;
  website: string | null;
  year_of_establishment: number | null;
  location: string | null;
  college_type: string | null;
  management: string | null;
  university_name: string | null;
  for_girls: number;
}

/**
 * Hook to get all colleges
 */
export function useColleges() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const colleges = useMemo(() => {
    try {
      return collegeData as College[];
    } catch (e) {
      setError(e as Error);
      return [];
    }
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { colleges, loading, error };
}

/**
 * Hook to get a single college by ID
 */
export function useCollege(id: number) {
  const { colleges } = useColleges();
  const college = useMemo(
    () => colleges.find((c) => c.id === id) || null,
    [colleges, id]
  );
  return { college };
}

/**
 * Hook to get unique districts
 */
export function useDistricts() {
  const { colleges } = useColleges();

  const districts = useMemo(() => {
    const uniqueDistricts = new Set<string>();
    colleges.forEach((college) => {
      if (college.district) {
        uniqueDistricts.add(college.district);
      }
    });
    return Array.from(uniqueDistricts).sort();
  }, [colleges]);

  return { districts };
}

export default { useColleges, useCollege, useDistricts };
