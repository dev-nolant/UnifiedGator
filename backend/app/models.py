from pydantic import BaseModel


class Profile(BaseModel):
    id: str
    email: str
    display_name: str
