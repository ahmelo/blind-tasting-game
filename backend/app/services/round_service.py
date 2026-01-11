from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.visual_evaluation import VisualEvaluation
from uuid import UUID
from app.models.round import Round
from fastapi import HTTPException
from app.services.score_service import ScoreService

class RoundService:
    
    @staticmethod
    def get_round_ranking(db, round_id):
        return (
            db.query(
                VisualEvaluation.participant_id,
                func.sum(VisualEvaluation.score).label("total_score")
            )
            .filter(
                VisualEvaluation.round_id == round_id,
                VisualEvaluation.is_answer_key.is_(False)
            )
            .group_by(VisualEvaluation.participant_id)
            .order_by(func.sum(VisualEvaluation.score).desc())
            .all()
        )
    
    @staticmethod
    def get_round_winner(db, round_id):
        ranking = RoundService.get_round_ranking(db, round_id)

        if not ranking:
            return []

        highest_score = ranking[0].total_score

        winners = [
            {
                "participant_id": item.participant_id,
                "total_score": item.total_score
            }
            for item in ranking
            if item.total_score == highest_score
        ]

        return winners

    @staticmethod
    def close_round(db: Session, round_id: str):
        # 1️⃣ Buscar o round
        round_obj = (
            db.query(Round)
            .filter(Round.id == round_id)
            .first()
        )

        if not round_obj:
            raise HTTPException(
                status_code=404,
                detail="Round não encontrado"
            )

        if not round_obj.is_open:
            raise HTTPException(
                status_code=400,
                detail="Round já está fechado"
            )

        # 2️⃣ Recalcular scores (usa ScoreService)
        try:
            total_scored = ScoreService.recalculate_scores(db, round_id)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )

        # 3️⃣ Fechar o round
        round_obj.is_open = False
        db.commit()

        return {
            "round_id": round_id,
            "status": "closed",
            "evaluations_scored": total_scored
        }
