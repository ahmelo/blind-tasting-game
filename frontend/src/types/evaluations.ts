export type Limpidity = "limpido" | "turvo";
export type ColorType = "branco" | "rose" | "tinto";
export type Condition = "correto" | "defeituoso";
export type Sweetness = "seco" | "demi-sec" | "doce";

export type EvaluationCreate = {
  participant_id: string;
  round_id: string;
  limpidity: Limpidity;
  visualIntensity: number; // 1..5
  color_type: ColorType;
  color_tone: string;

  condition: Condition;
  aromaIntensity: number; // 1..5
  aromas: string;
  
  sweetness: Sweetness;
  tannin: number; // 1..5
  alcohol: number; // 1..5
  consistence: number; // 1..5
  acidity: number; // 1..5
  persistence: number; // 1..5
  flavors: string;

  grape?: string;
  country?: string;
  vintage?: number;
  
  is_answer_key?: boolean;
};

export type EvaluationResponse = EvaluationCreate & {
  id: string;
  score: number;
  submitted_at: string;
};


