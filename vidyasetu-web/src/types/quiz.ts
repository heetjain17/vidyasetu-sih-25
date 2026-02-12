// =====================================================
// Quiz Question Types
// =====================================================

export interface QuestionOption {
  id: string;
  text: string;
  vector: number[]; // 7 dimensions
}

export interface QuestionMeta {
  max_choices: number;
  difficulty: "easy" | "medium" | "hard";
  type: "traditional_mcq" | "no_wrong_answer";
  correct_option?: string;
}

export interface QuestionData {
  id: string;
  text: string;
  options: QuestionOption[];
  meta: QuestionMeta;
}

export interface Question {
  number: number;
  data: QuestionData;
}

export interface QuestionSet {
  set_number: number;
  questions: Question[];
}

export interface CombinedQuestionSets {
  vector_dimensions: string[];
  combined_sets: QuestionSet[];
}

// =====================================================
// Quiz Answer & Score Types
// =====================================================

export interface QuizAnswer {
  questionIndex: number;
  optionId: string;
  vector: number[]; // 7 dimensions
}

export interface UserParamScores {
  Logical: number;
  Quant: number;
  Analytical: number;
  Verbal: number;
  Spatial: number;
  Creativity: number;
  Enterpreneurial: number;
}

export interface RIASECScore {
  Realistic: number;
  Investigative: number;
  Artistic: number;
  Social: number;
  Enterprising: number;
  Conventional: number;
}

export interface NormalizedRIASEC {
  Realistic: number;
  Investigative: number;
  Artistic: number;
  Social: number;
  Enterprising: number;
  Conventional: number;
}
