# profiles.py
from db import get_client
from models import Profile
from auth import create_login

# register the profile, returns profile object
def register_new_profile(email: str, password: str, display_name: str) -> Profile:
    #user id
    user_id = create_login(email, password)
    get_client().table("profiles").insert({
        "id": user_id,
        "email": email,
        "display_name": display_name,
    }).execute()
    return Profile(id=user_id, email=email, display_name=display_name)

