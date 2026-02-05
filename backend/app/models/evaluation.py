from sqlalchemy import (
    Boolean,
    Column,
    String,
    Integer,
    ForeignKey,
    Enum,
    UniqueConstraint,
    DateTime,
    CheckConstraint,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.db_types import GUID
from app.core.database import Base
from app.enums.color_type import ColorType
from app.enums.color_tone import ColorTone
from app.enums.limpidity import Limpidity
from app.enums.condition import Condition
from app.enums.sweetness import Sweetness
from app.enums.quality import Quality
from app.enums.country import Country
from app.enums.grape import Grape


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    participant_id = Column(GUID(), ForeignKey("participants.id"), nullable=False)
    round_id = Column(GUID(), ForeignKey("rounds.id"), nullable=False)

    ## Avaliação Visual
    limpidity = Column(Enum(Limpidity, name="limpidity_enum"), nullable=False)
    visualIntensity = Column("visual_intensity", Integer, nullable=False)
    color_type = Column(Enum(ColorType, name="color_type_enum"), nullable=False)
    color_tone = Column(Enum(ColorTone, name="color_tone_enum"), nullable=False)

    ## Avaliação Olfativa
    condition = Column(Enum(Condition, name="condition_enum"), nullable=False)
    aromaIntensity = Column("aroma_intensity", Integer, nullable=False)
    aromas = Column(String, nullable=True)

    ## Avaliação Gustativa
    sweetness = Column(Enum(Sweetness, name="sweetness_enum"), nullable=False)
    tannin = Column(Integer, nullable=True)
    alcohol = Column(Integer, nullable=False)
    consistence = Column(Integer, nullable=False)
    acidity = Column(Integer, nullable=False)
    persistence = Column(Integer, nullable=False)
    flavors = Column(String, nullable=True)

    ## Dados Gerais do Vinho
    quality = Column(Enum(Quality, name="quality_enum"), nullable=False)
    grape = Column(Enum(Grape, name="grape_enum"), nullable=True)
    country = Column(Enum(Country, name="country_enum"), nullable=True)
    vintage = Column(Integer, nullable=True)

    ## Common Fields
    is_answer_key = Column(Boolean, default=False, nullable=False)
    score = Column(Integer, default=0, nullable=False)

    submitted_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    participant = relationship("Participant", back_populates="evaluations")
    round = relationship("Round", back_populates="evaluations")

    __table_args__ = (
        UniqueConstraint("participant_id", "round_id"),
        CheckConstraint("visual_intensity BETWEEN 1 AND 5", name="ck_visual_intensity"),
        CheckConstraint("aroma_intensity BETWEEN 1 AND 5", name="ck_aroma_intensity"),
        CheckConstraint("acidity BETWEEN 1 AND 5", name="ck_acidity"),
        CheckConstraint("consistence BETWEEN 1 AND 5", name="ck_consistence"),
        CheckConstraint("alcohol BETWEEN 1 AND 5", name="ck_alcohol"),
        CheckConstraint("persistence BETWEEN 1 AND 5", name="ck_persistence"),
    )
