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
    ARRAY,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.db_types import GUID
from app.core.database import Base
from app.enums.country import Country
from app.enums.grape import Grape


class Wine(Base):
    __tablename__ = "wine"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    round_id = Column(GUID(), ForeignKey("rounds.id"), nullable=False, unique=True)

    grapes = Column(ARRAY(String), nullable=True)  # Lista de uvas (para blends)
    country = Column(Enum(Country, name="country_enum"), nullable=True)
    vintage = Column(Integer, nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    round = relationship("Round", back_populates="wine")
