import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import "./style.css";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtroNomeCpf, setFiltroNomeCpf] = useState("");
  const [filtroTelefone, setFiltroTelefone] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");

  const [formData, setFormData] = useState({
    nome_cliente: "",
    cpf: "",
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
    try {
      const token = localStorage.getItem("token");

      await api.post("/clientes", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      carregarClientes();
      setModalOpen(false);
      limparForm();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar cliente");
    }
  };

  const atualizarCliente = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(`/clientes/${clienteEditando.id_cliente}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      carregarClientes();
      setModalOpen(false);
      setClienteEditando(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar cliente");
    }
  };

  const deletarCliente = async (id) => {
    if (!window.confirm("Deseja excluir este cliente?")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      carregarClientes();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir cliente");
    }
  };

  const limparForm = () => {
    setFormData({
      nome_cliente: "",
      cpf: "",
      telefone: "",
      email: "",
      endereco: ""
    });
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {

      const nomeCpf = filtroNomeCpf.toLowerCase();
      const telefone = filtroTelefone.toLowerCase();
      const email = filtroEmail.toLowerCase();

      const filtroNomeCpfOk =
        !nomeCpf ||
        c.nome_cliente?.toLowerCase().includes(nomeCpf) ||
        c.cpf?.toLowerCase().includes(nomeCpf);

      const filtroTelefoneOk =
        !telefone ||
        c.telefone?.toLowerCase().includes(telefone);

      const filtroEmailOk =
        !email ||
        c.email?.toLowerCase().includes(email);

      return (
        filtroNomeCpfOk &&
        filtroTelefoneOk &&
        filtroEmailOk
      );
    });
  }, [clientes, filtroNomeCpf, filtroTelefone, filtroEmail]);

  return (
    <div className="clientes-container">



      <aside className={`filtros-avancados ${filtrosAbertos ? "aberto" : "fechado"}`}>
        <div className="filtros-header">
          <h2>Filtros Avançados</h2>
          <button className="close-btn" onClick={() => setFiltrosAbertos(false)}>×</button>
        </div>

        <div className="filtro-scroll-area">
          <div className="filtro-secao">
            <label>Nome ou CPF</label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Digite nome ou CPF..."
              value={filtroNomeCpf}
              onChange={(e) => setFiltroNomeCpf(e.target.value)}
            />
          </div>

          <div className="filtro-secao">
            <label>Telefone</label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Digite o telefone..."
              value={filtroTelefone}
              onChange={(e) => setFiltroTelefone(e.target.value)}
            />
          </div>

          <div className="filtro-secao">
            <label>Email</label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Digite o email..."
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
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
            <div>Nome</div>
            <div>CPF</div>
            <div>Telefone</div>
            <div>Email</div>
            <div>Endereço</div>
            <div>Ações</div>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : clientes.length === 0 ? (
            <div className="empty">Nenhum cliente cadastrado</div>
          ) : (
            clientesFiltrados.map((c) => (
              <div className="row" key={c.id_cliente}>
                <div>{c.nome_cliente}</div>
                <div>{c.cpf}</div>
                <div>{c.telefone}</div>
                <div>{c.email}</div>
                <div>{c.endereco}</div>

                <div className="actions">
                  <button
                    onClick={() => {
                      setClienteEditando(c);
                      setFormData(c);
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>

                  <button onClick={() => deletarCliente(c.id_cliente)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>



      </main>


      {modalOpen && (
        <div className="modal">
          <div className="modal-box">
            <h2>{clienteEditando ? "Editar Cliente" : "Novo Cliente"}</h2>

            <input name="nome_cliente" placeholder="Nome" value={formData.nome_cliente} onChange={handleChange} />
            <input name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} />
            <input name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleChange} />
            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input name="endereco" placeholder="Endereço" value={formData.endereco} onChange={handleChange} />

            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)}>Cancelar</button>

              <button onClick={() => {
                if (clienteEditando) {
                  atualizarCliente();
                } else {
                  salvarCliente();
                }
              }}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;