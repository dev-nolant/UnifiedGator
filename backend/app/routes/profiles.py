from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth import current_user
from app.db import get_client

router = APIRouter(prefix="/me", tags=["profiles"])


class ProfileEdit(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)


@router.get("")
def my_profile(user: dict = Depends(current_user)):
    return get_client().table("profiles").select("id, email, display_name").eq("id", user["id"]).single().execute().data


@router.patch("")
def edit_profile(body: ProfileEdit, user: dict = Depends(current_user)):
    return get_client().table("profiles").update(body.model_dump()).eq("id", user["id"]).execute().data[0]
