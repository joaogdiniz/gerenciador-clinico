from fastapi import FastAPI, Depends, HTTPException
from database import engine, get_db
from security import generate_hash_password
from sqlalchemy.orm import Session
import models
import schemas
models.Base.metadata.create_all(bind=engine)

# Inicializa o servidor FastAPI
app = FastAPI(
    title="API - Gerenciador Clínico",
    description="Sistema de agendamentos para clínicas",
    version="0.1.0"
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
    
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=secure_password, 
        user_type=user.user_type
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Atualiza o objeto para pegar o ID gerado pelo banco

    return new_user
