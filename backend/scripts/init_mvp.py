import uuid
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.participant import Participant, UserRole
from app.models.event import Event
from app.models.round import Round

# Configurações iniciais
SOMMELIER_NAME = "Andre"
SOMMELIER_PASSWORD = "2708"  # <= senha curta, segura para bcrypt

TEST_PARTICIPANT_NAME = "Samantha"
EVENT_NAME = "Degustação Inicial"

def init_mvp():
    # Cria tabelas caso não existam
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # --- 1. Sommelier ---
    sommelier = db.query(Participant).filter(
        Participant.name == SOMMELIER_NAME,
        Participant.role == UserRole.SOMMELIER
    ).first()

    if not sommelier:
        sommelier = Participant(
            id=str(uuid.uuid4()),
            name=SOMMELIER_NAME,
            role=UserRole.SOMMELIER,
            password_hash=hash_password(SOMMELIER_PASSWORD)
        )
        db.add(sommelier)
        db.commit()
        print(f"Sommelier '{SOMMELIER_NAME}' criado.")
    else:
        print(f"Sommelier '{SOMMELIER_NAME}' já existe.")

    # --- 2. Participante de teste ---
    participant = db.query(Participant).filter(
        Participant.name == TEST_PARTICIPANT_NAME,
        Participant.role == UserRole.PARTICIPANT
    ).first()

    if not participant:
        participant = Participant(
            id=str(uuid.uuid4()),
            name=TEST_PARTICIPANT_NAME,
            role=UserRole.PARTICIPANT,
            password_hash=None
        )
        db.add(participant)
        db.commit()
        print(f"Participante de teste '{TEST_PARTICIPANT_NAME}' criado.")
    else:
        print(f"Participante '{TEST_PARTICIPANT_NAME}' já existe.")

    # --- 3. Evento inicial ---
    event = db.query(Event).filter(Event.name == EVENT_NAME).first()
    if not event:
        event = Event(
            id=str(uuid.uuid4()),
            name=EVENT_NAME,
            is_open=True,
            created_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()
        print(f"Evento '{EVENT_NAME}' criado.")
    else:
        print(f"Evento '{EVENT_NAME}' já existe.")

    # --- 4. Primeira rodada ---
    round_ = db.query(Round).filter(Round.event_id == event.id, Round.position == 1).first()
    if not round_:
        round_ = Round(
            id=str(uuid.uuid4()),
            event_id=event.id,
            position=1,
            name="Rodada 1",
            answer_released=False
        )
        db.add(round_)
        db.commit()
        print(f"Rodada 1 do evento '{EVENT_NAME}' criada.")
    else:
        print(f"Rodada 1 do evento '{EVENT_NAME}' já existe.")

    round_ = db.query(Round).filter(Round.event_id == event.id, Round.position == 2).first()
    if not round_:
        round_ = Round(
            id=str(uuid.uuid4()),
            event_id=event.id,
            position=2,
            name="Rodada 2",
            answer_released=False
        )
        db.add(round_)
        db.commit()
        print(f"Rodada 2 do evento '{EVENT_NAME}' criada.")
    else:
        print(f"Rodada 2 do evento '{EVENT_NAME}' já existe.")

    db.close()
    print("Inicialização do MVP concluída!")

if __name__ == "__main__":
    init_mvp()
