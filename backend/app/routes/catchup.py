from fastapi import APIRouter

router = APIRouter(prefix="/catchup", tags=["catchup"])

# ai summary of recent activity, openrouter. label it as ai in the ui
