// src/types/results.ts

export interface ResultItem {
  key: string;
  label: string;
  participant: string;
  answer_key: string;
  status: "correct" | "wrong" | "partial"; // inclui parcial
}

export interface ResultBlock {
  key: string;
  label: string;
  items: ResultItem[];
}

export interface EvaluationResultResponse {
  round_id: string;
  blocks: ResultBlock[];
}
