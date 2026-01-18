from app.models.evaluation import Evaluation
from sqlalchemy.orm import Session


class ScoreService:

    @staticmethod
    def calculate_score(
        evaluation: Evaluation,
        answer_key: Evaluation
    ) -> int:
        score = 0

        if evaluation.limpidity == answer_key.limpidity:
            score += 2

        if evaluation.visualIntensity == answer_key.visualIntensity:
            score += 5

        if evaluation.color_type == answer_key.color_type:
            score += 3

        if evaluation.color_tone == answer_key.color_tone:
            score += 3

        if evaluation.condition == answer_key.condition:
            score += 2

        if evaluation.aromaIntensity == answer_key.aromaIntensity:
            score += 5

        if evaluation.aromas != None:
            score += 1
        
        if evaluation.sweetness == answer_key.sweetness:
            score += 2

        # Tannin só é comparado se ambos têm valor (não é branco)
        if evaluation.tannin is not None and answer_key.tannin is not None and evaluation.tannin == answer_key.tannin:
            score += 5

        if evaluation.alcohol == answer_key.alcohol:
            score += 5

        if evaluation.consistence == answer_key.consistence:
            score += 5

        if evaluation.acidity == answer_key.acidity:
            score += 5

        if evaluation.persistence == answer_key.persistence:
            score += 5

        if evaluation.flavors != None:
            score += 1

        if evaluation.grape is not None and evaluation.grape == answer_key.grape:
            score += 5

        if evaluation.country is not None and evaluation.country == answer_key.country:
            score += 5

        if evaluation.vintage is not None and evaluation.vintage == answer_key.vintage:
            score += 5

        return score

    @staticmethod
    def get_answer_key(db: Session, round_id):
        return (
            db.query(Evaluation)
            .filter(Evaluation.round_id == round_id)
            .filter(Evaluation.is_answer_key.is_(True))
            .first()
        )

    @staticmethod
    def recalculate_scores(db: Session, round_id):
        answer_key = ScoreService.get_answer_key(db, round_id)
        if not answer_key:
            raise ValueError("Não existe gabarito para esta rodada.")

        evaluations = (
            db.query(Evaluation)
            .filter(
                Evaluation.round_id == round_id,
                Evaluation.is_answer_key.is_(False)
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