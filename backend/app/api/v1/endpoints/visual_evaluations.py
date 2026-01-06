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




