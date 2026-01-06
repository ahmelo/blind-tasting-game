from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.participant import ParticipantJoinRequest, ParticipantJoinResponse
from app.models.event import Event
from app.models.participant import Participant

router = APIRouter()

@router.post("/participants/join", response_model=ParticipantJoinResponse)
def join_participant(payload: ParticipantJoinRequest, db: Session = Depends(get_db)):
    # Find event by access code
    event = db.query(Event).filter(Event.access_code == payload.event_code).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Find existing participant for this event by name
    participant = db.query(Participant).filter(
        Participant.name == payload.name,
        Participant.event_id == event.id
    ).first()

    if not participant:
        participant = Participant(name=payload.name, event_id=event.id)
        db.add(participant)
        db.commit()
        db.refresh(participant)

    return ParticipantJoinResponse(
        participant_id=participant.id,
        name=participant.name,
        event_id=event.id,
        event_code=event.access_code
    )
