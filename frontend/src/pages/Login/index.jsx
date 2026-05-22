import "./style.css";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import Notification from "../../components/Notification";

function Login() {
  const navigate = useNavigate();

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  function mostrarNotificacao(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3500);
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.senha.trim()) {
      mostrarNotificacao("Informe e-mail e senha para entrar.", "warning");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        senha: formData.senha,
      });

      const token = response.data.access_token;

      if (!token) {
        mostrarNotificacao("Token não recebido. Verifique o backend.", "error");
        return;
      }

      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));

      localStorage.setItem("userName", payload.nome);
      localStorage.setItem("userLevel", payload.nivel);

      navigate("/home");
    } catch (error) {
      console.error(error);
      mostrarNotificacao(
        error.response?.data?.erro || "Verifique suas credenciais.",
        "error"
      );
    }
  };

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

      setForgotMessage("Se o e-mail existir, você receberá instruções.");
      setForgotEmail("");
    }
  };

  return (
    <div className="login-page">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <section className="login-brand-panel">
        <div className="brand-content">
          <img src={logo} alt="Tropical Mix" className="brand-logo" />

          <div>
            <span className="brand-tag">Sistema de Gestão</span>
            <h1>Tropical Mix</h1>
            <p>
              Controle vendas, estoque, clientes e fornecedores em uma única
              plataforma.
            </p>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="login-card-header">
            <h2>Entrar no sistema</h2>
            <p>Informe suas credenciais para acessar o painel.</p>
          </div>

          <div className="login-field">
            <label>E-mail</label>
            <input
              placeholder="seuemail@exemplo.com"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label>Senha</label>
            <input
              placeholder="Digite sua senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button className="button-login" type="submit">
            Entrar
          </button>

          <button
            type="button"
            className="forgot-password"
            onClick={() => {
              setForgotOpen(true);
              setForgotMessage("");
              setForgotEmail("");
            }}
          >
            Esqueci minha senha
          </button>
        </form>
      </section>

      {forgotOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal-box">
            <div className="login-modal-header">
              <div>
                <h2>Redefinir senha</h2>
                <p>Informe seu e-mail para solicitar a redefinição.</p>
              </div>

              <button
                type="button"
                className="login-modal-close"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotMessage("");
                  setForgotEmail("");
                }}
              >
                ×
              </button>
            </div>

            <div className="login-field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>

            {forgotMessage && <p className="forgot-info">{forgotMessage}</p>}

            <div className="login-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotMessage("");
                  setForgotEmail("");
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={handleForgotPassword}
              >
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