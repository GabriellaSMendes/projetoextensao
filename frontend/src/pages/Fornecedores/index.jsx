import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

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
    try {
      const token = localStorage.getItem("token");

      await api.post("/fornecedores", formData, {
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
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar fornecedor");
    }
  };

  const atualizarFornecedor = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/fornecedores/${editando.id_fornecedor}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      carregarFornecedores();
      setModalOpen(false);
      setEditando(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar fornecedor");
    }
  };

  return (
    <div className="fornecedores-page">

      <div className={`filtros-avancados ${filtroOpen ? "aberto" : "fechado"}`}>

        <div className="filtros-header">
          <h2>Filtros Avançados</h2>
          <button className="close-btn" onClick={() => setFiltroOpen(false)}>×</button>
        </div>

        <div className="filtro-secao">
          <label>Pesquisar</label>
          <input
            className="filtro-input"
            placeholder="Nome ..."
            value={filtros.nome}
            onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
          />
        </div>

        <div className="filtro-scroll-area">

          <div className="filtro-secao">
            <label>CNPJ</label>
            <input
              className="filtro-input"
              value={filtros.cnpj}
              onChange={(e) => setFiltros({ ...filtros, cnpj: e.target.value })}
            />
          </div>

          <div className="filtro-secao">
            <label>Telefone</label>
            <input
              className="filtro-input"
              value={filtros.telefone}
              onChange={(e) => setFiltros({ ...filtros, telefone: e.target.value })}
            />
          </div>

          <div className="filtro-secao">
            <label>Email</label>
            <input
              className="filtro-input"
              value={filtros.email}
              onChange={(e) => setFiltros({ ...filtros, email: e.target.value })}
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
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{editando ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>

            <div className="form-grid">
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

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setEditando(null);
                }}
              >
                Cancelar
              </button>

              <button
                className="save-btn"
                onClick={() => {
                  if (editando) {
                    atualizarFornecedor();
                  } else {
                    salvarFornecedor();
                  }
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fornecedores;
