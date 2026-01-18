from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime

from app.enums.color_type import ColorType
from app.enums.color_tone import ColorTone
from app.enums.limpidity import Limpidity
from app.enums.condition import Condition
from app.enums.sweetness import Sweetness
from app.enums.quality import Quality
from typing import Optional
from app.enums.grape import Grape
from app.enums.country import Country
from pydantic import Field

class EvaluationBase(BaseModel):
    participant_id: UUID
    round_id: UUID
    
    limpidity: Limpidity
    visualIntensity: int = Field(ge=1, le=5)
    color_type: ColorType
    color_tone: ColorTone

    condition: Condition
    aromaIntensity: int = Field(ge=1, le=5)
    aromas: str | None = None
    sweetness: Sweetness
    tannin: Optional[int] = Field(default=None, ge=1, le=5)
    alcohol: int = Field(ge=1, le=5)
    consistence: int = Field(ge=1, le=5)
    acidity: int = Field(ge=1, le=5)
    persistence: int = Field(ge=1, le=5)
    flavors: str | None = None

    quality: Quality
    grape: Grape | None = None
    country: Country | None = None
    vintage: int | None = None

    is_answer_key: bool = False 

class EvaluationCreate(EvaluationBase):

    @validator("tannin")
    def validate_tannin(cls, value, values):
        color_type = values.get("color_type")
        
        # Tannin é obrigatório para vinhos tinto e rosé
        if color_type in ["tinto", "rose"] and value is None:
            raise ValueError(
                f"Tanino é obrigatório para vinho {color_type}"
            )
        
        # Tannin deve ser None para vinho branco
        if color_type == "branco" and value is not None:
            raise ValueError(
                "Vinho branco não deve ter valor de tanino"
            )
        
        return value

    @validator("color_tone")
    def validate_color_tone(cls, tone, values):
        color_type = values.get("color_type")

        valid_tones = {
            ColorType.branco: [
                "esverdeado", "palha", "dourado", "ambar"
            ],
            ColorType.rose: [
                "salmao", "alaranjado", "cor_de_rosa", "avermelhado"
            ],
            ColorType.tinto: [
                "purpura", "rubi", "granada", "acastanhado"
            ],
        }

        if color_type and tone not in valid_tones[color_type]:
            raise ValueError(
                f"Tom '{tone}' inválido para cor '{color_type.value}'"
            )

        return tone

class EvaluationResponse(EvaluationBase):
    id: UUID
    participant_id: UUID
    round_id: UUID
    submitted_at: datetime
    score: int = 0

    class Config:
        from_attributes = True

