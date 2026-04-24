from sqlalchemy import String, Integer, ForeignKey, Numeric
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

class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    prestador_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    def __repr__(self) -> str:
        return f"<Service(name='{self.name}', duration={self.duration}, price={self.price})>"