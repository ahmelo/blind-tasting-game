from pydantic import BaseModel
from uuid import UUID
from typing import List


class EventWinnerResponse(BaseModel):
    participant_id: UUID
    participant_name: str
    total_score: int

    class Config:
        orm_mode = True


class EventRankingResponse(BaseModel):
    position: int
    participant_id: UUID
    participant_name: str
    total_score: int

    class Config:
        orm_mode = True


class EventWinnersResponse(BaseModel):
    event_id: UUID
    winners: List[EventWinnerResponse]
