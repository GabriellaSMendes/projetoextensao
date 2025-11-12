# RODAR O CÓDIGO

➡ npm install
➡ npm run dev


## Pro banco
- MySQL
- conexão do localhost mesmo
➡ CREATE DATABASE crud_login; //atualizar

## No backend
- No arquivo app.py:
➡ Atualizar a linha com seu usuário e senha (da conexão com o localhost do MySQL):
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:senha@localhost/crud_login'  //atualizar

- Daí no VSCode abre o terminal, entra na pasta do back onde estão os arquivos e:
➡ python -m venv venv    
➡ .\venv\Scripts\activate     
➡ pip install -r requirements.txt

- Pra rodar o back:
➡ python app.py

Ai abre outro terminal pro front (melhor deixar um rodando o back e um rodando o front)
➡ npm create vite@latest (Selecione "React" -> Selecione "Javascript" -> crie a nova pasta e logo após pode excluir)
➡ npm install axios
➡ npm install

- Pra rodar o front:
➡ npm run dev


Depois se quiser testar se deu certo no banco:
➡ use crud_login; //atualizar
SELECT * from user;


# ESTRUTURA DAS PASTAS (P/ SABER)

## public
Ícones e estáticos

## src
### assets
Imagens, ícones, CSS globais

### components
Componentes reutilizáveis

### pages
Telas do sistema

### services
Comunicação com o backend (Axios)

### routes
Centraliza as rotas do app

``` App.jsx ```
Componente raiz

``` Main.jsx ```
Ponto de entrada ReactDOM

``` index.css ```
Estilos globais
