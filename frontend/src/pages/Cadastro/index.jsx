import "./style.css";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function Cadastro() {
  const navigate = useNavigate();

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome_usuario: "",
    email: "",
    senha: "",
    nivel_acesso: "vendedor", // padrão
  });

  // Atualiza os campos
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submeter cadastro
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/auth/registrar",
        {
          nome_usuario: formData.nome_usuario,
          email: formData.email,
          senha: formData.senha,
          nivel_acesso: formData.nivel_acesso,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(response.data.mensagem || "Usuário cadastrado!");

      navigate("/home");

    } catch (error) {
      console.error(error);
      alert(
        "Erro ao cadastrar usuário: " +
        (error.response?.data?.erro || "Erro desconhecido")
      );
    }
  };

  return (
    <div className="cadastro-wrapper">

      <form className="cadastro-card" onSubmit={handleRegister}>
        <h1>Cadastrar Usuário</h1>

        {/* Nome */}
        <input
          type="text"
          placeholder="Nome do usuário"
          name="nome_usuario"
          value={formData.nome_usuario}
          onChange={handleChange}
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="E-mail"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Senha */}
        <input
          type="password"
          placeholder="Senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          required
        />

        {/* Checkbox admin */}
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={formData.nivel_acesso === "admin"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nivel_acesso: e.target.checked ? "admin" : "vendedor"
                })
              }
            />
            Cadastrar como admin
          </label>
        </div>

        <button type="submit" className="cadastro-btn">
          Cadastrar
        </button>
      </form>
    </div>
  );
}

export default Cadastro;
