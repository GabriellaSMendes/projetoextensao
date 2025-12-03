import "./style.css";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";



function Login() {
  const navigate = useNavigate();

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  //funcao p o esqueci a senha
  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotMessage("Informe um e-mail válido.");
      return;
    }

    try {
      await api.post("/auth/redefinir", { email: forgotEmail });

      setForgotMessage("Se o e-mail existir, você receberá instruções.");
      setForgotEmail("");

    } catch (error) {
      console.error(error);
      // mesma mensagem por segurança
      setForgotMessage("Se o e-mail existir, você receberá instruções.");
      setForgotEmail("");
    }
  };


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

        <button
          type="button"
          className="forgot-password"
          onClick={() => setForgotOpen(true)}
        >
          Esqueci minha senha
        </button>
      </form>

      {/* modal de esqueci a senha */}
      {forgotOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Redefinir senha</h2>
            <p style={{ marginBottom: 12 }}>
              Informe seu e-mail para enviar o pedido de redefinição.
            </p>

            <input
              type="email"
              placeholder="Seu e-mail"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            {forgotMessage && (
              <p className="forgot-info">
                {forgotMessage}
              </p>
            )}


            <div className="modal-actions">
              <button
                className="cancel-btn" onClick={() => {
                  setForgotOpen(false);
                  setForgotMessage("");
                  setForgotEmail("");
                }}
              >
                Cancelar
              </button>
              <button className="save-btn" onClick={handleForgotPassword}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;
