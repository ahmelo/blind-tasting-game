from enum import Enum

class Quality(str, Enum):
    pobre = "pobre"
    aceitavel = "aceitável"
    boa = "boa"
    muito_boa = "muito boa"
    excelente = "excelente"
