from enum import Enum


class BadgeCategory(Enum):
    INICIANTE = {
        "min_pct": 0.0,
        "max_pct": 15.0,
        "label": "Iniciando o Paladar",
        "key": "iniciante",
    }
    EXPLORADOR = {
        "min_pct": 15.0,
        "max_pct": 30.0,
        "label": "Degustador Curioso",
        "key": "explorador",
    }
    ENTUSIASTA = {
        "min_pct": 30.0,
        "max_pct": 50.0,
        "label": "Paladar Afiado",
        "key": "entusiasta",
    }
    EXPERIENTE = {
        "min_pct": 50.0,
        "max_pct": 75.0,
        "label": "Nariz Treinado",
        "key": "experiente",
    }
    ESPECIALISTA = {
        "min_pct": 75.0,
        "max_pct": 100.01,
        "label": "Leitor de Taça",
        "key": "especialista",
    }
