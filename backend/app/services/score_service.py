from app.models.visual_evaluation import VisualEvaluation
from sqlalchemy.orm import Session


class ScoreService:

    @staticmethod
    def calculate_score(
        evaluation: VisualEvaluation,
        answer_key: VisualEvaluation
    ) -> int:
        score = 0

        if evaluation.limpidity == answer_key.limpidity:
            score += 2

        if evaluation.intensity == answer_key.intensity:
            score += 5

        if evaluation.color_type == answer_key.color_type:
            score += 2

        if evaluation.color_tone == answer_key.color_tone:
            score += 1

        return score

    @staticmethod
    def get_answer_key(db: Session, round_id):
        return (
            db.query(VisualEvaluation)
            .filter(VisualEvaluation.round_id == round_id)
            .filter(VisualEvaluation.is_answer_key.is_(True))
            .first()
        )

    @staticmethod
    def recalculate_scores(db: Session, round_id):
        answer_key = ScoreService.get_answer_key(db, round_id)
        if not answer_key:
            raise ValueError("Não existe gabarito para esta rodada.")

        evaluations = (
            db.query(VisualEvaluation)
            .filter(
                VisualEvaluation.round_id == round_id,
                VisualEvaluation.is_answer_key.is_(False)
            )
            .all()
        )

        for evaluation in evaluations:
            evaluation.score = ScoreService.calculate_score(
                evaluation,
                answer_key
            )

        db.commit()
        return len(evaluations)