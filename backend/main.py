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
