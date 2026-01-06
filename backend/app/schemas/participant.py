from pydantic import BaseModel
from uuid import UUID

class ParticipantJoinRequest(BaseModel):
    name: str
    event_code: str

class ParticipantJoinResponse(BaseModel):
    participant_id: UUID
    name: str
    event_id: UUID
    event_code: str
