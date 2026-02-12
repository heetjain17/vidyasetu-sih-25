// services/data/hooks/useRoadmap.ts
// Hooks for roadmap data - reads directly from JSON/static data instead of database

import { useState, useEffect, useMemo } from "react";

// Roadmap type expected by components
export interface Roadmap {
  id: number;
  course: string;
  years: number;
  internships: number;
  placements: number;
  upscaling: string | null;
}

// Static roadmap data based on roadmap_templates_rows.csv
const ROADMAP_DATA: Roadmap[] = [
  {
    id: 1,
    course: "Bachelor of Arts",
    years: 3,
    internships: 1,
    placements: 65,
    upscaling: "MA, B.Ed, MBA, Civil Services",
  },
  {
    id: 2,
    course: "Bachelor of Science",
    years: 3,
    internships: 2,
    placements: 70,
    upscaling: "M.Sc, B.Ed, MBA, Research",
  },
  {
    id: 3,
    course: "Bachelor of Commerce",
    years: 3,
    internships: 2,
    placements: 75,
    upscaling: "M.Com, CA, CMA, MBA",
  },
  {
    id: 4,
    course: "Bachelor of Computer Applications",
    years: 3,
    internships: 3,
    placements: 80,
    upscaling: "MCA, MBA, MS in CS",
  },
  {
    id: 5,
    course: "Bachelor of Business Administration",
    years: 3,
    internships: 2,
    placements: 78,
    upscaling: "MBA, Entrepreneurship, Certifications",
  },
  {
    id: 6,
    course: "Bachelor of Technology",
    years: 4,
    internships: 3,
    placements: 85,
    upscaling: "M.Tech, MBA, MS, Research",
  },
  {
    id: 7,
    course: "Bachelor of Education",
    years: 2,
    internships: 1,
    placements: 90,
    upscaling: "M.Ed, Ph.D, School Administration",
  },
];

/**
 * Hook to get roadmap for a specific course
 */
export function useRoadmap(courseName: string) {
  const [loading, setLoading] = useState(true);

  const roadmap = useMemo(() => {
    // Find roadmap by exact match first
    let found = ROADMAP_DATA.find(
      (r) => r.course.toLowerCase() === courseName.toLowerCase()
    );

    // If no exact match, try partial match
    if (!found) {
      found = ROADMAP_DATA.find(
        (r) =>
          courseName.toLowerCase().includes(r.course.toLowerCase()) ||
          r.course.toLowerCase().includes(courseName.toLowerCase())
      );
    }

    // If still no match, return a default based on the course name
    if (!found) {
      // Create a generic roadmap based on common patterns
      if (
        courseName.toLowerCase().includes("engineering") ||
        courseName.toLowerCase().includes("technology")
      ) {
        return {
          id: 0,
          course: courseName,
          years: 4,
          internships: 2,
          placements: 75,
          upscaling: "M.Tech, MBA, MS, Research",
        };
      } else if (
        courseName.toLowerCase().includes("master") ||
        courseName.toLowerCase().includes("m.")
      ) {
        return {
          id: 0,
          course: courseName,
          years: 2,
          internships: 1,
          placements: 80,
          upscaling: "Ph.D, Research, Industry",
        };
      } else {
        return {
          id: 0,
          course: courseName,
          years: 3,
          internships: 1,
          placements: 70,
          upscaling: "Higher Education, Certifications",
        };
      }
    }

    return found;
  }, [courseName]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { roadmap, loading };
}

export default { useRoadmap };
