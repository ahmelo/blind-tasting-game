from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.visual_evaluation import VisualEvaluation
from uuid import UUID

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
