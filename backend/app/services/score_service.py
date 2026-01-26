from app.models.evaluation import Evaluation
from app.models.participant_event import ParticipantEvent
from app.models.round import Round  # ajuste import conforme seu projeto
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.enums.score import Score
from app.enums.badge_category import BadgeCategory


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
                score += Score.descritivos.value
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
                score += Score.descritivos.value
            elif status == "partial":
                score += Score.normal.value
        if evaluation.quality == answer_key.quality:
            score += Score.normal.value

        if evaluation.grape is not None and evaluation.grape == answer_key.grape:
            score += Score.uva.value

        if evaluation.country is not None and evaluation.country == answer_key.country:
            score += Score.pais.value

        if evaluation.vintage is not None and evaluation.vintage == answer_key.vintage:
            score += Score.safra.value

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

        score_max = ScoreService.calculate_score_absolute(answer_key)
        answer_key.score = score_max
        db.add(answer_key)
        db.flush()

        evaluations = (
            db.query(Evaluation)
            .filter(
                Evaluation.round_id == round_id, Evaluation.is_answer_key.is_(False)
            )
            .all()
        )

        for evaluation in evaluations:
            participant_score = ScoreService.calculate_score(evaluation, answer_key)
            evaluation.score = participant_score

        round = db.query(Round).get(round_id)
        if round:
            ScoreService.recalculate_event_totals(db, round.event_id)

        db.commit()
        return len(evaluations)

    @staticmethod
    def calculate_score_absolute(answer_key: Evaluation) -> int:
        # compara o gabarito consigo mesmo
        return ScoreService.calculate_score(answer_key, answer_key)

    @staticmethod
    def calculate_percentage(participant_score: int, score_absolute: int) -> float:
        if score_absolute == 0:
            return 0
        return (participant_score / score_absolute) * 100

    @staticmethod
    def get_badge(percentual: float) -> BadgeCategory:
        # assume BadgeCategory.value tem 'min_pct'
        sorted_badges = sorted(BadgeCategory, key=lambda b: b.value["min_pct"])
        chosen = sorted_badges[0]
        for badge in sorted_badges:
            if percentual >= badge.value["min_pct"]:
                chosen = badge
            else:
                break
        return chosen

    @staticmethod
    def recalculate_event_totals(db: Session, event_id):
        """
        Agrega resultados do evento e atualiza/insere ParticipantEvent.
        Considera apenas rounds que já possuam gabarito (is_answer_key=True) com score calculado.
        Retorna número de participantes atualizados.
        """
        # 1) buscar rounds do evento que tenham gabarito com score não-nulo
        rounds_with_answer = (
            db.query(Round.id)
            .join(Evaluation, Evaluation.round_id == Round.id)
            .filter(
                Round.event_id == event_id,
                Evaluation.is_answer_key.is_(True),
                Evaluation.score.isnot(None),
            )
            .distinct()
            .all()
        )
        round_ids = [r.id for r in rounds_with_answer]
        if not round_ids:
            return 0

        # 2) soma dos scores máximos (gabaritos) para essas rounds
        score_max_total = (
            db.query(func.coalesce(func.sum(Evaluation.score), 0))
            .filter(
                Evaluation.round_id.in_(round_ids), Evaluation.is_answer_key.is_(True)
            )
            .scalar()
        ) or 0

        # 3) soma do score por participante (somente avaliações de participantes)
        participant_scores = (
            db.query(
                Evaluation.participant_id,
                func.coalesce(func.sum(Evaluation.score), 0).label("score_total"),
            )
            .filter(
                Evaluation.round_id.in_(round_ids), Evaluation.is_answer_key.is_(False)
            )
            .group_by(Evaluation.participant_id)
            .all()
        )

        # 4) atualizar / inserir ParticipantEvent
        updated_count = 0
        for row in participant_scores:
            participant_id = row.participant_id
            score_total = int(row.score_total or 0)

            percentual = 0.0
            if score_max_total > 0:
                percentual = (score_total / score_max_total) * 100.0

            # arredonda para 2 casas (opcional)
            percentual = float(
                Decimal(percentual).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            )

            badge_enum = ScoreService.get_badge(percentual)
            badge = badge_enum.name
            badge_key = badge_enum.value["key"]

            pe = (
                db.query(ParticipantEvent)
                .filter(
                    ParticipantEvent.participant_id == participant_id,
                    ParticipantEvent.event_id == event_id,
                )
                .first()
            )

            if not pe:
                pe = ParticipantEvent(
                    participant_id=participant_id,
                    event_id=event_id,
                    score_total=score_total,
                    score_max_total=score_max_total,
                    percentual=percentual,
                    badge=badge,
                    badge_key=badge_key,
                )
                db.add(pe)
            else:
                pe.score_total = score_total
                pe.score_max_total = score_max_total
                pe.percentual = percentual
                pe.badge = badge
                db.add(pe)

            updated_count += 1

        db.commit()
        return updated_count
