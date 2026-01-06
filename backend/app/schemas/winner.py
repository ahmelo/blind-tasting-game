from pydantic import BaseModel
from uuid import UUID


class RoundWinner(BaseModel):
    participant_id: UUID
    total_score: int
