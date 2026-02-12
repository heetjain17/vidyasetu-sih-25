import {
  embed,
  cosineSimilarity,
  normalizeStudentWillVector,
  collegeToVector,
  studentWillToVector,
  LOCALITY_COORDS,
} from "./model2";

import type { Student, College, WillVector } from "./model2";

// Haversine distance
export function haversine(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.asin(Math.sqrt(a)));
}

// getStudentHobbiesScores
export function getStudentHobbiesScores(
  student: Student,
  CATEGORY_EMB: Record<string, number[]>
): Record<string, number> {
  const allText =
    (student.Extra_curriculars || []).join(" ") +
    " " +
    (student.Hobbies || []).join(" ");

  const sEmb = embed(allText);

  const scores: Record<string, number> = {};
  for (const cat in CATEGORY_EMB) {
    scores[cat] = cosineSimilarity(sEmb, CATEGORY_EMB[cat]);
  }
  return scores;
}

// getCollegeHobbiesScores
export function getCollegeHobbiesScores(
  college: College,
  CATEGORY_TEXT: Record<string, string[]>
): Record<string, number> {
  const out: Record<string, number> = {};

  for (const cat in CATEGORY_TEXT) {
    const val = college.Fests_Flags?.[cat];
    out[cat] = val === "Yes" ? 1.0 : 0.0;
  }

  return out;
}

// culturalMatchScore
export function culturalMatchScore(
  student: Student,
  college: College,
  CATEGORY_EMB: Record<string, number[]>,
  CATEGORY_TEXT: Record<string, string[]>
): number {
  const studentScores = getStudentHobbiesScores(student, CATEGORY_EMB);
  const collegeScores = getCollegeHobbiesScores(college, CATEGORY_TEXT);

  const studentVec = Object.values(studentScores).map(Number);
  const collegeVec = Object.values(collegeScores).map(Number);

  return cosineSimilarity(studentVec, collegeVec);
}

// financialMatchScore
export function financialMatchScore(
  student: Student,
  college: College
): number {
  let budget = Number(student.Budget);
  let fees = Number(college.Fees);

  if (isNaN(budget) || isNaN(fees)) return 0.5;

  const scholarship = ["yes", "true", "1", "y"].includes(
    String(college.Scholarships || "No").toLowerCase()
  );

  if (fees <= budget) return 1.0;
  if (scholarship && fees <= budget * 1.2) return 0.85;
  if (fees <= budget * 1.4) return 0.6;
  if (fees <= budget * 1.7) return 0.35;
  return 0.1;
}

// localityMatchScore (distance-based)
export function localityMatchScore(student: Student, college: College): number {
  const studentLoc = String(student.Student_Locality || "")
    .toLowerCase()
    .trim();
  const collegeLoc = String(college.Locality || "")
    .toLowerCase()
    .trim();

  if (!studentLoc || !collegeLoc) return 0.5;
  if (studentLoc === collegeLoc) return 1.0;

  const sCoord = LOCALITY_COORDS[studentLoc] || LOCALITY_COORDS["unknown"];
  const cCoord = LOCALITY_COORDS[collegeLoc] || LOCALITY_COORDS["unknown"];

  const distKm = haversine(sCoord, cCoord);
  const distanceScale = 1000;

  let sim = Math.max(0, 1 - distKm / distanceScale);

  const hostel = ["yes", "true", "1", "y"].includes(
    String(college.Hostel || "No").toLowerCase()
  );

  if (hostel) sim = Math.min(1, sim + 0.15);

  return Number(sim.toFixed(4));
}

// eligibilityMatchScore
export function eligibilityMatchScore(
  student: Student,
  college: College,
  weightCategory = 0.8,
  weightGender = 0.2
): number {
  const studentCat = String(student.Students_Category || "")
    .trim()
    .toLowerCase();

  const studentGender = String(student.Gender || "")
    .trim()
    .toLowerCase();

  const reservations = (college.Reservation || []).map((r: any) =>
    String(r).trim().toLowerCase()
  );

  let policy = String(college.Gender_Policy || "coed")
    .toLowerCase()
    .replace("-", "")
    .replace(" ", "");

  let categoryScore = 0.3;
  if (studentCat && reservations.includes(studentCat)) categoryScore = 1.0;
  else if (!studentCat || studentCat === "general") categoryScore = 0.7;

  let genderScore = 1.0;
  if (
    (policy === "femaleonly" && studentGender === "male") ||
    (policy === "maleonly" && studentGender === "female")
  ) {
    genderScore = 0.0;
  }

  const totalWeight = weightCategory + weightGender;
  const combined =
    (weightCategory * categoryScore + weightGender * genderScore) /
    (totalWeight || 1);

  return Number(combined.toFixed(4));
}

// qualityScore
export function qualityScore(college: College): number {
  let infra = Number(college.Infrastructure);
  if (isNaN(infra)) infra = 5;

  const fac = college.Facilities;
  let facScoreNorm = 5;

  if (fac && typeof fac === "object") {
    let facPoints = 0;

    if (String(fac.Library || "No").toLowerCase() === "yes") facPoints += 2;
    if (String(fac.Sports_Facility || "No").toLowerCase() === "yes")
      facPoints += 2;
    if (String(fac.Medical_Facility || "No").toLowerCase() === "yes")
      facPoints += 2;
    if (String(fac.Canteen || "No").toLowerCase() === "yes") facPoints += 2;

    const compLabs = Number(fac.Computer_Lab_Nos || 0);
    const sciLabs = Number(fac.Science_Lab_Nos || 0);

    facPoints += Math.min(compLabs / 3, 1) * 1.5;
    facPoints += Math.min(sciLabs / 4, 1) * 1.5;

    facScoreNorm = (facPoints / 11) * 10;
  }

  const quality = (infra + facScoreNorm) / 20;
  return Number(quality.toFixed(4));
}

// finalCollegeMatchScore
export function finalCollegeMatchScore(
  studentWillNorm: WillVector,
  collegeScoreList: number[]
): number {
  const studentVec = studentWillToVector(studentWillNorm);
  const collegeVec = collegeToVector(collegeScoreList);
  return cosineSimilarity(studentVec, collegeVec);
}
