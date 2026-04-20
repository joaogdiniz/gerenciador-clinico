from fastapi import FastAPI
from database import engine
import models

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
