from enum import Enum

class UserRole(str, Enum):
    PARTICIPANT = "participant"
    SOMMELIER = "sommelier"