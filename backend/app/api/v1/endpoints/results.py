from fastapi import APIRouter, Depends, Query
from app.schemas.results import EvaluationResultResponse
from app.services.results_service import build_participant_result
from app.dependencies import get_current_participant

router = APIRouter(prefix="/results", tags=["Results"])

@router.get("/my-evaluation", response_model=EvaluationResultResponse)
def my_evaluation_result(
    round_id: str = Query(...),
    participant = Depends(get_current_participant),
):
    return build_participant_result(
        participant_id=participant.id,
        round_id=round_id
    )
