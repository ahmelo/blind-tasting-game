from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.api.v1.endpoints import auth
from app.core.database import Base, engine
from scripts.init_mvp import init_mvp

# IMPORTANTE: importar TODOS os models que viram tabela
from app.models.event import Event
from app.models.participant import Participant
from app.models.round import Round
from app.models.evaluation import Evaluation

# cria as tabelas no startup (DEV only)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blind Tasting Game")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # se usar React CRA
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    init_mvp()
