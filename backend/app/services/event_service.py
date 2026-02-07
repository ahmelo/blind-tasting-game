from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.evaluation import Evaluation
from sqlalchemy import desc
from app.models.round import Round
from app.models.participant import Participant
from app.models.participant_event import ParticipantEvent
from uuid import UUID
from app.models.event import Event


class EventService:

    @staticmethod
    def get_event_ranking(db, event_id):
        results = (
            db.query(
                Participant.id.label("participant_id"),
                Participant.name.label("participant_name"),
                ParticipantEvent.percentual.label("participant_percentual"),
                func.sum(Evaluation.score).label("total_score"),
            )
            .join(Evaluation, Evaluation.participant_id == Participant.id)
            .join(Round, Round.id == Evaluation.round_id)
            .join(ParticipantEvent, ParticipantEvent.participant_id == Participant.id)
            .filter(Round.event_id == event_id, Evaluation.is_answer_key.is_(False))
            .group_by(Participant.id, Participant.name, ParticipantEvent.percentual)
            .order_by(func.sum(Evaluation.score).desc())
            .limit(3)
            .all()
        )

        ranking = []

        current_position = 0
        last_score = None

        for row in results:
            participant_id, participant_name, participant_percentual, total_score = row

            if last_score is None or total_score < last_score:
                current_position += 1
                last_score = total_score

            ranking.append(
                {
                    "position": current_position,
                    "participant_id": participant_id,
                    "participant_name": participant_name,
                    "participant_percentual": participant_percentual,
                    "total_score": total_score,
                }
            )

        return ranking

    @staticmethod
    def get_event_winners(db: Session, event_id: UUID):
        ranking = EventService.get_event_ranking(db, event_id)

        if not ranking:
            return []

        top_score = ranking[0]["total_score"]

        winners = [item for item in ranking if item["total_score"] == top_score]

        return winners

    @staticmethod
    def close_event(db: Session, event_id: str):
        event = db.query(Event).filter(Event.id == event_id).first()

        if not event:
            raise ValueError("Evento não encontrado.")

        if not event.is_open:
            raise ValueError("Evento já está fechado.")

        open_rounds = (
            db.query(Round)
            .filter(Round.event_id == event_id, Round.is_open.is_(True))
            .count()
        )

        if open_rounds > 0:
            raise ValueError("Não é possível fechar o evento com rounds abertos.")

        event.is_open = False
        db.commit()

        return event
    
    @staticmethod
    def get_event_answer_key(db, event_id):
        rounds = (
            db.query(Round)
            .filter(Round.event_id == event_id)
            .order_by(Round.position.asc())
            .all()
        )

        result = []

        for r in rounds:
            evaluation = (
                db.query(Evaluation)
                .filter(
                    Evaluation.round_id == r.id,
                    Evaluation.is_answer_key.is_(True),
                )
                .first()
            )

            if not evaluation:
                continue  # rodada sem gabarito ainda

            result.append({
                "round_id": r.id,
                "round_name": r.name,

                "limpidity": evaluation.limpidity,
                "visualIntensity": evaluation.visualIntensity,
                "color_type": evaluation.color_type,
                "color_tone": evaluation.color_tone,

                "condition": evaluation.condition,
                "aromaIntensity": evaluation.aromaIntensity,
                "aromas": evaluation.aromas,

                "sweetness": evaluation.sweetness,
                "tannin": evaluation.tannin,
                "alcohol": evaluation.alcohol,
                "consistence": evaluation.consistence,
                "acidity": evaluation.acidity,
                "persistence": evaluation.persistence,
                "flavors": evaluation.flavors,

                "quality": evaluation.quality,
                "grape": evaluation.grape,
                "country": evaluation.country,
                "vintage": evaluation.vintage,
            })

        return result
