from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.event_service import EventService
from app.schemas.event import EventRankingResponse  
from app.schemas.event import EventWinnerResponse
from app.models.event import Event
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

router = APIRouter()

class EventCreateRequest(BaseModel):
    name: str
    access_code: Optional[str] = None

class EventResponse(BaseModel):
    id: UUID
    name: str
    access_code: Optional[str]
    is_open: bool

@router.get("/events/{event_id}/winner", response_model=EventWinnerResponse)

def get_event_winner(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    winner = EventService.get_event_winner(db, event_id)

    if not winner:
        raise HTTPException(
            status_code=404,
            detail="No winner found for this event"
        )

    return {
        "event_id": event_id,
        "participant_id": winner["participant_id"],
        "participant_name": winner["participant_name"],
        "total_score": winner["total_score"]
    }

@router.get(
    "/events/{event_id}/ranking",
    response_model=List[EventRankingResponse]
)
def get_event_ranking(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    return EventService.get_event_ranking(db, event_id)

@router.get(
    "/events",
    response_model=List[EventResponse]
)
def list_events(db: Session = Depends(get_db)):
    results = db.query(Event).order_by(Event.created_at.desc()).all()
    return [EventResponse(id=r.id, name=r.name, access_code=r.access_code, is_open=r.is_open) for r in results]

@router.post("/events", response_model=EventResponse, status_code=201)
def create_event(payload: EventCreateRequest, db: Session = Depends(get_db)):
    event = Event(name=payload.name, access_code=payload.access_code)
    db.add(event)
    db.commit()
    db.refresh(event)
    return EventResponse(id=event.id, name=event.name, access_code=event.access_code, is_open=event.is_open)

@router.patch("/events/{event_id}", response_model=EventResponse)
def update_event(event_id: UUID, payload: EventCreateRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if payload.name is not None:
        event.name = payload.name
    event.access_code = payload.access_code

    db.add(event)
    db.commit()
    db.refresh(event)

    return EventResponse(id=event.id, name=event.name, access_code=event.access_code, is_open=event.is_open)

@router.patch("/events/{event_id}/open")
def set_event_open(event_id: UUID, open: bool, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.is_open = open
    db.add(event)
    db.commit()
    db.refresh(event)

    return {"id": event.id, "is_open": event.is_open}

@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: UUID, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return None
from app.models.round import Round
from pydantic import BaseModel

class OpenRoundResponse(BaseModel):
    id: UUID
    name: str
    position: int

@router.get(
    "/events/{event_id}/open-round",
    response_model=OpenRoundResponse
)
def get_open_round(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    round_obj = db.query(Round).filter(Round.event_id == event_id, Round.is_open.is_(True)).order_by(Round.position.asc()).first()
    if not round_obj:
        raise HTTPException(status_code=404, detail="No open round for this event")

    return OpenRoundResponse(id=round_obj.id, name=round_obj.name, position=round_obj.position)

@router.post("/events/{event_id}/close")
def close_event(event_id: str, db: Session = Depends(get_db)):
    try:
        EventService.close_event(db, event_id)
        return {"message": "Evento fechado com sucesso."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))