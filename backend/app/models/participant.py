import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from app.core.db_types import GUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    PARTICIPANT = "participant"
    SOMMELIER = "sommelier"

class Participant(Base):
    __tablename__ = "participants"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    event_id = Column(GUID(), ForeignKey("events.id"), nullable=True)

    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PARTICIPANT)
    password_hash = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    visual_evaluations = relationship(
        "VisualEvaluation",
        back_populates="participant"
    )