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

export interface CareerRecommendation {
  title: string;
  score: number;
}
