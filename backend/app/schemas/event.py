from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from app.enums.limpidity import Limpidity
from app.enums.color_type import ColorType
from app.enums.color_tone import ColorTone
from app.enums.condition import Condition
from app.enums.sweetness import Sweetness
from app.enums.quality import Quality
from app.enums.grape import Grape
from app.enums.country import Country


class EventWinnerResponse(BaseModel):
    participant_id: UUID
    participant_name: str
    participant_percentual: float
    total_score: int

    class Config:
        from_attributes = True


class EventRankingResponse(BaseModel):
    position: int
    participant_id: UUID
    participant_name: str
    participant_percentual: float
    total_score: int

    class Config:
        from_attributes = True


class EventWinnersResponse(BaseModel):
    event_id: UUID
    winners: List[EventWinnerResponse]

class EventAnswerKeyItem(BaseModel):
    round_id: UUID
    round_name: str

    limpidity: Limpidity
    visualIntensity: int
    color_type: ColorType
    color_tone: ColorTone

    condition: Condition
    aromaIntensity: int
    aromas: Optional[str] = None

    sweetness: Sweetness
    tannin: Optional[int] = None
    alcohol: int
    consistence: int
    acidity: int
    persistence: int
    flavors: Optional[str] = None

    quality: Quality
    grape: Optional[Grape] = None
    country: Optional[Country] = None
    vintage: Optional[int] = None
    
    class Config:
        use_enum_values = True