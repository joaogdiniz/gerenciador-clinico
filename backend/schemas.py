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

class UserLogin(BaseModel):
    email: str
    password: str

class ServiceCreate(BaseModel):
    provider_id: int
    name: str
    duration: int
    price: float
    availability: dict | None = None

class ServiceResponse(BaseModel):
    id: int
    provider_id: int
    name: str
    duration: int
    price: float
    availability: dict | None = None

    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    customer_id: int
    provider_id: int
    service_id: int
    date_time: str

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    status: str

    class Config:
        from_attributes = True

class ProviderAppointmentResponse(BaseModel):
    id: int
    date_time: str
    status: str
    service_name: str
    price: float
    customer_name: str

    class Config:
        from_attributes = True