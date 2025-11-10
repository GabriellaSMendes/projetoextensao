# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```

RODAR O CÓDIGO

➡ npm install
➡ npm run dev


Pro banco
- MySQL
- conexão do localhost mesmo
➡ CREATE DATABASE crud_login; 

No backend
- No arquivo app.py:
➡ Atualizar a linha com seu usuário e senha (da conexão com o localhost do MySQL):
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:senha@localhost/crud_login'  (no meu tá root:root@... pq é meu usuário e senha)

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
➡ use crud_login;
SELECT * from user;

```