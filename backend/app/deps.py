from uuid import UUID

from fastapi import Depends, HTTPException

from app.auth import current_user
from app.db import get_client


def membership(project_id: UUID, user: dict = Depends(current_user)) -> dict:
    project_id = str(project_id)
    rows = (
        get_client().table("members").select("role")
        .eq("project_id", project_id).eq("user_id", user["id"])
        .execute().data
    )
    # 404 so people can't go guessing project ids
    if not rows:
        raise HTTPException(404, "project not found")
    return {"project_id": project_id, "role": rows[0]["role"], "user": user}


def owner(m: dict = Depends(membership)) -> dict:
    if m["role"] != "owner":
        raise HTTPException(403, "only the owner can do that")
    return m
