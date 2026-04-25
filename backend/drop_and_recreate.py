import psycopg2
from database import engine
from models import Base

# Drop via psycopg2 to avoid SQLAlchemy caching/transaction issues
try:
    conn = psycopg2.connect("postgresql://admin:123@localhost:5432/gerenciador_clinico")
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS services CASCADE;")
    print("Tabela excluída com sucesso.")
    cur.close()
    conn.close()
except Exception as e:
    print("Erro ao excluir:", e)

# Recriar via SQLAlchemy
try:
    Base.metadata.create_all(bind=engine)
    print("Tabelas recriadas com sucesso.")
except Exception as e:
    print("Erro ao recriar:", e)
