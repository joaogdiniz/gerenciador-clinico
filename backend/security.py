from passlib.context import CryptContext

# Configura o Passlib para usar o algoritmo bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_hash_password(password_text_plan: str) -> str:
    """Recebe a senha em texto e devolve o hash irreversível."""
    return pwd_context.hash(password_text_plan)

def verify_password(password_text_plan: str, password_hashed: str) -> bool:
    """Compara a senha digitada no login com o hash salvo no banco."""
    return pwd_context.verify(password_text_plan, password_hashed)
