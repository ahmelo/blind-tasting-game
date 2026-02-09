from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List

from app.enums.grape import Grape
from app.enums.country import Country


class WineBase(BaseModel):
    grapes: Optional[List[str]] = None  # Lista de uvas (ex: ["Malbec", "Syrah"])
    country: Optional[Country] = None
    vintage: Optional[int] = None


class WineCreate(WineBase):
    round_id: UUID


class WineUpdate(BaseModel):
    grapes: Optional[List[str]] = None
    country: Optional[Country] = None
    vintage: Optional[int] = None


class WineResponse(WineBase):
    id: UUID
    round_id: UUID

    class Config:
        from_attributes = True
