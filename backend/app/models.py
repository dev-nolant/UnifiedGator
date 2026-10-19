from sqlalchemy.orm import DeclarativeBase
from dataclasses import dataclass

class Base(DeclarativeBase):
    pass


# todo: user, project, member, task, message, activity
# class to hold profile information to create user. dataclass
@dataclass
class Profile:
    id: str
    email: str
    display_name: str

