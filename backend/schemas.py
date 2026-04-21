from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    user_type: str # "CLIENTE" ou "PRESTADOR"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    user_type: str

    class Config:
        from_attributes = True # Permite que o Pydantic leia dados do SQLAlchemy