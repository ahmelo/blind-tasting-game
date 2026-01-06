from fastapi import APIRouter
from app.api.v1.endpoints import visual_evaluations
from app.api.v1.endpoints import events
from app.api.v1.endpoints import rounds
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import participants

api_router = APIRouter()

api_router.include_router(
    visual_evaluations.router,
    tags=["Visual Evaluations"]
)

api_router.include_router(
    events.router,
    tags=["Events"]
)

api_router.include_router(
    rounds.router,
    tags=["Rounds"]
)

api_router.include_router(
    auth.router,
    tags=["Authentication"]
)

api_router.include_router(
    participants.router,
    tags=["Participants"]
)
