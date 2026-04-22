# Como rodar o projeto - Tropical Mix 🌴
Como executar **banco de dados**, **backend** e **frontend** do sistema.

## 1) Preparando o banco de dados
### 1.1 Requisitos:
MySQL Workbench

### 1.2 Rodar o arquivo:

```database/banco.sql``` -> Pode copiar e colar no MySQL

## 2) PARA TESTES | Criar um usuário no banco para conseguir fazer login no sistema (Importante!)

### 2.1 Colar esse comando no MySQL para criar o usuário já com a senha armazenada em hash
```
INSERT INTO usuario (nome_usuario, email, senha, nivel_acesso)
VALUES (
    'Admin',
    'admin@tropicalmix.com',
    '$2b$12J3CZY0UsCrpDI8w/pYzW0zHcvKV46JC8QpunjJAvkoG.qLTR3lja',
    'admin'
);
```

## 2.2 Fazer login usando as credenciais
- Login: admin@tropicalmix.com

- Senha: 1234

Sem essa etapa você fica preso na tela de login sem conseguir criar um usuário

## 3) Executando o backend

### 3.1 Configurar conexão com o banco
- Edita o arquivo: ```backend/app/config.py```
- Atualiza a linha: ```SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://usuario:senha@localhost/tropicalmix_db_2'```

Substitui **usuario** e **senha** pelos seus do seu MySQL.


### 3.2 Ativar ambiente virtual *(somente a primera vez)**

No terminal, executa os comandos a seguir, um de cada vez

Entra na pasta do backend: ```cd backend``` 

```python -m venv venv```

```.\venv\Scripts\activate```

*Ou caso o ambiente não esteja ativado antes de rodar o código novamente

### 3.3 Instalar dependências *(somente a primeira vez)*
```pip install -r requirements.txt```

### Rodar o backend
```python run.py```

## 4) Executando o frontend
Deixa o backend rodando e abre outro terminal

Entra na pasta do frontend: ```cd frontend```

### 4.1 Crie a estrutura do Vite *(somente a primeira vez)*
``npm create vite@latest frontend`` 

Vão aparecer opções para selecionar:
  
- Selecione ```React``` 
- Selecione ```Javascript``` 
  
Caso essa etapa crie uma nova pasta, **pode excluí-la**.

### 4.2 Instalar dependências *(somente a primeira vez)*
```npm install axios```

```npm install react-router-dom```

```npm install react-icons```

### Rodar o frontend
```npm run dev```



## Por fim...
Após tudo isso, sempre que quiser rodar tudo junto é só dar: 

```python run.py``` -> em um terminal (se o ambiente virtual estiver ativo, vale lembrar)

```npm run dev``` -> em outro terminal

**Abre no navegador o link que aparecer *(http://localhost:5173/)*, o back e o front estarão rodando em conjunto.**




