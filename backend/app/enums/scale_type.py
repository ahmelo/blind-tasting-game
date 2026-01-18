from enum import Enum

class ScaleType(str, Enum):
    INTENSITY = "intensity"
    STRUCTURE = "structure"
    PERSISTENCE = "persistence"

SCALE_LABELS = {
    ScaleType.INTENSITY: {
        1: "Baixa",
        2: "Média-Menos",
        3: "Média",
        4: "Média-Mais",
        5: "Alta",
    },
    ScaleType.STRUCTURE: {
        1: "Baixo",
        2: "Médio-Menos",
        3: "Médio",
        4: "Médio-Mais",
        5: "Alto",
    },
    ScaleType.PERSISTENCE: {
        1: "Pouco",
        2: "Médio-Menos",
        3: "Médio",
        4: "Médio-Mais",
        5: "Longo",
    },
}

ATTRIBUTE_SCALE = {
    "visualIntensity": ScaleType.INTENSITY,
    "aromaIntensity": ScaleType.INTENSITY,
    "acidity": ScaleType.INTENSITY,

    "tannin": ScaleType.STRUCTURE,
    "alcohol": ScaleType.STRUCTURE,
    "consistence": ScaleType.STRUCTURE,

    "persistence": ScaleType.PERSISTENCE,
}

def resolve_scale_label(attribute: str, value: int) -> str:
    scale = ATTRIBUTE_SCALE.get(attribute)
    if not scale or value is None:
        return "—"

    return SCALE_LABELS[scale].get(value, "—")
