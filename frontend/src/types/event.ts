

export type EventRankingResponse = {
  participant_id: string;
  participant_name: string;
  position: number;
  total_score: number;
};

export type EventWinnerResponse = {
  participant_id: string;
  participant_name: string;
  total_score: number;
};