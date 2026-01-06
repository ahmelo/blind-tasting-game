from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.round_service import RoundService
from app.services.score_service import ScoreService
from app.schemas.ranking import RoundRankingItem
from app.schemas.winner import RoundWinner
from app.schemas.round import RoundCreateRequest, RoundUpdateRequest, RoundResponse
from app.models.round import Round
from app.models.event import Event
from uuid import UUID
from typing import List


router = APIRouter()

@router.post("/rounds/{round_id}/recalculate-scores")
def recalculate_scores(
    round_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        total = ScoreService.recalculate_scores(db, round_id)
        return {
            "round_id": round_id,
            "evaluations_updated": total
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/rounds/{round_id}/ranking",
    response_model=List[RoundRankingItem]
)
def get_round_ranking(
    round_id: UUID,
    db: Session = Depends(get_db)
):
    return RoundService.get_round_ranking(db, round_id)

@router.get(
    "/rounds/{round_id}/winner",
    response_model=List[RoundWinner]
)
def get_round_winner(
    round_id: UUID,
    db: Session = Depends(get_db)
):
    return RoundService.get_round_winner(db, round_id)

# CRUD for rounds
@router.get("/rounds")
def list_rounds(event_id: UUID, db: Session = Depends(get_db)):
    rounds = db.query(Round).filter(Round.event_id == event_id).order_by(Round.position.asc()).all()
    return [RoundResponse(id=r.id, name=r.name, position=r.position, is_open=r.is_open, event_id=r.event_id) for r in rounds]

@router.post("/rounds", response_model=RoundResponse, status_code=201)
def create_round(payload: RoundCreateRequest, db: Session = Depends(get_db)):
    # ensure event exists and is open
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not event.is_open:
        raise HTTPException(status_code=400, detail="Event is not open")

    position = payload.position if payload.position is not None else 1
    # if position collides, we let DB accept and default handling for now
    r = Round(name=payload.name, position=position, event_id=payload.event_id)
    db.add(r)
    db.commit()
    db.refresh(r)
    return RoundResponse(id=r.id, name=r.name, position=r.position, is_open=r.is_open, event_id=r.event_id)

@router.patch("/rounds/{round_id}", response_model=RoundResponse)
def update_round(round_id: UUID, payload: RoundUpdateRequest, db: Session = Depends(get_db)):
    r = db.query(Round).filter(Round.id == round_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Round not found")

    if payload.name is not None:
        r.name = payload.name
    if payload.position is not None:
        r.position = payload.position
    if payload.is_open is not None:
        r.is_open = payload.is_open

    db.add(r)
    db.commit()
    db.refresh(r)

    return RoundResponse(id=r.id, name=r.name, position=r.position, is_open=r.is_open, event_id=r.event_id)

@router.delete("/rounds/{round_id}", status_code=204)
def delete_round(round_id: UUID, db: Session = Depends(get_db)):
    r = db.query(Round).filter(Round.id == round_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Round not found")
    db.delete(r)
    db.commit()
    return None