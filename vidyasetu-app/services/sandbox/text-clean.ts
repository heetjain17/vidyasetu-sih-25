// services/sandbox/text-clean.ts - Query parsing for college search

import { LOCALITY_COORDS } from './utils';

const greetingWords = new Set([
  "hi", "hello", "hey", "yo", "hola", "namaste", "salam", "salaam", "good", "morning",
  "evening", "afternoon"
]);

// ==============================================================================
// TEXT CLEANING & TOKENIZATION
// ==============================================================================
export function cleanText(text: string): string {
  return (text || "").toLowerCase().trim();
}

export function tokenize(text: string): string[] {
  return cleanText(text)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// ==============================================================================
// GREETING DETECTION
// ==============================================================================
export function isGreetingOnly(text: string): boolean {
  const t = tokenize(text);
  if (t.length === 0) return false;
  return t.every(word => greetingWords.has(word));
}

// ==============================================================================
// DISTRICT EXTRACTION
// ==============================================================================
export function extractDistrict(text: string): string | null {
  const q = cleanText(text);
  for (const d in LOCALITY_COORDS) {
    const regex = new RegExp(`\\b${d}\\b`, "i");
    if (regex.test(q)) return d;
  }
  return null;
}

// ==============================================================================
// BUDGET EXTRACTION
// ==============================================================================
export function extractBudget(text: string): number | null {
  const q = cleanText(text);
  
  // direct number
  const num = q.match(/(\d[\d,\.]*)/);
  if (num) {
    let n = num[1].replace(/,/g, "");
    const val = parseFloat(n);
    if (!isNaN(val) && val > 1000 && val < 100000000) return val;
  }
  
  // "under 1 lakh" / "below 2 lakh"
  const lakhMatch = q.match(/under\s*([\d\.]+)\s*lakh|below\s*([\d\.]+)\s*lakh/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1] || lakhMatch[2]);
    if (!isNaN(val)) return val * 100000;
  }
  
  // 1 lakh / 1.5 lakh without "under"
  const lakhOnly = q.match(/([\d\.]+)\s*lakh/);
  if (lakhOnly) {
    const val = parseFloat(lakhOnly[1]);
    if (!isNaN(val)) return val * 100000;
  }
  
  return null;
}

// ==============================================================================
// FACILITIES EXTRACTION
// ==============================================================================
const facilityMap: Record<string, string[]> = {
  hostel: ["hostel", "accommodation"],
  library: ["library"],
  sports: ["sports", "playground", "games"],
  placement: ["placement", "job", "package", "placements", "campus hiring"],
  canteen: ["canteen", "mess", "cafeteria"]
};

export function extractFacilities(text: string): string[] {
  const t = tokenize(text);
  const out = new Set<string>();
  for (const token of t) {
    for (const fac in facilityMap) {
      if (facilityMap[fac].includes(token)) out.add(fac);
    }
  }
  return Array.from(out);
}

// ==============================================================================
// CATEGORY EXTRACTION
// ==============================================================================
export function extractCategory(text: string): string | null {
  const q = cleanText(text);
  if (/\bews\b/.test(q)) return "ews";
  if (/\bobc\b/.test(q)) return "obc";
  if (/\bsc\b/.test(q)) return "sc";
  if (/\bst\b/.test(q)) return "st";
  if (/\bgeneral\b|\bunreserved\b/.test(q)) return "general";
  if (/management|quota/i.test(q)) return "management";
  return null;
}

// ==============================================================================
// COURSE TEXT EXTRACTION
// ==============================================================================
export function extractCourseText(text: string): string | null {
  const q = cleanText(text);
  const tokens = tokenize(q);
  const courseWords: string[] = [];
  
  const whitelist = [
    "engineering", "btech", "be", "b.e", "cse", "mechanical", "civil", "ece", "electrical",
    "law", "llb", "ba", "b.a", "bba", "mba", "medical", "mbbs", "bds", "bams", "bhms", "bums",
    "pharmacy", "bpharm", "dpharm", "nursing", "bsc", "b.sc", "bcom", "b.com", "bca",
    "commerce", "science", "arts", "education", "agriculture", "polytechnic", "diploma"
  ];
  
  for (const t of tokens) {
    if (whitelist.includes(t)) courseWords.push(t);
  }
  
  if (courseWords.length === 0) return null;
  return courseWords.join(" ");
}

// ==============================================================================
// COLLEGE CONTEXT DETECTION
// ==============================================================================
export function hasCollegeContext(text: string): boolean {
  const q = cleanText(text);
  return /\bcollege|colleges|course|degree|fees|admission|branch\b/.test(q);
}

// ==============================================================================
// PARSED QUERY TYPE
// ==============================================================================
export type ParsedQuery = {
  rawQuery: string;
  courseText: string | null;
  district: string | null;
  maxBudget: number | null;
  facilities: string[];
  category: string | null;
};
