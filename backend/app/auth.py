from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase_auth.errors import AuthError

from app.db import get_client

bearer = HTTPBearer()


# Ref: https://supabase.com/docs/reference/python/auth-getclaims
def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        res = get_client().auth.get_claims(creds.credentials)
    except AuthError:
        raise HTTPException(401, "invalid token")

    if not res or not res["claims"].get("sub"):
        raise HTTPException(401, "invalid token")
    return {"id": res["claims"]["sub"], "email": res["claims"].get("email")}
