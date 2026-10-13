import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# railway/supabase hand us this
engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///./dev.db"))
Session = sessionmaker(engine)


def get_db():
    with Session() as db:
        yield db
