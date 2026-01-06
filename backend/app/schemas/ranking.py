from pydantic import BaseModel
from uuid import UUID


class RoundRankingItem(BaseModel):
    participant_id: UUID
    total_score: int

