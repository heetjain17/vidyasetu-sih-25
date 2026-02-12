// services/sandbox/search.ts - Hybrid search (embeddings + rule-based filters)

import collegeData from './data/college_data.json';
import embeddingsData from './data/embeddings.json';
import {
  embedCourseText,
  cosineSimilarity,
  distanceBetweenDistricts,
  normalizeYesNo,
  safeNumber,
  Vector24D
} from './utils';
import { ParsedQuery } from './text-clean';

// ==============================================================================
// TYPES
// ==============================================================================
export type CollegeRow = {
  Name: string;
  District?: string | null;
  Locality?: string | null;
  "Course offered"?: string | null;
  "Course_offered"?: string | null;
  Courses?: string | null;
  "Fees Annual Rs in Lac General"?: string | number | null;
  "Fees Annual Rs in Lac EWS"?: string | number | null;
  "Fees Annual Rs in Lac OBC"?: string | number | null;
  "Fees Annual Rs in Lac SC / ST"?: string | number | null;
  "Fees Annual Rs in Lac Girls"?: string | number | null;
  "Fees Annual Rs in Lac Others"?: string | number | null;
  "Hostel facility Yes / No"?: string | null;
  Hostel?: string | null;
  "Facilities offer by College Library Yes / No"?: string | null;
  Library?: string | null;
  "Facilities offer by College Sports Facility Yes / No"?: string | null;
  "Sports Events Yes / No"?: string | null;
  "Facilities offer by College Canteen Yes / No"?: string | null;
  Canteen?: string | null;
  "No of student placed through Campus FY 23 24"?: number | string | null;
  "No of student placed through Campus FY 22 23"?: number | string | null;
  "Average Placement PackageFY 23 24"?: string | number | null;
  "No of Seats available General"?: number | string | null;
  "No of Seats available SC / ST"?: number | string | null;
  "No of Seats available OBC"?: number | string | null;
  "No of Seats available EWS"?: number | string | null;
  [key: string]: any;
};


export type SearchResult = {
  row: CollegeRow;
  score: number;
  courseScore: number;
  distanceKm: number | null;
  matched: {
    category: boolean;
    budget: boolean;
    facilities: string[];
  };
};

type Candidate = {
  id: number;
  row: CollegeRow;
  courseScore: number;
  distanceKm?: number;
  finalScore?: number;
};

// ==============================================================================
// DATA LOADING
// ==============================================================================
const colleges: CollegeRow[] = collegeData as CollegeRow[];
const embIndex: Record<number, Vector24D> = {};
(embeddingsData as any[]).forEach((e: any) => embIndex[e.id] = e.embedding);

// ==============================================================================
// CONFIG
// ==============================================================================
const TOP_N_CANDIDATES = 30;
const FINAL_TOP_K = 5;
const COURSE_MIN_THRESHOLD = 0.35;

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================
function getAnnualFee(row: CollegeRow, preferredCategory?: string | null): number {
  const categoryKeyMap: Record<string, string> = {
    general: "Fees Annual Rs in Lac General",
    ews: "Fees Annual Rs in Lac EWS",
    sc: "Fees Annual Rs in Lac SC / ST",
    st: "Fees Annual Rs in Lac SC / ST",
    obc: "Fees Annual Rs in Lac OBC"
  };
  
  if (preferredCategory && categoryKeyMap[preferredCategory]) {
    const val = safeNumber(row[categoryKeyMap[preferredCategory]]);
    if (!isNaN(val)) return val;
  }
  
  const fallbackFields = [
    "Fees Annual Rs in Lac General",
    "Fees Annual Rs in Lac Others",
    "Fees Annual Rs in Lac Girls",
    "Fees Annual Rs in Lac EWS"
  ];
  for (const key of fallbackFields) {
    const n = safeNumber(row[key]);
    if (!isNaN(n)) return n;
  }
  
  return NaN;
}

export function hasFacility(row: CollegeRow, fac: string): boolean {
  const map: Record<string, string[]> = {
    hostel: ["Hostel facility Yes / No", "Hostel"],
    library: ["Facilities offer by College Library Yes / No", "Library"],
    sports: ["Facilities offer by College Sports Facility Yes / No", "Sports Events Yes / No"],
    canteen: ["Facilities offer by College Canteen Yes / No", "Canteen"],
    placement: ["No of student placed through Campus FY 23 24", "No of student placed through Campus FY 22 23"]
  };
  
  if (!map[fac]) return false;
  
  for (const key of map[fac]) {
    if (key in row) {
      if (typeof row[key] === "number") return row[key] as number > 0;
      if (normalizeYesNo(row[key])) return true;
    }
  }
  return false;
}

// ==============================================================================
// MAIN SEARCH FUNCTION
// ==============================================================================
export async function search(parsedQuery: ParsedQuery): Promise<SearchResult[]> {
  const {
    courseText,
    district,
    maxBudget,
    facilities,
    category
  } = parsedQuery;
  
  let candidates: Candidate[] = [];
  
  // 1) COURSE MATCHING (embeddings-based)
  if (courseText) {
    const qEmb = embedCourseText(courseText);
    const scored: Candidate[] = [];
    
    for (let i = 0; i < colleges.length; i++) {
      const row = colleges[i];
      const rowEmb = embIndex[i];
      if (!rowEmb) continue;
      
      const score = cosineSimilarity(qEmb, rowEmb);
      if (score >= COURSE_MIN_THRESHOLD) {
        scored.push({ id: i, row, courseScore: score });
      }
    }
    
    scored.sort((a, b) => b.courseScore - a.courseScore);
    candidates = scored.slice(0, TOP_N_CANDIDATES);
  } else {
    // No course detected — fallback = all colleges
    candidates = colleges.map((row, id) => ({
      id,
      row,
      courseScore: 0
    }));
  }
  
  // 2) LOCATION RANKING (if district provided)
  if (district) {
    for (const c of candidates) {
      const d2 = c.row["District"] || c.row["Locality"];
      c.distanceKm = distanceBetweenDistricts(district, d2 || "");
    }
    candidates.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
  }
  
  // 3) RULE-BASED FILTERS
  
  // Category filter
  if (category) {
    candidates = candidates.filter(c => {
      const row = c.row;
      const map: Record<string, string> = {
        general: "No of Seats available General",
        sc: "No of Seats available SC / ST",
        st: "No of Seats available SC / ST",
        obc: "No of Seats available OBC",
        ews: "No of Seats available EWS"
      };
      if (map[category] && row[map[category]] != null) {
        return Number(row[map[category]]) > 0;
      }
      return true;
    });
  }
  
  // Budget filter
  if (maxBudget) {
    candidates = candidates.filter(c => {
      const fee = getAnnualFee(c.row, category);
      return !isNaN(fee) && fee <= maxBudget;
    });
  }
  
  // Facilities filter
  if (facilities && facilities.length > 0) {
    for (const fac of facilities) {
      candidates = candidates.filter(c => hasFacility(c.row, fac));
    }
  }
  
  // 4) FINAL SCORING
  for (const c of candidates) {
    const a = c.courseScore || 0;
    const b = district && c.distanceKm !== undefined ? 1 / (1 + c.distanceKm) : 0;
    const d = (facilities?.length || 0) + (category ? 1 : 0) + (maxBudget ? 1 : 0);
    
    c.finalScore = a * 0.65 + b * 0.25 + d * 0.10;
  }
  
  candidates.sort((x, y) => (y.finalScore || 0) - (x.finalScore || 0));
  const top = candidates.slice(0, FINAL_TOP_K);
  
  return top.map(c => ({
    row: c.row,
    score: Number((c.finalScore || 0).toFixed(3)),
    courseScore: Number((c.courseScore || 0).toFixed(3)),
    distanceKm: c.distanceKm != null ? Number(c.distanceKm.toFixed(1)) : null,
    matched: {
      category: !!category,
      budget: !!maxBudget,
      facilities: facilities || []
    }
  }));
}
