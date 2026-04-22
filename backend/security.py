import bcrypt

def generate_hash_password(password_text_plan: str) -> str:
    """Recebe a senha em texto e devolve o hash irreversível."""
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_text_plan.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(password_text_plan: str, password_hashed: str) -> bool:
    """Compara a senha digitada no login com o hash salvo no banco."""
    return bcrypt.checkpw(password_text_plan.encode('utf-8'), password_hashed.encode('utf-8'))
