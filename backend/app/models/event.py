import uuid
from sqlalchemy import Column, String, DateTime, Boolean
from app.core.db_types import GUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    access_code = Column(String, unique=True, nullable=True)
    is_open = Column(Boolean, default=True, nullable=False)  # <-- novo campo
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    rounds = relationship(
        "Round",
        back_populates="event",
        cascade="all, delete-orphan"
    )