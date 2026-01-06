from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from app.models.round import Round

from app.models.visual_evaluation import VisualEvaluation
from app.services.score_service import ScoreService
from app.schemas.visual_evaluation import VisualEvaluationCreate
from typing import Optional

class VisualEvaluationService:

    @staticmethod
    def get_answer_key(
        db: Session,
        round_id
    ) -> Optional[VisualEvaluation]:
        return (
            db.query(VisualEvaluation)
            .filter(
                VisualEvaluation.round_id == round_id,
                VisualEvaluation.is_answer_key.is_(True)
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        payload: VisualEvaluationCreate
    ) -> VisualEvaluation:

        visual_evaluation = VisualEvaluation(
            participant_id=payload.participant_id,
            round_id=payload.round_id,
            limpidity=payload.limpidity,
            intensity=payload.intensity,
            color_type=payload.color_type,
            color_tone=payload.color_tone,
            is_answer_key=payload.is_answer_key
        )

        try:
            db.add(visual_evaluation)
            db.commit()
            db.refresh(visual_evaluation)

            # 👉 Se NÃO for gabarito, calcular score
            if not visual_evaluation.is_answer_key:
                answer_key = VisualEvaluationService.get_answer_key(
                    db,
                    visual_evaluation.round_id
                )

                if answer_key:
                    visual_evaluation.score = ScoreService.calculate_score(
                        visual_evaluation,
                        answer_key
                    )
                    db.commit()
                    db.refresh(visual_evaluation)

            return visual_evaluation

        except IntegrityError:
            db.rollback()
            raise ValueError(
                "Avaliação visual já existe para este participante nesta rodada."
            )
