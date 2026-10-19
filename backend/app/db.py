import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client

# railway/supabase hand us this
engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///./dev.db"))
Session = sessionmaker(engine)


def get_db():
    with Session() as db:
        yield db

# get the new client to create
def get_client() -> Client:
    # Ref: https://supabase.com/docs/reference/python/initializing
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    return supabase


