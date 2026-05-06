import { useEffect, useState } from "react";
import api from "../../services/api";
import Notification from "../../components/Notification";
import "./style.css";

function CampoSugestaoFiltro({ label, value, onChange, options, placeholder }) {
  const [aberto, setAberto] = useState(false);

  const opcoesFiltradas = options
    .filter((opcao) =>
      opcao.toLowerCase().includes((value || "").toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b));

  const selecionarOpcao = (opcao) => {
    onChange(opcao);
    setAberto(false);
  };

  return (
    <div className="campo-sugestao-filtro">
      <label>{label}</label>

      <div className={`campo-sugestao-wrapper ${aberto ? "aberto" : ""}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => {
            setTimeout(() => setAberto(false), 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="campo-sugestao-input"
        />

        <button
          type="button"
          className="campo-sugestao-seta"
          onMouseDown={(e) => {
            e.preventDefault();
            setAberto(!aberto);
          }}
        >
          ▾
        </button>
      </div>

      {aberto && (
        <div className="sugestao-lista">
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((opcao) => (
              <button
                type="button"
                key={opcao}
                className="sugestao-item"
                onMouseDown={() => selecionarOpcao(opcao)}
              >
                {opcao}
              </button>
            ))
          ) : (
            <div className="sugestao-vazia">
              Nenhuma opção encontrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    razao_social: "",
    cnpj: "",
    telefone: "",
    email: ""
  });

  const [notification, setNotification] = useState({
    message: "",
    type: "success"
  });

  function mostrarNotificacao(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3500);
  }

  const [filtroOpen, setFiltroOpen] = useState(false);

  const [filtros, setFiltros] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: ""
  });

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    return (
      f.razao_social?.toLowerCase().includes(filtros.nome.toLowerCase()) &&
      (f.cnpj || "").includes(filtros.cnpj) &&
      (f.telefone || "").includes(filtros.telefone) &&
      (f.email || "").toLowerCase().includes(filtros.email.toLowerCase())
    );
  });

  const nomesFiltro = [
    ...new Set(fornecedores.map((f) => f.razao_social).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const cnpjsFiltro = [
    ...new Set(fornecedores.map((f) => f.cnpj).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const telefonesFiltro = [
    ...new Set(fornecedores.map((f) => f.telefone).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const emailsFiltro = [
    ...new Set(fornecedores.map((f) => f.email).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const carregarFornecedores = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/fornecedores", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFornecedores(response.data.fornecedores || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const salvarFornecedor = async () => {
    if (!formData.razao_social.trim()) {
      mostrarNotificacao("Informe a razão social do fornecedor.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        razao_social: formData.razao_social.trim(),
        cnpj: formData.cnpj.trim() || null,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null
      };

      await api.post("/fornecedores", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      carregarFornecedores();

      setModalOpen(false);

      setFormData({
        razao_social: "",
        cnpj: "",
        telefone: "",
        email: ""
      });

      mostrarNotificacao("Fornecedor cadastrado com sucesso.", "success");
    } catch (err) {
      console.error(err);

      mostrarNotificacao(
        err.response?.data?.erro ||
        err.response?.data?.detalhes ||
        "Erro ao cadastrar fornecedor.",
        "error"
      );
    }
  };

  const atualizarFornecedor = async () => {
    if (!formData.razao_social.trim()) {
      mostrarNotificacao("Informe a razão social do fornecedor.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        razao_social: formData.razao_social.trim(),
        cnpj: formData.cnpj.trim() || null,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null
      };

      await api.put(
        `/fornecedores/${editando.id_fornecedor}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      carregarFornecedores();

      setModalOpen(false);
      setEditando(null);

      mostrarNotificacao("Fornecedor atualizado com sucesso.", "success");
    } catch (err) {
      console.error(err);

      mostrarNotificacao(
        err.response?.data?.erro ||
        err.response?.data?.detalhes ||
        "Erro ao atualizar fornecedor.",
        "error"
      );
    }
  };

  return (
    <div className="fornecedores-page">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <div className={`filtros-avancados ${filtroOpen ? "aberto" : "fechado"}`}>

        <div className="filtros-header">
          <h2>Filtros Avançados</h2>
          <button className="close-btn" onClick={() => setFiltroOpen(false)}>×</button>
        </div>

        <div className="filtro-scroll-area">
          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Fornecedor"
              value={filtros.nome}
              onChange={(valor) => setFiltros({ ...filtros, nome: valor })}
              options={nomesFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="CNPJ"
              value={filtros.cnpj}
              onChange={(valor) => setFiltros({ ...filtros, cnpj: valor })}
              options={cnpjsFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Telefone"
              value={filtros.telefone}
              onChange={(valor) => setFiltros({ ...filtros, telefone: valor })}
              options={telefonesFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Email"
              value={filtros.email}
              onChange={(valor) => setFiltros({ ...filtros, email: valor })}
              options={emailsFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>
        </div>

        <div className="filtros-actions">

          <button
            className="btn-limpar"
            onClick={() =>
              setFiltros({ nome: "", cnpj: "", telefone: "", email: "" })
            }
          >
            Limpar Filtros
          </button>

          <button
            className="btn-aplicar"
            onClick={() => setFiltroOpen(false)}
          >
            Aplicar Filtros
          </button>

        </div>
      </div>

      <main className="fornecedores-main">

        {/* HEADER */}
        <div className="fornecedores-title-row">
          <div className="estoque-title">
            <h1>FORNECEDORES</h1>
            <small>
              <strong>{fornecedores.length}</strong> itens listados
            </small>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>

            <button
              className="filter-btn-toggle"
              onClick={() => setFiltroOpen(!filtroOpen)}
            >
              {filtroOpen ? "Ocultar Filtros" : "Filtrar"}
            </button>

            <button
              className="add-btn"
              onClick={() => {
                setEditando(null);
                setFormData({
                  razao_social: "",
                  cnpj: "",
                  telefone: "",
                  email: ""
                });
                setModalOpen(true);
              }}
            >
              + Adicionar novo
            </button>
          </div>
        </div>

        {/* TABELA */}
        <div className="fornecedores-table">
          <div className="thead">
            <div className="col">Nome</div>
            <div className="col">CNPJ</div>
            <div className="col">Telefone</div>
            <div className="col">Email</div>
            <div className="col action">Editar</div>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : fornecedores.length === 0 ? (
            <div className="empty">Nenhum fornecedor</div>
          ) : (
            fornecedoresFiltrados.map((f) => (
              <div className="row" key={f.id_fornecedor}>
                <div className="col">{f.razao_social}</div>
                <div className="col">{f.cnpj || "-"}</div>
                <div className="col">{f.telefone || "-"}</div>
                <div className="col">{f.email || "-"}</div>

                <div className="col action">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditando(f);
                      setFormData({
                        razao_social: f.razao_social || "",
                        cnpj: f.cnpj || "",
                        telefone: f.telefone || "",
                        email: f.email || ""
                      });
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL */}
      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box fornecedor-modal-box">

            <div className="modal-header-fornecedor">
              <div>
                <h2>{editando ? "Editar fornecedor" : "Novo fornecedor"}</h2>
                <p>
                  Cadastre os dados principais do fornecedor para vincular entradas de estoque.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-x"
                onClick={() => {
                  setModalOpen(false);
                  setEditando(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-section-title">Dados do fornecedor</div>

            <div className="form-grid fornecedor-form-grid">
              <div>
                <label>Razão Social</label>
                <input
                  name="razao_social"
                  value={formData.razao_social}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>CNPJ</label>
                <input
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Telefone</label>
                <input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-actions fornecedor-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setEditando(null);
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={() => {
                  if (editando) {
                    atualizarFornecedor();
                  } else {
                    salvarFornecedor();
                  }
                }}
              >
                {editando ? "Salvar alterações" : "Cadastrar fornecedor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fornecedores;
