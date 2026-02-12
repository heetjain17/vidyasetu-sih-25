// services/data/hooks/useCourses.ts
// Hooks for course data - reads directly from JSON files instead of database

import { useState, useEffect, useMemo } from "react";
import courseCollegeList from "@/services/assets/Course_to_college.json";
import collegeData from "@/services/assets/colleges.json";

// College type
export interface College {
  id: number;
  name: string;
  district?: string;
  state?: string;
  website?: string;
  year_of_establishment?: number;
  location?: string;
  college_type?: string;
  management?: string;
  university_name?: string;
  for_girls?: number;
}

/**
 * Hook to get colleges for a specific course
 */
export function useCourseColleges(courseName: string) {
  const [loading, setLoading] = useState(true);

  const colleges = useMemo(() => {
    // Get college names from course-college mapping
    const collegeNames =
      (courseCollegeList as Record<string, string[]>)[courseName] || [];

    // Map to college objects with basic info
    return collegeNames.map((name, idx) => ({
      id: idx + 1,
      name: name,
    }));
  }, [courseName]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { colleges, loading };
}

export default { useCourseColleges };
