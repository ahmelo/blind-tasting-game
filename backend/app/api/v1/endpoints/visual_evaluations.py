from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.visual_evaluation import VisualEvaluationCreate, VisualEvaluationResponse
from app.services.visual_evaluation_service import VisualEvaluationService
from app.services.round_service import RoundService
from app.services.score_service import ScoreService
from app.schemas.ranking import RoundRankingItem
from uuid import UUID
from typing import List
from app.schemas.winner import RoundWinner
from app.models.visual_evaluation import VisualEvaluation
from app.models.round import Round

router = APIRouter()

@router.post(
    "/visual-evaluations",
    response_model=VisualEvaluationResponse
)
def create_visual_evaluation(
    payload: VisualEvaluationCreate,
    db: Session = Depends(get_db)
):
    try:
        return VisualEvaluationService.create(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.get("/visual-evaluations/answered-rounds", response_model=List[UUID])
def answered_rounds(participant_id: UUID, event_id: UUID, db: Session = Depends(get_db)):
    rows = (
        db.query(VisualEvaluation.round_id)
        .join(Round, VisualEvaluation.round_id == Round.id)
        .filter(VisualEvaluation.participant_id == participant_id, Round.event_id == event_id)
        .distinct()
        .all()
    )
    return [row[0] for row in rows]


