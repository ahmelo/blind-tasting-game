from enum import Enum


class BadgeCategory(Enum):
    INICIANTE = {"min_pct": 0.0, "max_pct": 50.0, "label": "Iniciando o Paladar"}
    CURIOSO = {"min_pct": 50.0, "max_pct": 70.0, "label": "Degustador Curioso"}
    AFIADO = {"min_pct": 70.0, "max_pct": 85.0, "label": "Paladar Afiado"}
    TREINADO = {"min_pct": 85.0, "max_pct": 95.0, "label": "Nariz Treinado"}
    SOMMELIER = {"min_pct": 95.0, "max_pct": 100.01, "label": "Leitor de Taça"}
