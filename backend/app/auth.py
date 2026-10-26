from app.db import get_client


# todo: verify the supabase jwt and hand back the user
def current_user():
    raise NotImplementedError


# Ref: https://supabase.com/docs/reference/python/auth-admin-createuser
def create_login(email: str, password: str) -> str:
    created_user = get_client().auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
    })
    return created_user.user.id
