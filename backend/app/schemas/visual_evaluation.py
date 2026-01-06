from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime

from app.enums.color_type import ColorType
from app.enums.limpidity import Limpidity

class VisualEvaluationBase(BaseModel):
    participant_id: UUID
    round_id: UUID
    
    limpidity: Limpidity
    intensity: int = Field(ge=1, le=5)
    color_type: ColorType
    color_tone: str

    is_answer_key: bool = False 

class VisualEvaluationCreate(VisualEvaluationBase):


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

class VisualEvaluationResponse(VisualEvaluationBase):
    id: UUID
    participant_id: UUID
    round_id: UUID
    submitted_at: datetime
    score: int = 0

    class Config:
        from_attributes = True

