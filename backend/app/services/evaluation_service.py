from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from app.models.round import Round
from app.models.wine import Wine

from app.models.evaluation import Evaluation
from app.services.score_service import ScoreService
from app.schemas.evaluation import EvaluationCreate
from typing import Optional

class EvaluationService:

    @staticmethod
    def get_answer_key(
        db: Session,
        round_id
    ) -> Optional[Evaluation]:
        return (
            db.query(Evaluation)
            .filter(
                Evaluation.round_id == round_id,
                Evaluation.is_answer_key.is_(True)
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        payload: EvaluationCreate
    ) -> Evaluation:
        # Se for gabarito, pré-preencher dados do Wine
        grape = payload.grape
        country = payload.country
        vintage = payload.vintage
        
        if payload.is_answer_key:
            wine = db.query(Wine).filter(Wine.round_id == payload.round_id).first()
            if wine:
                # Usar informações do Wine se disponíveis
                if wine.grapes:
                    # Se houver múltiplas uvas, usar a primeira (ou a que foi passada)
                    if not grape:
                        # Pegar o valor do enum correto
                        from app.enums.grape import Grape
                        # Tenta encontrar a primeira uva que existe no enum
                        for grape_obj in Grape:
                            if grape_obj.value in wine.grapes:
                                grape = grape_obj
                                break
                if wine.country:
                    country = wine.country
                if wine.vintage:
                    vintage = wine.vintage
        
        evaluation = Evaluation(
            participant_id=payload.participant_id,
            round_id=payload.round_id,
            limpidity=payload.limpidity,
            visualIntensity=payload.visualIntensity,
            color_type=payload.color_type,
            color_tone=payload.color_tone,
            is_answer_key=payload.is_answer_key,
            condition=payload.condition,
            aromaIntensity=payload.aromaIntensity,
            aromas=payload.aromas,
            sweetness=payload.sweetness,
            tannin=payload.tannin,
            acidity=payload.acidity,
            consistence=payload.consistence,
            alcohol=payload.alcohol,
            persistence=payload.persistence,
            flavors=payload.flavors,
            quality=payload.quality,
            grape=grape,
            country=country,
            vintage=vintage
        )

        try:
            db.add(evaluation)
            db.commit()
            db.refresh(evaluation)

            # 👉 Se NÃO for gabarito, calcular score
            if not evaluation.is_answer_key:
                answer_key = EvaluationService.get_answer_key(
                    db,
                    evaluation.round_id
                )

                if answer_key:
                    evaluation.score = ScoreService.calculate_score(
                        evaluation,
                        answer_key,
                        db=db,
                        round_id=evaluation.round_id
                    )
                    db.commit()
                    db.refresh(evaluation)

            return evaluation

        except IntegrityError:
            db.rollback()
            raise ValueError(
                "Avaliação já existe para este participante nesta rodada."
            )
