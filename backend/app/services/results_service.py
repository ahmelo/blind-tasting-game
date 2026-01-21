from sqlalchemy.orm import Session
from app.models.evaluation import Evaluation
from app.models.round import Round
from app.enums.scale_type import resolve_scale_label, ATTRIBUTE_SCALE
from app.core.database import get_db
from fastapi import HTTPException

# Dicionário de traduções para valores de enums
ENUM_LABELS = {
    "limpidity": {
        "limpido": "Límpido",
        "turvo": "Turvo",
    },
    "color_type": {
        "branco": "Branco",
        "rose": "Rosé",
        "tinto": "Tinto",
    },
    "color_tone": {
        "esverdeado": "Esverdeado",
        "palha": "Palha",
        "dourado": "Dourado",
        "ambar": "Âmbar",
        "salmao": "Salmão",
        "alaranjado": "Alaranjado",
        "cor_de_rosa": "Cor-de-rosa",
        "avermelhado": "Avermelhado",
        "purpura": "Púrpura",
        "rubi": "Rubi",
        "granada": "Granada",
        "acastanhado": "Acastanhado",
    },
    "condition": {
        "correto": "Correto",
        "defeituoso": "Defeituoso",
    },
    "sweetness": {
        "seco": "Seco",
        "demi-sec": "Demi-Sec",
        "doce": "Doce",
    },
    "quality": {
        "pobre": "Pobre",
        "aceitável": "Aceitável",
        "boa": "Boa",
        "muito boa": "Muito Boa",
        "excelente": "Excelente",
    },
}

# Definição dos blocos e campos
BLOCKS = [
    {
        "key": "visual",
        "label": "Visual",
        "items": [
            ("limpidity", "Limpidez"),
            ("visualIntensity", "Intensidade Visual"),
            ("color_type", "Cor"),
            ("color_tone", "Tom"),
        ],
    },
    {
        "key": "olfactive",
        "label": "Olfativo",
        "items": [
            ("condition", "Condição"),
            ("aromaIntensity", "Intensidade Aromática"),
            ("aromas", "Aromas"),
        ],
    },
    {
        "key": "gustative",
        "label": "Gustativo",
        "items": [
            ("sweetness", "Doçura"),
            ("tannin", "Taninos"),
            ("alcohol", "Álcool"),
            ("consistence", "Corpo"),
            ("acidity", "Acidez"),
            ("persistence", "Final"),
            ("flavors", "Sabores"),
        ],
    },
    {
        "key": "general",
        "label": "Informações Gerais",
        "items": [
            ("quality", "Qualidade"),
            ("grape", "Uva Principal"),
            ("country", "País"),
            ("vintage", "Ano"),
        ],
    },
]


def _format_value(attribute: str, value):
    """
    Converte o valor bruto do banco para o que será exibido no resultado.
    """
    if value is None:
        return "—"

    # Campos que usam escala numérica
    if attribute in ATTRIBUTE_SCALE and isinstance(value, int):
        return resolve_scale_label(attribute, value)

    # Caso seja enum, extrai o valor antes de formatar
    if hasattr(value, 'value'):
        value = value.value
    
    value_str = str(value)
    
    # Verifica se há tradução específica para este atributo
    if attribute in ENUM_LABELS:
        return ENUM_LABELS[attribute].get(value_str, value_str)
    
    # Caso contrário, formata o valor
    formatted = value_str.replace("_", " ").replace("-", " ")
    return " ".join(word.capitalize() for word in formatted.split())


def _build_item(attribute, label, participant_eval, answer_key_eval):
    """
    Constrói o item de resultado, comparando participante vs gabarito.
    Para aromas e sabores, permite status 'partial'.
    """

    participant_value = getattr(participant_eval, attribute, None)
    answer_key_value = getattr(answer_key_eval, attribute, None)

    # Converte o valor para label legível
    participant_label = _format_value(attribute, participant_value)
    answer_key_label = _format_value(attribute, answer_key_value)

    # Tratamento especial para aromas e sabores (parcial)
    if attribute in ["aromas", "flavors"]:
        # transforma em sets de strings normalizadas
        participant_set = set(a.strip().lower() for a in participant_value.split(",")) if participant_value else set()
        answer_key_set = set(a.strip().lower() for a in answer_key_value.split(",")) if answer_key_value else set()

        matches = participant_set & answer_key_set

        if not matches:
            status = "wrong"
        elif matches == answer_key_set:
            status = "correct"
        else:
            status = "partial"
    else:
        # Demais atributos: comparação direta
        status = "correct" if participant_value == answer_key_value else "wrong"

    return {
        "key": attribute,
        "label": label,
        "participant": participant_label,
        "answer_key": answer_key_label,
        "status": status,
    }


def build_participant_result(
    participant_id: str,
    round_id: str,
    db: Session | None = None,
):
    close_db = False

    if db is None:
        db = next(get_db())
        close_db = True

    try:
        participant_eval = (
            db.query(Evaluation)
            .filter(
                Evaluation.participant_id == participant_id,
                Evaluation.round_id == round_id,
                Evaluation.is_answer_key == False,
            )
            .one_or_none()
        )

        answer_key_eval = (
            db.query(Evaluation)
            .filter(
                Evaluation.round_id == round_id,
                Evaluation.is_answer_key == True,
            )
            .one_or_none()
        )

        if not participant_eval:
            raise HTTPException(
                status_code=404,
                detail="Participante não respondeu este round."
            )

        if not answer_key_eval:
            raise HTTPException(
                status_code=409,
                detail="Resultado ainda não disponível para este round."
            )

        # Buscar o nome do round
        round_obj = db.query(Round).filter(Round.id == round_id).first()
        round_name = round_obj.name if round_obj else f"Round {round_id}"

        blocks = []

        for block in BLOCKS:
            items = []

            for attribute, label in block["items"]:
                # Regra: tanino não existe para vinho branco
                if attribute == "tannin" and participant_eval.color_type == "branco":
                    continue

                items.append(
                    _build_item(
                        attribute,
                        label,
                        participant_eval,
                        answer_key_eval,
                    )
                )

            blocks.append({
                "key": block["key"],
                "label": block["label"],
                "items": items,
            })

        return {
            "round_id": round_id,
            "round_name": round_name,
            "blocks": blocks,
        }

    finally:
        if close_db:
            db.close()

def get_my_results(
    db: Session,
    participant_id: str,
):
    # Descobrir os rounds que o participante respondeu
    round_ids = (
        db.query(Evaluation.round_id)
        .filter(
            Evaluation.participant_id == participant_id,
            Evaluation.is_answer_key == False,
        )
        .distinct()
        .all()
    )

    if not round_ids:
        raise HTTPException(
            status_code=404,
            detail="Nenhum resultado encontrado para este participante."
        )

    results = []

    for (round_id,) in round_ids:
        result = build_participant_result(
            participant_id=participant_id,
            round_id=round_id,
            db=db,
        )
        results.append(result)

    return results
