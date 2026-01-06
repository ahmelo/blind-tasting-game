import uuid
from sqlalchemy import Column, Integer, Boolean, DateTime, String, ForeignKey
from app.core.db_types import GUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Round(Base):
    __tablename__ = "rounds"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    event_id = Column(GUID(), ForeignKey("events.id"), nullable=False)
    name = Column(String(100), nullable=False)
    position = Column(Integer, nullable=False, default=1)
    is_open = Column(Boolean, nullable=False, default=True)
    answer_released = Column(Boolean, nullable=False, default=False)
    event = relationship("Event", back_populates="rounds")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    visual_evaluations = relationship(
        "VisualEvaluation",
        back_populates="round",
        cascade="all, delete-orphan"
    )