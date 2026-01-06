import uuid
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.participant import Participant, UserRole
from app.core.security import hash_password

SOMMELIER_NAME = "André"
SOMMELIER_PASSWORD = "Tchucos2708"

def init_sommelier():
    db: Session = SessionLocal()

    # Verifica se o sommelier já existe
    existing = db.query(Participant).filter(
        Participant.name == SOMMELIER_NAME,
        Participant.role == UserRole.SOMMELIER
    ).first()

    if existing:
        print(f"Sommelier '{SOMMELIER_NAME}' já existe com id {existing.id}")
        db.close()
        return

    # Cria o sommelier
    sommelier = Participant(
        id=str(uuid.uuid4()),
        name=SOMMELIER_NAME,
        role=UserRole.SOMMELIER,
        password_hash=hash_password(SOMMELIER_PASSWORD)
    )

    db.add(sommelier)
    db.commit()
    db.close()
    print(f"Sommelier '{SOMMELIER_NAME}' criado com sucesso!")

if __name__ == "__main__":
    init_sommelier()
