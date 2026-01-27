from enum import Enum


class BadgeCategory(Enum):
    INICIANTE = {
        "min_pct": 0.0,
        "max_pct": 15.0,
        "label": (
            "Está dando os primeiros passos no mundo do vinho. "
            "Já percebe diferenças básicas, mas ainda confunde aromas, estilos e estruturas."
            "Ótimo ponto de partida."
        ),
        "key": "iniciante",
    }
    EXPLORADOR = {
        "min_pct": 15.0,
        "max_pct": 30.0,
        "label": (
            "Demonstra curiosidade e já reconhece alguns aromas e características. "
            "Começa a criar repertório e conexões entre uva, estilo e sensação."
        ),
        "key": "explorador",
    }
    ENTUSIASTA = {
        "min_pct": 30.0,
        "max_pct": 50.0,
        "label": (
            "Tem boa percepção sensorial e vocabulário em formação. "
            "Consegue identificar padrões, estilos e já faz boas associações durante a degustação."
        ),
        "key": "entusiasta",
    }
    CONHECEDOR = {
        "min_pct": 50.0,
        "max_pct": 75.0,
        "label": (
            "Possui repertório sólido e boa precisão sensorial. "
            "Reconhece aromas, estrutura e estilos com segurança. "
            "Já entende o vinho além do gosto pessoal."
        ),
        "key": "conhecedor",
    }
    ESPECIALISTA = {
        "min_pct": 75.0,
        "max_pct": 100.01,
        "label": (
            "Excelente acuidade sensorial e domínio do vocabulário do vinho. "
            "Demonstra leitura técnica e sensível da taça, com alto nível de consistência."
        ),
        "key": "especialista",
    }
