from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class RoundCreateRequest(BaseModel):
    name: str
    position: Optional[int] = None
    event_id: UUID

class RoundUpdateRequest(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None
    is_open: Optional[bool] = None

class RoundResponse(BaseModel):
    id: UUID
    name: str
    position: int
    is_open: bool
    event_id: UUID

    class Config:
        from_attributes = True
