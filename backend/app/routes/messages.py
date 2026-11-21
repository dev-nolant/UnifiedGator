from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.db import get_client
from app.deps import membership

router = APIRouter(
    prefix="/projects/{project_id}/messages",
    tags=["messages"],
)

MESSAGE_FIELDS = (
    "id, project_id, sender_id, content, created_at, "
    "sender:profiles!project_messages_sender_id_fkey(id, email, display_name)"
)


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


@router.get("")
def list_messages(
    m: dict = Depends(membership),
    limit: int = Query(default=100, ge=1, le=100),
):
    rows = (
        get_client()
        .table("project_messages")
        .select(MESSAGE_FIELDS)
        .eq("project_id", m["project_id"])
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
        .data
    )

    return list(reversed(rows))


@router.post("", status_code=201)
def send_message(
    body: MessageIn,
    m: dict = Depends(membership),
):
    content = body.content.strip()

    if not content:
        raise HTTPException(400, "Message cannot be empty")

    db = get_client()

    created = (
        db.table("project_messages")
        .insert({
            "project_id": m["project_id"],
            "sender_id": m["user"]["id"],
            "content": content,
        })
        .execute()
        .data[0]
    )

    return (
        db.table("project_messages")
        .select(MESSAGE_FIELDS)
        .eq("id", created["id"])
        .single()
        .execute()
        .data
    )