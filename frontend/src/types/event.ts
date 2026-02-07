

export type EventRankingResponse = {
  participant_id: string;
  participant_name: string;
  position: number;
  participant_percentual: number;
  total_score: number;
};

export type EventWinnerResponse = {
  participant_id: string;
  participant_name: string;
  participant_percentual: number;
  total_score: number;
};

export interface EventWinnersResponse {
  event_id: string;
  winners: EventWinnerResponse[];
}