import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { QuizAnswer, UserParamScores, QuestionSet } from "@/types/quiz";
import type { RecommenderResponse } from "@/types/api";

// =====================================================
// Translation Cache Type
// =====================================================
type TranslationCache = Record<string, Record<string, string>>;

// =====================================================
// Quiz Store
// =====================================================

interface QuizState {
  // Quiz progress
  currentSetIndex: number;
  currentQuestionSet: QuestionSet | null;
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  isQuizComplete: boolean;

  // Computed scores (internal - not shown to user)
  finalScores: UserParamScores | null;

  // Recommendations (shown to user)
  recommendations: RecommenderResponse | null;
  isLoadingRecommendations: boolean;

  // Translation cache (persisted)
  translatedCareers: TranslationCache;
  translatedColleges: TranslationCache;

  // Actions
  setQuestionSet: (set: QuestionSet, setIndex: number) => void;
  saveAnswer: (
    questionIndex: number,
    optionId: string,
    vector: number[]
  ) => void;
  getAnswer: (questionIndex: number) => QuizAnswer | null;
  nextQuestion: () => void;
  previousQuestion: () => void;
  computeScores: () => UserParamScores;
  setRecommendations: (recommendations: RecommenderResponse) => void;
  setLoadingRecommendations: (loading: boolean) => void;
  completeQuiz: () => void;
  reset: () => void;
  clearQuiz: () => void; // Clear all quiz data for logout

  // Translation actions
  setCareerTranslation: (career: string, lang: string, text: string) => void;
  setCollegeTranslation: (college: string, lang: string, text: string) => void;
  getCareerTranslation: (career: string, lang: string) => string | null;
  getCollegeTranslation: (college: string, lang: string) => string | null;
}

const initialState = {
  currentSetIndex: -1,
  currentQuestionSet: null,
  answers: [],
  currentQuestionIndex: 0,
  isQuizComplete: false,
  finalScores: null,
  recommendations: null,
  isLoadingRecommendations: false,
  translatedCareers: {},
  translatedColleges: {},
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setQuestionSet: (questionSet, setIndex) =>
        set({
          currentQuestionSet: questionSet,
          currentSetIndex: setIndex,
          answers: [],
          currentQuestionIndex: 0,
          isQuizComplete: false,
          finalScores: null,
          recommendations: null,
        }),

      saveAnswer: (questionIndex, optionId, vector) =>
        set((state) => {
          const filtered = state.answers.filter(
            (a) => a.questionIndex !== questionIndex
          );
          return {
            answers: [...filtered, { questionIndex, optionId, vector }],
          };
        }),

      getAnswer: (questionIndex) => {
        return (
          get().answers.find((a) => a.questionIndex === questionIndex) || null
        );
      },

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            (state.currentQuestionSet?.questions.length || 1) - 1
          ),
        })),

      previousQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
        })),

      computeScores: () => {
        const { answers } = get();

        // Sum all vectors (7 dimensions)
        const summed = [0, 0, 0, 0, 0, 0, 0];
        answers.forEach((answer) => {
          answer.vector.forEach((v, i) => {
            summed[i] += v;
          });
        });

        const scores: UserParamScores = {
          Logical: summed[0],
          Quant: summed[1],
          Analytical: summed[2],
          Verbal: summed[3],
          Spatial: summed[4],
          Creativity: summed[5],
          Enterpreneurial: summed[6],
        };

        set({ finalScores: scores });
        return scores;
      },

      setRecommendations: (recommendations) =>
        set({
          recommendations,
          isLoadingRecommendations: false,
        }),

      setLoadingRecommendations: (loading) =>
        set({ isLoadingRecommendations: loading }),

      completeQuiz: () => set({ isQuizComplete: true }),

      reset: () => set(initialState),

      clearQuiz: () =>
        set({
          ...initialState,
          translatedCareers: {},
          translatedColleges: {},
        }),

      // Translation actions
      setCareerTranslation: (career, lang, text) =>
        set((state) => ({
          translatedCareers: {
            ...state.translatedCareers,
            [career]: {
              ...state.translatedCareers[career],
              [lang]: text,
            },
          },
        })),

      setCollegeTranslation: (college, lang, text) =>
        set((state) => ({
          translatedColleges: {
            ...state.translatedColleges,
            [college]: {
              ...state.translatedColleges[college],
              [lang]: text,
            },
          },
        })),

      getCareerTranslation: (career, lang) => {
        return get().translatedCareers[career]?.[lang] || null;
      },

      getCollegeTranslation: (college, lang) => {
        return get().translatedColleges[college]?.[lang] || null;
      },
    }),
    {
      name: "quiz-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// =====================================================
// Selectors for UI (hide raw scores)
// =====================================================

/**
 * Get top career names from recommendations
 */
export function getTopCareers(
  recommendations: RecommenderResponse | null,
  limit = 5
): string[] {
  if (!recommendations?.top_careers) return [];
  return recommendations.top_careers.slice(0, limit);
}

/**
 * Get top college names from recommendations
 */
export function getTopColleges(
  recommendations: RecommenderResponse | null,
  limit = 5
): { name: string }[] {
  if (!recommendations?.recommended_colleges) return [];
  return recommendations.recommended_colleges
    .slice(0, limit)
    .map(({ name }) => ({ name }));
}
