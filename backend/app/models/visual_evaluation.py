from sqlalchemy import (
    Boolean, Column, String, Integer, ForeignKey, Enum,
    UniqueConstraint, DateTime, CheckConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.db_types import GUID
from app.core.database import Base
from app.enums.color_type import ColorType
from app.enums.limpidity import Limpidity

class VisualEvaluation(Base):
    __tablename__ = "visual_evaluations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    participant_id = Column(GUID(), ForeignKey("participants.id"), nullable=False)
    round_id = Column(GUID(), ForeignKey("rounds.id"), nullable=False)

    limpidity = Column(Enum(Limpidity, name="limpidity_enum"), nullable=False)
    color_type = Column(Enum(ColorType, name="color_type_enum"), nullable=False)

    intensity = Column(Integer, nullable=False)
    color_tone = Column(String, nullable=False)

    is_answer_key = Column(Boolean, default=False, nullable=False)
    score = Column(Integer, default=0, nullable=True)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    participant = relationship("Participant", back_populates="visual_evaluations")
    round = relationship("Round", back_populates="visual_evaluations")
    
    __table_args__ = (
        UniqueConstraint("participant_id", "round_id"),
        CheckConstraint("intensity BETWEEN 1 AND 5", name="ck_visual_intensity"),
    )
