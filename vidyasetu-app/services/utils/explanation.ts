import { embed, cosineSimilarity } from "@/services/utils/model2";
import { NormalizedRIASEC } from "@/types";
import careerWeights from "@/services/assets/riasec_score_to_career_weights.json";

export interface CareerExplanation {
  base_id: string;
  trait_id: string;
  trait: string;
  explanation: string;
  careerName?: string;
}

export interface CollegeExplanation {
  collegeName: string;
  reason_ids: string[];
  explanations: string[];
  placeholders: {
    HOSTEL?: string | number | boolean;
    HOBBIES?: string;
    CATEGORY?: string;
  };
}

// CAREER EXPLANATION
const RIASEC_TEMPLATES: Record<string, string[]> = {
  Realistic: [
    "You prefer hands-on tasks and learning through practical activities.",
    "Your strengths lie in doing, building, and exploring how things work.",
  ],
  Investigative: [
    "You enjoy analyzing, solving problems, and exploring ideas in depth.",
    "Your thinking style aligns with research, reasoning, and logical tasks.",
  ],
  Artistic: [
    "You express creativity and enjoy activities involving art or design.",
    "You prefer environments that allow imagination and self-expression.",
  ],
  Social: [
    "You enjoy helping, guiding, and supporting others.",
    "You prefer roles involving communication, teaching, or teamwork.",
  ],
  Enterprising: [
    "You like leading, persuading, and making decisions.",
    "You are motivated by leadership and business-oriented tasks.",
  ],
  Conventional: [
    "You prefer structured tasks like organizing and planning.",
    "You excel at detailed, systematic, and accurate work.",
  ],
};

function selectBestTemplate(traitName: string): string {
  const templates = RIASEC_TEMPLATES[traitName];
  if (!templates) return "";

  const traitEmb = embed(traitName);
  let best: string = "";
  let bestScore = -999;

  for (const t of templates) {
    const tEmb = embed(t);
    const score = cosineSimilarity(traitEmb, tEmb);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }

  return best;
}

export function explainCareer(
  riasecScores: NormalizedRIASEC
): CareerExplanation {
  const topTrait = Object.entries(riasecScores).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return {
    base_id: "career_top_trait",
    trait_id: `trait_${topTrait}_1`,
    trait: topTrait,
    explanation: selectBestTemplate(topTrait),
  };
}

export function explainCareerRecommendation(
  careerTitle: string,
  userRiasec: NormalizedRIASEC
): CareerExplanation {
  // Find career profile
  const careerProfile = (careerWeights as any[]).find(
    (c) => (c.Title || c.title) === careerTitle
  );

  if (!careerProfile) {
    // Fallback if career not found: explain top user trait
    return { ...explainCareer(userRiasec), careerName: careerTitle };
  }

  // Find top trait of the career
  const traits = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"];
  let topTrait = "";
  let maxScore = -1;

  for (const t of traits) {
    if (careerProfile[t] > maxScore) {
      maxScore = careerProfile[t];
      topTrait = t;
    }
  }

  // Generate explanation
  const explanation = selectBestTemplate(topTrait);

  return {
    base_id: "career_recommendation",
    trait_id: `trait_${topTrait}_1`,
    trait: topTrait,
    explanation: `This career aligns with your strong ${topTrait} traits. ${explanation}`,
    careerName: careerTitle,
  };
}

// COLLEGE EXPLANATION
const COLLEGE_REASON_TEMPLATES: Record<string, string[]> = {
  locality: [
    "You prefer studying closer to home.",
    "The location fits well with your preference for nearby colleges.",
  ],
  financial: [
    "The fee structure matches your budget expectations.",
    "This college provides good affordability based on your inputs.",
  ],
  eligibility: [
    "Your profile strongly matches the admission requirements.",
    "Your category aligns well with the eligibility policy.",
  ],
  events_hobbies: [
    "Your hobbies and interests match the college's cultural environment.",
    "This college aligns well with your extracurricular preferences.",
  ],
  quality: [
    "The college has good infrastructure and facilities.",
    "Quality indicators made this college a strong match.",
  ],
};

function pickReason(reasonType: string): string {
  const templates = COLLEGE_REASON_TEMPLATES[reasonType];
  if (!templates) return "";

  const baseEmb = embed(reasonType);
  let best = "";
  let bestScore = -999;

  for (const t of templates) {
    const tEmb = embed(t);
    const score = cosineSimilarity(baseEmb, tEmb);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }

  return best;
}

export function explainCollege(
  collegeName: string,
  weights: Record<string, number>,
  componentScores: any
): CollegeExplanation {
  console.log("🔍 Generating explanation for:", collegeName);
  console.log("  Weights:", weights);
  console.log("  Component Scores:", componentScores);

  // Map component scores to reason types
  const scoreMap = [
    { type: "locality", score: componentScores?.locality || 0 },
    { type: "financial", score: componentScores?.financial || 0 },
    { type: "eligibility", score: componentScores?.eligibility || 0 },
    { type: "cultural", score: componentScores?.cultural || 0 },
    { type: "quality", score: componentScores?.quality || 0 },
  ];

  // Sort by score descending to get top factors
  scoreMap.sort((a, b) => b.score - a.score);

  // Generate explanations for top 2-3 scoring components
  const reason_ids: string[] = [];
  const explanations: string[] = [];

  // Always include at least top 2 factors
  const topFactors = scoreMap.slice(0, 3).filter((factor) => factor.score > 0.1);

  for (const factor of topFactors) {
    const reasonId = `college_${factor.type}_1`;
    reason_ids.push(reasonId);
    
    // Map factor.type to template key (handle cultural/events_hobbies mapping)
    let templateKey = factor.type;
    if (factor.type === "cultural") {
      templateKey = "events_hobbies";
    }
    
    const explanation = pickReason(templateKey);
    explanations.push(explanation);
  }

  // Fallback: if we don't have enough explanations, add generic ones
  if (explanations.length === 0) {
    reason_ids.push("college_quality_1");
    explanations.push("This college is a good match based on overall factors.");
  }

  console.log("  ✅ Generated explanations:", explanations);

  return {
    collegeName,
    reason_ids,
    explanations,
    placeholders: {
      HOSTEL: componentScores?.Hostel,
      HOBBIES: componentScores?.Hobbies,
      CATEGORY: componentScores?.Students_Category,
    },
  };
}
