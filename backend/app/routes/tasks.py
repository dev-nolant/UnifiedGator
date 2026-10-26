from datetime import date, datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.db import get_client
from app.deps import membership

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])

Status = Literal["todo", "in_progress", "done"]


class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    due_date: date | None = None
    assignee_id: UUID | None = None


class TaskEdit(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    status: Status | None = None
    due_date: date | None = None
    assignee_id: UUID | None = None


def check_assignee(project_id, assignee_id):
    if not assignee_id:
        return
    on_project = get_client().table("members").select("user_id").eq("project_id", project_id).eq("user_id", assignee_id).execute().data
    if not on_project:
        raise HTTPException(400, "assignee isn't on this project")


def find_task(project_id, task_id):
    rows = get_client().table("tasks").select("*").eq("id", str(task_id)).eq("project_id", project_id).execute().data
    if not rows:
        raise HTTPException(404, "task not found")
    return rows[0]


@router.get("")
def list_tasks(m: dict = Depends(membership), status: Status | None = None):
    q = get_client().table("tasks").select("*").eq("project_id", m["project_id"])
    if status:
        q = q.eq("status", status)
    return q.order("due_date", nullsfirst=False).order("created_at").execute().data


@router.post("", status_code=201)
def create_task(body: TaskIn, m: dict = Depends(membership)):
    data = body.model_dump(mode="json")
    check_assignee(m["project_id"], data["assignee_id"])
    data |= {"project_id": m["project_id"], "created_by": m["user"]["id"]}
    return get_client().table("tasks").insert(data).execute().data[0]


@router.patch("/{task_id}")
def edit_task(task_id: UUID, body: TaskEdit, m: dict = Depends(membership)):
    task = find_task(m["project_id"], task_id)
    changes = body.model_dump(mode="json", exclude_unset=True)
    if not changes:
        return task
    if "assignee_id" in changes:
        check_assignee(m["project_id"], changes["assignee_id"])

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    return get_client().table("tasks").update(changes).eq("id", task["id"]).execute().data[0]


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: UUID, m: dict = Depends(membership)):
    task = find_task(m["project_id"], task_id)
    if task["created_by"] != m["user"]["id"] and m["role"] != "owner":
        raise HTTPException(403, "only whoever made it or the owner can delete it")
    get_client().table("tasks").delete().eq("id", task["id"]).execute()
