from app.models.evaluation import Evaluation
from sqlalchemy.orm import Session
from app.enums.score import Score


class ScoreService:

    @staticmethod
    def compare_list_attribute(
        participant_value: str | None, answer_key_value: str | None
    ) -> str:
        participant_set = (
            set(a.strip().lower() for a in participant_value.split(","))
            if participant_value
            else set()
        )
        answer_key_set = (
            set(a.strip().lower() for a in answer_key_value.split(","))
            if answer_key_value
            else set()
        )

        matches = participant_set & answer_key_set

        if not matches:
            return "wrong"
        elif matches == answer_key_set:
            return "correct"
        else:
            return "partial"

    @staticmethod
    def calculate_score(evaluation: Evaluation, answer_key: Evaluation) -> int:
        score = 0

        if evaluation.limpidity == answer_key.limpidity:
            score += Score.normal.value

        if evaluation.visualIntensity == answer_key.visualIntensity:
            score += Score.normal.value

        if evaluation.color_type == answer_key.color_type:
            score += Score.normal.value

        if evaluation.color_tone == answer_key.color_tone:
            score += Score.normal.value

        if evaluation.condition == answer_key.condition:
            score += Score.normal.value

        if evaluation.aromaIntensity == answer_key.aromaIntensity:
            score += Score.normal.value

        if evaluation.aromas is not None and answer_key.aromas is not None:
            status = ScoreService.compare_list_attribute(
                evaluation.aromas, answer_key.aromas
            )
            if status == "correct":
                score += Score.extra.value
            elif status == "partial":
                score += Score.normal.value

        if evaluation.sweetness == answer_key.sweetness:
            score += Score.normal.value

        # Tannin só é comparado se ambos têm valor (não é branco)
        if (
            evaluation.tannin is not None
            and answer_key.tannin is not None
            and evaluation.tannin == answer_key.tannin
        ):
            score += Score.normal.value

        if evaluation.alcohol == answer_key.alcohol:
            score += Score.normal.value

        if evaluation.consistence == answer_key.consistence:
            score += Score.normal.value

        if evaluation.acidity == answer_key.acidity:
            score += Score.normal.value

        if evaluation.persistence == answer_key.persistence:
            score += Score.normal.value
        if evaluation.flavors is not None and answer_key.flavors is not None:
            status = ScoreService.compare_list_attribute(
                evaluation.flavors, answer_key.flavors
            )
            if status == "correct":
                score += Score.extra.value
            elif status == "partial":
                score += Score.normal.value
        if evaluation.quality == answer_key.quality:
            score += Score.normal.value

        if evaluation.grape is not None and evaluation.grape == answer_key.grape:
            score += Score.maximum.value

        if evaluation.country is not None and evaluation.country == answer_key.country:
            score += Score.maximum.value

        if evaluation.vintage is not None and evaluation.vintage == answer_key.vintage:
            score += Score.maximum.value

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
                Evaluation.round_id == round_id, Evaluation.is_answer_key.is_(False)
            )
            .all()
        )

        for evaluation in evaluations:
            evaluation.score = ScoreService.calculate_score(evaluation, answer_key)

        db.commit()
        return len(evaluations)
