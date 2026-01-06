from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID

from app.models.participant import Participant, UserRole
from app.core.database import get_db
from app.core.security import verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    name: str
    password: str

class LoginResponse(BaseModel):
    participant_id: UUID
    name: str
    is_sommelier: bool

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Participant).filter(
        Participant.name == payload.name,
        Participant.role == UserRole.SOMMELIER
    ).first()

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Nome ou senha inválidos")

    return LoginResponse(
        participant_id=user.id,
        name=user.name,
        is_sommelier=True
    )
