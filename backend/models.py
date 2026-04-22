from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    # Definindo as colunas da tabela
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    user_type: Mapped[str] = mapped_column(String(20), nullable=False)

    __mapper_args__ = {
        "polymorphic_on": "user_type",
        "polymorphic_identity": "USUARIO"
    }

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(name='{self.name}', type='{self.user_type}')>"

class Provider(User):
    """Usuário Prestador: Cadastra serviços, horários, vê agenda e histórico."""
    __mapper_args__ = {
        "polymorphic_identity": "PRESTADOR",
    }

class Customer(User):
    """Usuário Cliente: Busca serviços, marca consultas e vê histórico."""
    __mapper_args__ = {
        "polymorphic_identity": "CLIENTE",
    }