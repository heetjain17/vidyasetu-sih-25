export interface TokenizedOutput {
  input_ids: number[];
  attention_mask: number[];
}

export interface EmbeddingVector {
  vector: number[];
}

export interface EmbeddingResult {
  vector: number[];
  norm: number;
}

export interface ModelSessionConfig {
  modelPath: string;
  maxLength: number;
}

export interface RecommenderInput {
  id: string;
  title: string;
  description: string;
}

export interface ModelItem {
  id: string;
  title: string;
  text: string;
  vector?: number[];
}

export interface ModelRecommendation {
  id: string;
  title: string;
  score: number;
}

export interface DetailedRecommendation extends ModelRecommendation {
  vector: number[];
}

export interface SimilarityScore {
  id: string;
  score: number;
}

export type Vector = number[];

export interface ModelRecommenderState {
  embeddings: Record<string, number[]>;
  recommendations: ModelRecommendation[];

  embedText: (text: string) => Promise<number[]>;
  computeRecommendations: (input: string) => Promise<void>;

  reset: () => void;
}

export interface CollegeMatchBreakdown {
  locality: number;
  financial: number;
  eligibility: number;
  cultural: number;
  quality: number;
}

export interface CollegeRecommendation {
  name: string;
  finalScore: number;
  breakdown: CollegeMatchBreakdown;
}
