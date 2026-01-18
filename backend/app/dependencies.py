from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.participant import Participant


def get_current_participant(
    x_participant_id: str = Header(..., alias="X-Participant-Id"),
    db: Session = Depends(get_db)
) -> Participant:
    try:
        participant_id = UUID(x_participant_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid participant id"
        )

    participant = (
        db.query(Participant)
        .filter(Participant.id == participant_id)
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Participant not found"
        )

    return participant
