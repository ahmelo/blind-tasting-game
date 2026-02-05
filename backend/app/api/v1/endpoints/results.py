from fastapi import APIRouter, Depends, Query
from app.schemas.results import EvaluationResultResponse
from app.services.results_service import build_participant_result
from app.dependencies import get_current_participant
from app.services.pdf_result_renderer import ResultPdfRenderer
from app.services.pdf_generator import PdfGenerator
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_participant
from app.services.results_service import get_my_results, get_my_event_result


router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/my-evaluation", response_model=EvaluationResultResponse)
def my_evaluation_result(
    round_id: str = Query(...),
    db: Session = Depends(get_db),
    participant=Depends(get_current_participant),
):
    return build_participant_result(participant_id=participant.id, round_id=round_id, db=db)


@router.get("/pdf")
def export_my_result_pdf(
    db: Session = Depends(get_db),
    participant=Depends(get_current_participant),
):
    results = get_my_results(db, participant.id)
    pe = get_my_event_result(db, participant.id)

    html = ResultPdfRenderer.render(
        participant_name=participant.name,
        results=results,
        score_total=pe.score_total,
        percentual=pe.percentual,
        badge=pe.badge,
    )

    pdf = PdfGenerator.from_html(html)

    return Response(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resultado-avaliacao.pdf"},
    )


@router.get("/my-event")
def my_event_result(
    db: Session = Depends(get_db),
    participant=Depends(get_current_participant),
):
    pe = get_my_event_result(db, participant.id)

    return {
        "total_score": pe.score_total,
        "score_max_total": pe.score_max_total,
        "percentual": pe.percentual,
        "badge": pe.badge,
        "badge_key": pe.badge_key,
    }
