from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse
from app.services.evaluation_service import EvaluationService
from uuid import UUID
from typing import List
from app.models.evaluation import Evaluation
from app.models.round import Round

router = APIRouter()

@router.post(
    "/evaluations",
    response_model=EvaluationResponse
)
def create_evaluation(
    payload: EvaluationCreate,
    db: Session = Depends(get_db)
):
    try:
        return EvaluationService.create(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.get("/evaluations/answered-rounds", response_model=List[UUID])
def answered_rounds(participant_id: UUID, event_id: UUID, db: Session = Depends(get_db)):
    rows = (
        db.query(Evaluation.round_id)
        .join(Round, Evaluation.round_id == Round.id)
        .filter(Evaluation.participant_id == participant_id, Round.event_id == event_id)
        .distinct()
        .all()
    )
    return [row[0] for row in rows]


