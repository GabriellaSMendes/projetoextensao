# Como rodar o projeto - Tropical Mix 🌴
Como executar **banco de dados**, **backend** e **frontend** do sistema.

## 1) Preparando o banco de dados
**1.1 Requisitos:** MySQL

**1.2 Rodar o arquivo:** ```database/banco.sql```

(Pode copiar e colar no MySQL)

## 2) Executando o backend

### 2.1 Configurar conexão com o banco
- Edita o arquivo: ```backend/app/config.py```
- Atualiza a linha: ```SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://usuario:senha@localhost/tropicalmix_db'```

Substitui **usuario** e **senha** pelos seus do seu MySQL.


### 2.2 Ativar ambiente virtual *(somente a primera vez)**

No terminal, executa os comandos a seguir, um de cada vez

Entra na pasta do backend: ```cd backend``` 

```python -m venv venv```

```.\venv\Scripts\activate```

*Ou caso o ambiente não esteja ativado antes de rodar o código novamente

### 2.3 Instalar dependências *(somente a primeira vez)*
```pip install -r requirements.txt```

### Rodar o backend
```python run.py```

## 3) Executando o frontend
Deixa o backend rodando e abre outro terminal

Entra na pasta do frontend: ```cd frontend```

### 3.1 Crie a estrutura do Vite *(somente a primeira vez)*
``npm create vite@latest`` 

Vão aparecer opções para selecionar:
  
- Selecione ```React``` 
- Selecione ```Javascript``` 
  
Cria a nova pasta e logo após **pode excluir** essa pasta criada

### 3.2 Instalar dependências *(somente a primeira vez)*
```npm install axios```

```npm install react-router-dom```

```npm install react-icons```

### Rodar o frontend
```npm run dev```

Abre no navegador o link que aparecer *(http://localhost:5173/)*, o back e o front estarão rodando em conjunto.



