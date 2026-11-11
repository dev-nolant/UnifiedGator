from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import current_user
from app.db import get_client

router = APIRouter(prefix="/me", tags=["profiles"])


class ProfileEdit(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=120)
    # Adding gator, forest, and ocean themes
    theme: Literal["gator", "forest", "ocean"] | None = None


@router.get("")
def my_profile(user: dict = Depends(current_user)):
    return get_client().table("profiles").select("id, email, display_name, theme").eq("id", user["id"]).single().execute().data


@router.patch("")
# body is ProfileEdit json sent
def edit_profile(body: ProfileEdit, user: dict = Depends(current_user)):
    # fields included in the request, display_name kept if theme changes
    updates = body.model_dump(exclude_unset=True)
    # if there are no updates to fields
    if not updates:
        raise HTTPException(status_code=400, detail="No Updates")
    #return lines on user profile
    return get_client().table("profiles").update(updates).eq("id", user["id"]).execute().data[0]
