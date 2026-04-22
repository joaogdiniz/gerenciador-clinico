# Gerenciador de Agendamentos Clínicos

Aplicação web completa desenvolvida com React, TypeScript e TailwindCSS, projetada para gerenciar agendamentos clínicos de forma eficiente. O sistema também é responsivo, oferecendo uma experiência fluida em dispositivos móveis.

## Funcionalidades

- Interface Moderna: Design intuitivo e responsivo.
- Gerenciamento de Usuários: Cadastro e autenticação de administradores e pacientes.
- Gestão de Consultas:
  - Agendamento de consultas.
  - Visualização de agenda.
  - Confirmação, reagendamento e cancelamento de consultas.

---

##  Tecnologias Utilizadas

### Frontend
- React: Biblioteca JavaScript para construção da interface.
- TypeScript: Superset tipado do JavaScript que aumenta a robustez do código.
- TailwindCSS: Framework CSS para estilização rápida e consistente.
- Vite: Build tool e servidor de desenvolvimento de alta performance.
- Lucide-React: Biblioteca de ícones.

### Backend
- FastAPI: Framework Python para criação de APIs.
- SQLAlchemy: ORM para interação com o banco de dados.
- Alembic: Ferramenta para migrações de banco de dados.

---

## Instalação e Execução

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Backend

Certifique-se de ter o Python 3.10+ instalado.

1. Navegue até o diretório do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. (Opcional) Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   # source venv/bin/activate
   ```

4. Inicialize o banco de dados e execute o servidor:
   ```bash
   alembic upgrade head
   uvicorn main:app --reload
   ```
   
   O servidor estará disponível em `http://localhost:8000`.

---

### 2. Frontend

Certifique-se de ter o Node.js 20+ instalado.

1. Navegue até o diretório do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   
   O projeto estará disponível em `http://localhost:5173`.

---
