# RODAR O CÓDIGO (por enquanto)

## Pro banco
- MySQL
- conexão do localhost mesmo

- CREATE DATABASE crud_login; //atualizar

## Pro backend
No arquivo app.py:
-  Atualizar a linha com seu usuário e senha (da conexão com o localhost do MySQL):
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:senha@localhost/crud_login'  //atualizar

Daí no VSCode abre o terminal, entra na pasta do back onde estão os arquivos e:
- python -m venv venv    
- .\venv\Scripts\activate     
-  pip install -r requirements.txt

Pra rodar o back:
- python app.py

Ai abre outro terminal pro front (melhor deixar um rodando o back e um rodando o front)
- npm create vite@latest (Selecione "React" -> Selecione "Javascript" -> crie a nova pasta e logo após pode excluir)
- npm install axios
-  npm install

## Pro frontend:
- cd frontend
- npm create vite@latest (Selecione "React" -> Selecione "Javascript" > crie a nova pasta e logo após pode excluir)
- npm install axios
- npm install react-router-dom
- npm install react-icons
- npm run dev



