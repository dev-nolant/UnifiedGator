from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.db import get_client
from app.deps import membership, owner

router = APIRouter(prefix="/projects/{project_id}/members", tags=["members"])


class MemberIn(BaseModel):
    email: EmailStr


@router.get("")
def list_members(m: dict = Depends(membership)):
    return (
        get_client().table("members")
        .select("role, joined_at, user:profiles(id, email, display_name)")
        .eq("project_id", m["project_id"])
        .execute().data
    )


@router.post("", status_code=201)
def add_member(body: MemberIn, m: dict = Depends(owner)):
    db = get_client()
    # shortcut: they need an account already, real invite emails later
    found = db.table("profiles").select("id, email, display_name").eq("email", body.email.lower()).execute().data
    if not found:
        raise HTTPException(404, "nobody's signed up with that email yet")
    person = found[0]

    already = db.table("members").select("user_id").eq("project_id", m["project_id"]).eq("user_id", person["id"]).execute().data
    if already:
        raise HTTPException(409, "they're already on the project")

    db.table("members").insert({"project_id": m["project_id"], "user_id": person["id"]}).execute()
    return {"role": "member", "user": person}


@router.delete("/{user_id}", status_code=204)
def remove_member(user_id: UUID, m: dict = Depends(membership)):
    leaving = str(user_id) == m["user"]["id"]
    if not leaving and m["role"] != "owner":
        raise HTTPException(403, "only the owner can remove people")
    if leaving and m["role"] == "owner":
        raise HTTPException(400, "owner can't leave, delete the project instead")

    gone = get_client().table("members").delete().eq("project_id", m["project_id"]).eq("user_id", str(user_id)).execute().data
    if not gone:
        raise HTTPException(404, "not on this project")
