from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLALCHEMY_DATABASE_URL = "postgresql://admin:123@localhost:5432/gerenciador_clinico"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Abre uma conversa única com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Função utilitária para obter a sessão do banco (Dependency Injection no FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()