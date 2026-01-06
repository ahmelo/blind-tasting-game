export type Limpidity = "limpido" | "turvo";
export type ColorType = "branco" | "rose" | "tinto";

export type VisualEvaluationCreate = {
  participant_id: string;
  round_id: string;
  limpidity: Limpidity;
  intensity: number; // 1..5
  color_type: ColorType;
  color_tone: string;
  is_answer_key?: boolean;
};

export type VisualEvaluationResponse = VisualEvaluationCreate & {
  id: string;
  score: number;
  submitted_at: string;
};


