import { useAptitudeStore } from "@/store/aptitude";
import { useCollegeStore } from "@/store/college";
import { useProfileStore } from "@/store/profile";
import { useExplanationStore } from "@/store/explanation";

import {
  careerToCourse,
  courseToCollege,
} from "@/services/logic/riasec.recommend";
import {
  explainCareer,
  explainCollege,
  explainCareerRecommendation,
} from "@/services/utils/explanation";

/**
 * Full recommendation pipeline matching recom_reactnative workflow:
 *
 * STAGE 1: Career Recommendations (RIASEC-based)
 * STAGE 2: Career → Course Mapping
 * STAGE 3: Course → College Mapping + College Scoring
 * STAGE 4: Generate Explanations
 */
export async function runFullRecommendationPipeline() {
  const aptitudeStore = useAptitudeStore.getState();
  const collegeStore = useCollegeStore.getState();
  const explanationStore = useExplanationStore.getState();

  // --------------------------------------
  // STAGE 1 — CAREER RECOMMENDATIONS
  // --------------------------------------
  console.log("🎯 STAGE 1: Computing career recommendations...");
  if (aptitudeStore.recommendations.length === 0) {
    await aptitudeStore.computeResult();
  }

  const riasecNorm = aptitudeStore.riasecNorm;
  const careerRecs = aptitudeStore.recommendations;
  const finalParams = aptitudeStore.finalParams;

  console.log(`✅ Generated ${careerRecs.length} career recommendations`);
  if (careerRecs.length > 0) {
    console.log(
      "  Top career:",
      careerRecs[0].title,
      "Score:",
      careerRecs[0].score
    );
  }

  // Generate career explanations for top 3
  if (riasecNorm && careerRecs.length > 0) {
    const top3Careers = careerRecs.slice(0, 3);
    const careerExplanations = top3Careers.map((rec) =>
      explainCareerRecommendation(rec.title, riasecNorm)
    );
    console.log("📊 Career Explanations Generated:", careerExplanations.length);
    explanationStore.setCareerExplanations(careerExplanations);
  } else if (riasecNorm) {
    const careerExplanation = explainCareer(riasecNorm);
    explanationStore.setCareerExplanations([careerExplanation]);
  }

  // --------------------------------------
  // STAGE 2 — CAREER TO COURSE MAPPING
  // --------------------------------------
  console.log("📚 STAGE 2: Mapping careers to courses...");
  let careerCourseList: { career: string; courses: string[] }[] = [];

  if (finalParams) {
    careerCourseList = careerToCourse(finalParams);
    console.log(`✅ Mapped ${careerCourseList.length} careers to courses`);
    if (careerCourseList.length > 0) {
      console.log(
        `  Example: ${careerCourseList[0].career} → ${careerCourseList[0].courses.length} courses`
      );
    }
  }

  // --------------------------------------
  // STAGE 3 — COURSE TO COLLEGE MAPPING
  // --------------------------------------
  console.log("🏛️ STAGE 3: Mapping courses to colleges...");
  let courseCollegeList: { course: string; colleges: string[] }[] = [];

  if (finalParams) {
    courseCollegeList = courseToCollege(finalParams);
    console.log(`✅ Mapped ${courseCollegeList.length} courses to colleges`);
    if (courseCollegeList.length > 0) {
      console.log(
        `  Example: ${courseCollegeList[0].course} → ${courseCollegeList[0].colleges.length} colleges`
      );
    }
  }

  // --------------------------------------
  // STAGE 4 — COLLEGE SCORING & RANKING
  // --------------------------------------
  console.log("🎓 STAGE 4: Scoring and ranking colleges...");
  const collegeRecs = collegeStore.runRecommendation();
  console.log(`✅ Generated ${collegeRecs.length} college recommendations`);
  if (collegeRecs.length > 0) {
    console.log(
      "  Top college:",
      collegeRecs[0].name,
      "Score:",
      collegeRecs[0].finalScore
    );
  }

  // --------------------------------------
  // STAGE 5 — COLLEGE EXPLANATIONS
  // --------------------------------------
  console.log("💡 STAGE 5: Generating college explanations...");
  const top3Explanations = collegeRecs.slice(0, 3).map((rec) => {
    console.log(`  Processing: ${rec.name}`);
    return explainCollege(rec.name, collegeStore.studentWill, rec.breakdown);
  });

  console.log("📝 All College Explanations:", top3Explanations.length);
  explanationStore.setCollegeExplanations(top3Explanations);
  console.log("✅ Pipeline completed successfully!");

  return {
    // Stage 1: Careers
    careers: careerRecs,

    // Stage 2: Career → Course mapping
    careerCourses: careerCourseList,

    // Stage 3: Course → College mapping
    courseColleges: courseCollegeList,

    // Stage 4: Final college recommendations
    colleges: collegeRecs,

    // Stage 5: Explanations
    careerExplanations: explanationStore.careerExplanations,
    collegeExplanations: top3Explanations,
  };
}
