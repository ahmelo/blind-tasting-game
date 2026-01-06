from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.visual_evaluation import VisualEvaluation
from sqlalchemy import desc
from app.models.round import Round
from app.models.participant import Participant
from uuid import UUID

class EventService:

    @staticmethod
    def get_event_ranking(db, event_id):
        results = (
            db.query(
                Participant.id.label("participant_id"),
                Participant.name.label("participant_name"),
                func.sum(VisualEvaluation.score).label("total_score")
            )
            .join(VisualEvaluation, VisualEvaluation.participant_id == Participant.id)
            .join(Round, Round.id == VisualEvaluation.round_id)
            .filter(
                Round.event_id == event_id,
                VisualEvaluation.is_answer_key.is_(False)
            )
            .group_by(Participant.id, Participant.name)
            .order_by(func.sum(VisualEvaluation.score).desc())
            .all()
        )

        ranking = []

        for position, row in enumerate(results, start=1):
            participant_id, participant_name, total_score = row

            ranking.append({
                "position": position,
                "participant_id": participant_id,
                "participant_name": participant_name,
                "total_score": total_score
            })

        return ranking
    
    @staticmethod
    def get_event_winner(db: Session, event_id: UUID):
        ranking = EventService.get_event_ranking(db, event_id)

        if not ranking:
            return None

        return ranking[0]