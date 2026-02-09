from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class RoundCreateRequest(BaseModel):
    name: str
    position: Optional[int] = None
    event_id: UUID
    # Dados do vinho (gabarito)
    wine_grapes: Optional[list[str]] = None  # Lista de uvas
    wine_country: Optional[str] = None
    wine_vintage: Optional[int] = None

class RoundUpdateRequest(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None
    is_open: Optional[bool] = None

class RoundResponse(BaseModel):
    id: UUID
    name: str
    position: int
    is_open: bool
    answer_released: bool
    event_id: UUID
    wine_grapes: Optional[list[str]] = None
    wine_country: Optional[str] = None
    wine_vintage: Optional[int] = None

    class Config:
        from_attributes = True

