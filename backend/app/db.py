from functools import cache

from supabase import Client, create_client

from app.config import settings


# one client for the whole app, settings blows up on startup if the env vars are missing
@cache
def get_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)
