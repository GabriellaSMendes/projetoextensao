import "./style.css";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";


function Login() {
  const navigate = useNavigate();

  // agora inclui nome_usuario também
  const [formData, setFormData] = useState({
    nome_usuario: "",
    email: "",
    senha: ""
  });

  // Atualiza campos do form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // LOGIN
  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        senha: formData.senha,
      });

      const token = response.data.access_token;

      if (!token) {
        alert("Token não recebido. Verifique o backend.");
        return;
      }

      //Salvar token
       localStorage.setItem("token", token);

      //Decodificar token JWT
      const payload = JSON.parse(atob(token.split(".")[1]));

      // acessa campos enviados pelo backend
      localStorage.setItem("userName", payload.nome);
      localStorage.setItem("userLevel", payload.nivel);

      //Redirecionar
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.erro || "Verifique suas credenciais.");
    }
  };


  // CADASTRAR NOVO USUÁRIO
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // rota /auth/registrar NÃO exige token
      const response = await api.post("/auth/registrar", {
        nome_usuario: formData.nome_usuario,
        email: formData.email,
        senha: formData.senha,
        nivel_acesso: "admin",
      });

      alert(response.data.mensagem || "Usuário registrado com sucesso!");

      // limpa os campos
      setFormData({ nome_usuario: "", email: "", senha: "" });
    } catch (error) {
      console.error(error);
      alert(
        "Erro ao cadastrar usuário: " +
        (error.response?.data?.erro || "Erro desconhecido")
      );
    }
  };

  return (
    <div className="login-wrapper">

      {/* Logo acima do cartão */}
      <img src={logo} alt="Tropical Mix" className="login-logo" />

      <form onSubmit={handleRegister} className="login-card">
        <h1>Login</h1>

        {/* NOME DO USUÁRIO 
        <input
          placeholder="Nome do usuário"
          type="text"
          name="nome_usuario"
          value={formData.nome_usuario}
          onChange={handleChange}
        />
*/}
        {/* EMAIL */}
        <input
          placeholder="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* SENHA */}
        <input
          placeholder="Senha"
          type="password"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
        />

        {/* BOTÃO LOGIN */}
        <button
          className="button-login"
          type="button"
          onClick={handleLogin}
        >
          Entrar
        </button>

        {/* BOTÃO CADASTRAR 
        <button className="button-register" type="button" onClick={handleRegister}>
          Cadastrar usuário
        </button>
        */}
      </form>
    </div>
  );
}

export default Login;
