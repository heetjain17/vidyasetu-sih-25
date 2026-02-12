import { create } from "zustand";
import {
  computeRIASEC,
  normalizeRIASEC,
  getRecommendations,
} from "@/services/logic/riasec.recommend";
import {
  UserParamScores,
  RIASECScore,
  NormalizedRIASEC,
  CareerRecommendation,
} from "@/types";

export type Answer = {
  questionIndex: number;
  optionId: string;
  vector: number[]; // length = 7
};

type AptitudeState = {
  answers: Answer[];

  finalParams: UserParamScores | null;
  riasecRaw: RIASECScore | null;
  riasecNorm: NormalizedRIASEC | null;
  recommendations: CareerRecommendation[];

  saveAnswer: (questionIndex: number, optionId: string, vec: number[]) => void;
  getAnswer: (questionIndex: number) => Answer | null;

  computeResult: () => void;
  reset: () => void;
};

export const useAptitudeStore = create<AptitudeState>((set, get) => ({
  answers: [],

  finalParams: null,
  riasecRaw: null,
  riasecNorm: null,
  recommendations: [],

  // save or overwrite an answer
  saveAnswer: (questionIndex, optionId, vec) =>
    set((state) => {
      const filtered = state.answers.filter(
        (a) => a.questionIndex !== questionIndex
      );
      return {
        answers: [...filtered, { questionIndex, optionId, vector: vec }],
      };
    }),

  // restore selected option when navigating back
  getAnswer: (questionIndex) => {
    return get().answers.find((a) => a.questionIndex === questionIndex) || null;
  },

  // FINAL SCORING
  computeResult: () => {
    const answers = get().answers;

    const summed = [0, 0, 0, 0, 0, 0, 0];
    answers.forEach((a) => {
      a.vector.forEach((v, i) => {
        summed[i] += v;
      });
    });

    const paramScores: UserParamScores = {
      Logical: summed[0],
      Quant: summed[1],
      Analytical: summed[2],
      Verbal: summed[3],
      Spatial: summed[4],
      Creativity: summed[5],
      Enterpreneurial: summed[6],
    };

    const riasecRaw = computeRIASEC(paramScores);
    const riasecNorm = normalizeRIASEC(riasecRaw);

    const recommendations = getRecommendations(paramScores, 5);

    set({
      finalParams: paramScores,
      riasecRaw,
      riasecNorm,
      recommendations,
    });
  },

  reset: () =>
    set({
      answers: [],
      finalParams: null,
      riasecRaw: null,
      riasecNorm: null,
      recommendations: [],
    }),
}));
