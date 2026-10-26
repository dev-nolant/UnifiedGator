from app.auth import create_login
from app.db import get_client
from app.models import Profile


def register_new_profile(email: str, password: str, display_name: str) -> Profile:
    user_id = create_login(email, password)
    get_client().table("profiles").insert({
        "id": user_id,
        "email": email,
        "display_name": display_name,
    }).execute()
    return Profile(id=user_id, email=email, display_name=display_name)
