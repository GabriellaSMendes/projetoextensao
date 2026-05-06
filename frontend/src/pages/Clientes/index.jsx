import { useEffect, useState, useMemo } from "react";
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

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtroNomeCpf, setFiltroNomeCpf] = useState("");
  const [filtroTelefone, setFiltroTelefone] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroEndereco, setFiltroEndereco] = useState("");

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

  const [formData, setFormData] = useState({
    razao_social: "",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    endereco: ""
  });

  const carregarClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/clientes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data.clientes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const salvarCliente = async () => {
    if (!formData.razao_social.trim()) {
      mostrarNotificacao("Informe a razão social do cliente.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        razao_social: formData.razao_social.trim(),
        cpf_cnpj: formData.cpf_cnpj.trim() || null,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null,
        endereco: formData.endereco.trim() || null
      };

      await api.post("/clientes", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      carregarClientes();

      setModalOpen(false);
      limparForm();

      mostrarNotificacao("Cliente cadastrado com sucesso.", "success");
    } catch (error) {
      console.error(error);

      mostrarNotificacao(
        error.response?.data?.erro ||
        error.response?.data?.detalhes ||
        "Erro ao salvar cliente.",
        "error"
      );
    }
  };

  const atualizarCliente = async () => {
    if (!formData.razao_social.trim()) {
      mostrarNotificacao("Informe a razão social do cliente.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        razao_social: formData.razao_social.trim(),
        cpf_cnpj: formData.cpf_cnpj.trim() || null,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null,
        endereco: formData.endereco.trim() || null
      };

      await api.put(`/clientes/${clienteEditando.id_cliente}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      carregarClientes();

      setModalOpen(false);
      setClienteEditando(null);
      limparForm();

      mostrarNotificacao("Cliente atualizado com sucesso.", "success");
    } catch (error) {
      console.error(error);

      mostrarNotificacao(
        error.response?.data?.erro ||
        error.response?.data?.detalhes ||
        "Erro ao atualizar cliente.",
        "error"
      );
    }
  };

  const limparForm = () => {
    setFormData({
      razao_social: "",
      cpf_cnpj: "",
      telefone: "",
      email: "",
      endereco: ""
    });
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {

      const nomeCpf = filtroNomeCpf.toLowerCase().trim();
      const telefone = filtroTelefone.toLowerCase().trim();
      const email = filtroEmail.toLowerCase().trim();
      const endereco = filtroEndereco.toLowerCase().trim();

      const filtroNomeCpfOk =
        !nomeCpf ||
        c.razao_social?.toLowerCase().includes(nomeCpf) ||
        c.cpf_cnpj?.toLowerCase().includes(nomeCpf);

      const filtroTelefoneOk =
        !telefone ||
        c.telefone?.toLowerCase().includes(telefone);

      const filtroEmailOk =
        !email ||
        c.email?.toLowerCase().includes(email);

      const filtroEnderecoOk =
        !endereco ||
        c.endereco?.toLowerCase().includes(endereco);

      return (
        filtroNomeCpfOk &&
        filtroTelefoneOk &&
        filtroEmailOk &&
        filtroEnderecoOk
      );
    });
  }, [clientes, filtroNomeCpf, filtroTelefone, filtroEmail, filtroEndereco]);

  const telefonesFiltro = [
    ...new Set(clientes.map((c) => c.telefone).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const emailsFiltro = [
    ...new Set(clientes.map((c) => c.email).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const enderecosFiltro = [
    ...new Set(clientes.map((c) => c.endereco).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const clientesFiltro = [
    ...new Set(clientes.map((c) => c.razao_social).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  return (
    <div className="clientes-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />



      <aside className={`filtros-avancados ${filtrosAbertos ? "aberto" : "fechado"}`}>
        <div className="filtros-header">
          <h2>Filtros Avançados</h2>
          <button className="close-btn" onClick={() => setFiltrosAbertos(false)}>×</button>
        </div>

        <div className="filtro-scroll-area">
          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Cliente ou CPF/CNPJ"
              value={filtroNomeCpf}
              onChange={setFiltroNomeCpf}
              options={clientesFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Endereço"
              value={filtroEndereco}
              onChange={setFiltroEndereco}
              options={enderecosFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Telefone"
              value={filtroTelefone}
              onChange={setFiltroTelefone}
              options={telefonesFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Email"
              value={filtroEmail}
              onChange={setFiltroEmail}
              options={emailsFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>
        </div>

        <div className="filtros-actions">
          <button
            className="btn-limpar"
            onClick={() => {
              setFiltroNomeCpf("");
              setFiltroTelefone("");
              setFiltroEmail("");
              setFiltroEndereco("");
            }}
          >
            Limpar Filtros
          </button>

          <button
            className="btn-aplicar"
            onClick={() => setFiltrosAbertos(false)}
          >
            Aplicar Filtros
          </button>
        </div>
      </aside>





      <main className="clientes-main">



        <div className="clientes-header">

          <div className="clientes-title">
            <h1>CLIENTES</h1>
            <small>
              <strong>{clientesFiltrados.length}</strong> clientes encontrados
            </small>
          </div>

          <div className="clientes-actions">
            <button
              className={`filter-btn-toggle ${filtrosAbertos ? "ativo" : ""}`}
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              {filtrosAbertos ? "Ocultar Filtros" : "Filtrar"}
            </button>

            <button
              className="add-btn"
              onClick={() => {
                setClienteEditando(null);
                limparForm();
                setModalOpen(true);
              }}
            >
              + Adicionar novo
            </button>
          </div>

        </div>




        <div className="clientes-table">
          <div className="thead">
            <div className="col">Cliente</div>
            <div className="col">CPF/CNPJ</div>
            <div className="col">Telefone</div>
            <div className="col">Email</div>
            <div className="col">Endereço</div>
            <div className="col">Última compra</div>
            <div className="col action">Ações</div>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : clientes.length === 0 ? (
            <div className="empty">Nenhum cliente cadastrado</div>
          ) : (
            clientesFiltrados.map((c) => (
              <div className="row" key={c.id_cliente}>
                <div className="col cliente-col">
                  <strong>{c.razao_social || "-"}</strong>
                  <span>Cadastrado em {c.dt_cadastro ? new Date(c.dt_cadastro).toLocaleDateString("pt-BR") : "-"}</span>
                </div>

                <div className="col">{c.cpf_cnpj || "-"}</div>
                <div className="col">{c.telefone || "-"}</div>
                <div className="col">{c.email || "-"}</div>
                <div className="col">{c.endereco || "-"}</div>

                <div className="col">
                  {c.ultima_compra_texto || "Sem compras"}
                </div>

                <div className="col action">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setClienteEditando(c);
                      setFormData({
                        razao_social: c.razao_social || "",
                        cpf_cnpj: c.cpf_cnpj || "",
                        telefone: c.telefone || "",
                        email: c.email || "",
                        endereco: c.endereco || ""
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


      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box cliente-modal-box">
            <div className="modal-header-cliente">
              <div>
                <h2>{clienteEditando ? "Editar cliente" : "Novo cliente"}</h2>
                <p>
                  Cadastre os dados principais do cliente para registrar vendas e acompanhar o histórico de compras.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-x"
                onClick={() => {
                  setModalOpen(false);
                  setClienteEditando(null);
                  limparForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-section-title">Dados do cliente</div>

            <div className="form-grid cliente-form-grid">
              <div>
                <label>Razão Social</label>
                <input
                  name="razao_social"
                  value={formData.razao_social}
                  onChange={handleChange}
                  placeholder="Ex: João Sorveteiro"
                />
              </div>

              <div>
                <label>CPF/CNPJ</label>
                <input
                  name="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label>Telefone</label>
                <input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="cliente-campo-endereco">
                <label>Endereço</label>
                <input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="modal-actions cliente-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setClienteEditando(null);
                  limparForm();
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={() => {
                  if (clienteEditando) {
                    atualizarCliente();
                  } else {
                    salvarCliente();
                  }
                }}
              >
                {clienteEditando ? "Salvar alterações" : "Cadastrar cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;