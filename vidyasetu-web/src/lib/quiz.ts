import type {
  CombinedQuestionSets,
  QuestionSet,
  UserParamScores,
} from "@/types/quiz";
import type {
  RecommenderRequest,
  RecommenderScores,
  StudentActual,
  StudentPreferences,
} from "@/types/api";
import combinedQuestionSets from "@/assets/combined_question_sets.json";

// =====================================================
// Quiz Logic Utilities
// =====================================================

const questionData = combinedQuestionSets as CombinedQuestionSets;

/**
 * Get the total number of question sets available
 */
export function getTotalSets(): number {
  return questionData.combined_sets.length;
}

/**
 * Get a random question set from the combined sets
 */
export function getRandomQuestionSet(): { set: QuestionSet; index: number } {
  const sets = questionData.combined_sets;
  const randomIndex = Math.floor(Math.random() * sets.length);
  return {
    set: sets[randomIndex],
    index: randomIndex,
  };
}

/**
 * Get a specific question set by index
 */
export function getQuestionSetByIndex(index: number): QuestionSet | null {
  const sets = questionData.combined_sets;
  if (index < 0 || index >= sets.length) return null;
  return sets[index];
}

/**
 * Get vector dimensions (aptitude categories)
 */
export function getVectorDimensions(): string[] {
  return questionData.vector_dimensions;
}

/**
 * Map user param scores to recommender API format
 */
export function mapScoresToRecommenderFormat(
  scores: UserParamScores
): RecommenderScores {
  return {
    Logical_reasoning: scores.Logical,
    Quantitative_reasoning: scores.Quant,
    Analytical_reasoning: scores.Analytical,
    Verbal_reasoning: scores.Verbal,
    Spatial_reasoning: scores.Spatial,
    Creativity: scores.Creativity,
    Enter: scores.Enterpreneurial,
    language: "english",
  };
}

/**
 * Build the full recommender request payload using profile store data
 */
export function buildRecommenderRequest(
  scores: UserParamScores,
  studentActual: StudentActual,
  studentPreferences: StudentPreferences
): RecommenderRequest {
  return {
    scores: mapScoresToRecommenderFormat(scores),
    student_actual: studentActual,
    student_preferences: studentPreferences,
  };
}

/**
 * Calculate quiz progress percentage
 */
export function calculateProgress(
  currentIndex: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round(((currentIndex + 1) / totalQuestions) * 100);
}
