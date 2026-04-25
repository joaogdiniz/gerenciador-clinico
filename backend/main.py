from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, get_db
from security import generate_hash_password, verify_password
from sqlalchemy.orm import Session
import models
import schemas
models.Base.metadata.create_all(bind=engine)

# Mapeamento de Factory: Relaciona a string do frontend com a classe do banco
USER_CLASSES = {
    "PRESTADOR": models.Provider,
    "CLIENTE": models.Customer
}

# Inicializa o servidor FastAPI
app = FastAPI(
    title="API - Gerenciador Clínico",
    description="Sistema de agendamentos para clínicas",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Permite o front-end acessar o back-end 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

# TESTE DO SERVIDOR
@app.get("/")
def read_root():
    return {"mensagem": "O servidor está rodando!"}

# ROTAS DE USUARIO

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Verifica se o e-mail já existe no banco
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    # Cria o objeto do SQLAlchemy
    secure_password = generate_hash_password(user.password)
    
    # Busca a classe correta no dicionário. Se a chave não existir, o fallback é models.User
    ModelClass = USER_CLASSES.get(user.user_type, models.User)

    # Instancia a classe de forma dinâmica
    new_user = ModelClass(
        name=user.name,
        email=user.email,
        password=secure_password
    )

    # Se caiu no fallback, injetamos a string manualmente, pois as subclasses já fazem isso via polymorphic_identity
    if ModelClass is models.User:
        new_user.user_type = user.user_type

    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Atualiza o objeto para pegar o ID gerado pelo banco

    return new_user

@app.post("/login/", response_model=schemas.UserResponse)
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Busca o usuário pelo email
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
    # Verifica a senha
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Senha incorreta.")
        
    return user

# ROTAS DE SERVIÇO

@app.post("/services/", response_model=schemas.ServiceResponse)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    # Verifica se o prestador existe e se é do tipo prestador
    provider = db.query(models.User).filter(models.User.id == service.provider_id, models.User.user_type == "PRESTADOR").first()
    if not provider:
        raise HTTPException(status_code=404, detail="Prestador não encontrado.")

    new_service = models.Service(
        provider_id=service.provider_id,
        name=service.name,
        duration=service.duration,
        price=service.price,
        availability=service.availability
    )
    
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service

@app.get("/services/provider/{provider_id}", response_model=list[schemas.ServiceResponse])
def get_provider_services(provider_id: int, db: Session = Depends(get_db)):
    services = db.query(models.Service).filter(models.Service.provider_id == provider_id).all()
    return services

@app.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    
    db.delete(service)
    db.commit()
    return {"detail": "Serviço deletado com sucesso."}

@app.post("/appointments/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    new_app = models.Appointment(
        customer_id=appointment.customer_id,
        provider_id=appointment.provider_id,
        service_id=appointment.service_id,
        date_time=appointment.date_time,
        status="confirmado"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@app.get("/services/search", response_model=list[schemas.ServiceResponse])
def search_services(name: str = None, min_price: float = None, max_price: float = None, db: Session = Depends(get_db)):
    query = db.query(models.Service)
    if name:
        query = query.filter(models.Service.name.ilike(f"%{name}%"))
    if min_price is not None:
        query = query.filter(models.Service.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Service.price <= max_price)
    
    services = query.all()
    valid_services = []

    for service in services:
        service_dict = {
            "id": service.id,
            "provider_id": service.provider_id,
            "name": service.name,
            "duration": service.duration,
            "price": service.price,
            "availability": {}
        }
        
        appointments = db.query(models.Appointment).filter(models.Appointment.service_id == service.id).all()
        booked_slots = [app.date_time for app in appointments]
        
        if service.availability:
            for date_str, slots in service.availability.items():
                available = [s for s in slots if f"{date_str} {s}" not in booked_slots]
                if available:
                    service_dict["availability"][date_str] = available
            
            if service_dict["availability"]:
                valid_services.append(service_dict)

    return valid_services

@app.get("/appointments/provider/{provider_id}", response_model=list[schemas.ProviderAppointmentResponse])
def get_provider_appointments(provider_id: int, db: Session = Depends(get_db)):
    results = db.query(
        models.Appointment.id,
        models.Appointment.date_time,
        models.Appointment.status,
        models.Service.name.label("service_name"),
        models.Service.price.label("price"),
        models.User.name.label("customer_name")
    ).join(
        models.Service, models.Appointment.service_id == models.Service.id
    ).join(
        models.User, models.Appointment.customer_id == models.User.id
    ).filter(
        models.Appointment.provider_id == provider_id
    ).all()

    appointments = []
    for r in results:
        appointments.append({
            "id": r.id,
            "date_time": r.date_time,
            "status": r.status,
            "service_name": r.service_name,
            "price": r.price,
            "customer_name": r.customer_name
        })
    return appointments

@app.get("/appointments/customer/{customer_id}", response_model=list[schemas.CustomerAppointmentResponse])
def get_customer_appointments(customer_id: int, db: Session = Depends(get_db)):
    results = db.query(
        models.Appointment.id,
        models.Appointment.date_time,
        models.Appointment.status,
        models.Service.name.label("service_name"),
        models.Service.price.label("price"),
        models.User.name.label("provider_name")
    ).join(
        models.Service, models.Appointment.service_id == models.Service.id
    ).join(
        models.User, models.Appointment.provider_id == models.User.id
    ).filter(
        models.Appointment.customer_id == customer_id
    ).all()

    appointments = []
    for r in results:
        appointments.append({
            "id": r.id,
            "date_time": r.date_time,
            "status": r.status,
            "service_name": r.service_name,
            "price": r.price,
            "provider_name": r.provider_name
        })
    return appointments

@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
    
    db.delete(appointment)
    db.commit()
    return {"detail": "Agendamento cancelado com sucesso."}
