export interface AptitudeOption {
  id: string;
  text: string;
  vector: number[]; // 7-dim vector
}

export interface AptitudeMeta {
  max_choices: number;
  difficulty: "easy" | "medium" | "hard";
  type: "no_wrong_answer" | "traditional_mcq";
  correct_option?: string;
}

export interface AptitudeQuestion {
  id: string;
  text: string;
  options: AptitudeOption[];
  meta: AptitudeMeta;
}

export interface QuestionsFile {
  test_id: string;
  title: string;
  meta: {
    questions_total: number;
    options_per_question: number;
    no_wrong_answer_questions: number;
    traditional_mcq_questions: number;
    difficulty_distribution: {
      easy: number;
      medium: number;
      hard: number;
    };
    notes: string;
  };
  questions: AptitudeQuestion[];
}
