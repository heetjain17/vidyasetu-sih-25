// services/data/hooks/useRoadmaps.ts
// Hooks for roadmap data - reads from JSON asset file

import { useState, useEffect, useMemo } from "react";
import roadmapData from "@/services/assets/roadmaps.json";
import coursesData from "@/services/assets/courses.json";

// Roadmap type
export interface Roadmap {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  semester: {
    year1: string[];
    year2: string[];
    year3: string[];
  };
  internships: string[];
  exams: string[];
  certifications: string[];
  upscaling: string[];
}

// Course type
interface Course {
  id: number;
  name: string;
  roadmap_id: number;
  stream: string;
}

/**
 * Hook to get all roadmaps
 */
export function useRoadmaps() {
  const [loading, setLoading] = useState(true);

  const roadmaps = useMemo(() => roadmapData as Roadmap[], []);

  // Get course counts for each roadmap
  const roadmapsWithCounts = useMemo(() => {
    const courses = coursesData as Course[];
    return roadmaps.map((roadmap) => ({
      ...roadmap,
      courseCount: courses.filter((c) => c.roadmap_id === roadmap.id).length,
      skillCount:
        (roadmap.semester.year1?.length || 0) +
        (roadmap.semester.year2?.length || 0) +
        (roadmap.semester.year3?.length || 0),
      examCount: roadmap.exams?.length || 0,
    }));
  }, [roadmaps]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { roadmaps: roadmapsWithCounts, loading };
}

/**
 * Hook to get a single roadmap by ID
 */
export function useRoadmap(id: number) {
  const { roadmaps, loading } = useRoadmaps();

  const roadmap = useMemo(
    () => roadmaps.find((r) => r.id === id) || null,
    [roadmaps, id]
  );

  // Get courses for this roadmap
  const courses = useMemo(() => {
    const allCourses = coursesData as Course[];
    return allCourses.filter((c) => c.roadmap_id === id).map((c) => c.name);
  }, [id]);

  return { roadmap, courses, loading };
}

export default { useRoadmaps, useRoadmap };
