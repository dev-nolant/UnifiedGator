from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth import current_user
from app.db import get_client
from app.deps import membership, owner

router = APIRouter(prefix="/projects", tags=["projects"])

FIELDS = "id, name, description, due_date, created_at"


class ProjectIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = ""
    due_date: date | None = None


class ProjectEdit(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None


@router.get("")
def my_projects(user: dict = Depends(current_user)):
    return (
        get_client().table("projects")
        .select(f"{FIELDS}, members!inner(user_id)")
        .eq("members.user_id", user["id"])
        .order("due_date", nullsfirst=False)
        .execute().data
    )


@router.post("", status_code=201)
def create_project(body: ProjectIn, user: dict = Depends(current_user)):
    data = {**body.model_dump(mode="json"), "owner_id": user["id"]}
    return get_client().table("projects").insert(data).execute().data[0]


@router.get("/{project_id}")
def get_project(m: dict = Depends(membership)):
    project = (
        get_client().table("projects")
        .select(f"{FIELDS}, members(role, user:profiles(id, email, display_name))")
        .eq("id", m["project_id"])
        .single().execute().data
    )
    statuses = [t["status"] for t in get_client().table("tasks").select("status").eq("project_id", m["project_id"]).execute().data]
    project["progress"] = {s: statuses.count(s) for s in ("todo", "in_progress", "done")}
    project["my_role"] = m["role"]
    return project


@router.patch("/{project_id}")
def edit_project(body: ProjectEdit, m: dict = Depends(owner)):
    changes = body.model_dump(mode="json", exclude_unset=True)
    return get_client().table("projects").update(changes).eq("id", m["project_id"]).execute().data[0]


@router.delete("/{project_id}", status_code=204)
def delete_project(m: dict = Depends(owner)):
    get_client().table("projects").delete().eq("id", m["project_id"]).execute()
