import uuid
from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey,
    DateTime,
    String,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from app.core.db_types import GUID
from app.core.database import Base


class ParticipantEvent(Base):
    __tablename__ = "participant_events"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    participant_id = Column(GUID(), ForeignKey("participants.id"), nullable=False)
    event_id = Column(GUID(), ForeignKey("events.id"), nullable=False)

    score_total = Column(
        Integer, default=0, nullable=False
    )  # soma dos scores do participante
    score_max_total = Column(
        Integer, default=0, nullable=False
    )  # soma dos scores máximos do sommelier por rodada
    percentual = Column(Float, default=0.0, nullable=False)
    badge = Column(String, nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (UniqueConstraint("participant_id", "event_id"),)
