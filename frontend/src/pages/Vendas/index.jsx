import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import Notification from "../../components/Notification";
import "./style.css";

// traduz enum do banco
function traduzMetodo(mtd) {
  switch (mtd) {
    case "dinheiro":
      return "Dinheiro";
    case "cartao_debito":
      return "Cartão de débito";
    case "cartao_credito":
      return "Cartão de crédito";
    case "pix":
      return "PIX";
    case "boleto":
      return "Boleto";
    default:
      return mtd || "-";
  }
}

const opcoesPagamento = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "boleto", label: "Boleto" },
];

function normalizarData(d) {
  if (!d) return null;
  // se já é Date
  if (d instanceof Date) return d;
  // se é objeto estranho vindo do backend
  if (typeof d === "object" && d !== null) {
    try {
      return new Date(d);
    } catch {
      return null;
    }
  }
  // agora tratamos strings
  if (typeof d === "string") {
    // formato DD/MM/YYYY
    if (d.includes("/")) {
      const [dia, mes, ano] = d.split("/");
      return new Date(`${ano}-${mes}-${dia}T00:00:00`);
    }
    // formato ISO ou similar
    return new Date(d);
  }
  return null;
}

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

function Vendas() {
  // --------------------- ESTADOS ---------------------
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState([]);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroItens, setFiltroItens] = useState("");
  const [filtroValorMin, setFiltroValorMin] = useState("");
  const [filtroValorMax, setFiltroValorMax] = useState("");

  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [cliente, setCliente] = useState("");
  const [novoCliente, setNovoCliente] = useState("");

  const [itemProduto, setItemProduto] = useState("");
  const [itemQtd, setItemQtd] = useState(1);
  const [carrinho, setCarrinho] = useState([]);

  const [pagamento, setPagamento] = useState("pix");

  // lista de vendedores (por usuario)
  const [vendedor, setVendedor] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const nomeUsuario = localStorage.getItem("userName") || "Usuário";

  //detalhes dos pedidos
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  // formulário de novo cliente
  const [showNovoClienteForm, setShowNovoClienteForm] = useState(false);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCpf, setClienteCpf] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");

  //select de produtos pro modal de vendas
  const [selectNome, setSelectNome] = useState("");
  const [selectSabor, setSelectSabor] = useState("");
  const [selectMarca, setSelectMarca] = useState("");


  const [formVenda, setFormVenda] = useState({
    id_cliente: "",
    mtd_pagamento: "",
    itens: []
  });

  function mostrarNotificacao(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3500);
  }

  const toggleFiltro = (lista, item, setLista) => {
    setLista(lista.includes(item)
      ? lista.filter(i => i !== item)
      : [...lista, item]
    );
  };

  const filtrados = useMemo(() => {
    return vendas.filter((v) => {
      const termoBusca = busca.toLowerCase().trim();

      const clienteVenda = (v.cliente || "").toLowerCase();
      const vendedorVenda = (v.vendedor || "").toLowerCase();
      const itemVenda = (v.itemPrincipal || "").toLowerCase();

      const atendeBusca =
        !termoBusca ||
        clienteVenda.includes(termoBusca) ||
        vendedorVenda.includes(termoBusca) ||
        itemVenda.includes(termoBusca);

      const atendePagamento =
        filtroPagamento.length === 0 ||
        filtroPagamento.includes((v.mtd_pagamento || "").toLowerCase());

      const dataVenda = normalizarData(v.dt_pedido);

      const dataInicio = filtroDataInicio
        ? new Date(`${filtroDataInicio}T00:00:00`)
        : null;

      const dataFim = filtroDataFim
        ? new Date(`${filtroDataFim}T23:59:59`)
        : null;

      const atendeDataInicio =
        !dataInicio || (dataVenda && dataVenda >= dataInicio);

      const atendeDataFim =
        !dataFim || (dataVenda && dataVenda <= dataFim);

      const atendeCliente =
        !filtroCliente ||
        clienteVenda.includes(filtroCliente.toLowerCase());

      const atendeVendedor =
        !filtroVendedor ||
        vendedorVenda.includes(filtroVendedor.toLowerCase());

      const atendeItens =
        !filtroItens ||
        itemVenda.includes(filtroItens.toLowerCase());

      const valorVenda = Number(v.total) || 0;
      const valorMin = filtroValorMin ? Number(filtroValorMin) : null;
      const valorMax = filtroValorMax ? Number(filtroValorMax) : null;

      const atendeValorMin =
        valorMin === null || valorVenda >= valorMin;

      const atendeValorMax =
        valorMax === null || valorVenda <= valorMax;

      return (
        atendeBusca &&
        atendePagamento &&
        atendeDataInicio &&
        atendeDataFim &&
        atendeCliente &&
        atendeVendedor &&
        atendeItens &&
        atendeValorMin &&
        atendeValorMax
      );
    });
  }, [
    vendas,
    busca,
    filtroPagamento,
    filtroDataInicio,
    filtroDataFim,
    filtroCliente,
    filtroVendedor,
    filtroItens,
    filtroValorMin,
    filtroValorMax
  ]);

  const clientesFiltro = [
    ...new Set(vendas.map((v) => v.cliente).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const vendedoresFiltro = [
    ...new Set(vendas.map((v) => v.vendedor).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  const itensFiltro = [
    ...new Set(vendas.map((v) => v.itemPrincipal).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b));

  //lista derivadas pros produtos  
  const nomesUnicos = [...new Set(produtos.map(p => p.nome_produto))];

  const saboresFiltrados = produtos
    .filter(p => p.nome_produto === selectNome)
    .map(p => p.sabor)
    .filter((s, i, arr) => arr.indexOf(s) === i);

  const marcasFiltradas = produtos
    .filter(p => p.nome_produto === selectNome && p.sabor === selectSabor)
    .map(p => p.marca)
    .filter((m, i, arr) => arr.indexOf(m) === i);

  //produto final selecionado automaticamente
  const produtoFinal = produtos
    .filter(p =>
      p.nome_produto === selectNome &&
      p.sabor === selectSabor &&
      p.marca === selectMarca
    )
    .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento))[0];

  // ------------------ CARREGAR DADOS ------------------
  const carregarClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get("/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(resp.data.clientes);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get("/estoque/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos(resp.data.produtos);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  const carregarVendas = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const respLista = await api.get("/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const lista = respLista.data?.pedidos || [];

      const detalhes = await Promise.all(
        lista.map((pedido) =>
          api
            .get(`/pedidos/${pedido.id_pedido}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => null)
        )
      );

      const pedidosFormatados = lista.map((pedido, index) => {
        const detalhe = detalhes[index]?.data;
        const itens = detalhe?.itens || [];

        const total = itens.reduce((acc, item) => {
          return acc + Number(item.subtotal || 0);
        }, 0);

        const itemPrincipal = itens[0]?.nome_produto || "";

        const itensResumo =
          itens.length === 0
            ? "—"
            : itens.length === 1
              ? itemPrincipal
              : `${itemPrincipal} + ${itens.length - 1} item(s)`;

        return {
          id_pedido: pedido.id_pedido,
          dt_pedido: pedido.dt_pedido,
          dataFormatada: pedido.dt_pedido
            ? new Date(pedido.dt_pedido).toLocaleDateString("pt-BR")
            : "-",
          cliente: pedido.cliente || "—",
          vendedor: pedido.vendedor || "—",
          mtd_pagamento: pedido.mtd_pagamento,
          mtd_pagamento_label: traduzMetodo(pedido.mtd_pagamento),
          itensResumo,
          itemPrincipal,
          total,
        };
      });

      setVendas(pedidosFormatados);
    } catch (err) {
      console.error(err);
      mostrarNotificacao("Erro ao carregar vendas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  // preenchendo automaticamente o vendedor com o usuário logado
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) {
      const usuario = JSON.parse(u);

      setVendedor(usuario.id_usuario);
    }
  }, []);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        // quando o backend criar a rota: /usuarios
        // const token = localStorage.getItem("token");
        // const resp = await api.get("/usuarios", {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setUsuarios(resp.data);
        // por enquanto vazio
        setUsuarios([]);
      } catch (err) {
        console.error("Erro ao carregar vendedores", err);
      }
    }
    carregarUsuarios();
  }, []);

  // ------------------ FILTRO ------------------

  const formatR$ = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // ------------------ CARRINHO ------------------
  const adicionarItem = () => {
    if (!produtoFinal) {
      mostrarNotificacao("Selecione nome, sabor e marca.", "warning");
      return;
    }

    if (itemQtd > produtoFinal.qtdd_atual) {
      mostrarNotificacao("Quantidade maior do que o estoque disponível.", "warning");
      return;
    }

    setCarrinho((prev) => [
      ...prev,
      {
        id_produto: produtoFinal.id_produto,
        nome: `${produtoFinal.nome_produto} (${produtoFinal.sabor})`,
        quantidade: itemQtd,
        preco: Number(produtoFinal.preco_unitario)
      }
    ]);

    // limpar selects
    setSelectNome("");
    setSelectSabor("");
    setSelectMarca("");
    setItemQtd(1);
  };

  const removerItem = (id) => {
    setCarrinho((prev) => prev.filter((c) => c.id_produto !== id));
  };

  const editarItemCarrinho = (item) => {
    const produtoSelecionado = produtos.find(
      (p) => p.id_produto === item.id_produto
    );

    if (!produtoSelecionado) {
      mostrarNotificacao("Produto não encontrado para edição.", "error");
      return;
    }

    setSelectNome(produtoSelecionado.nome_produto);
    setSelectSabor(produtoSelecionado.sabor || "");
    setSelectMarca(produtoSelecionado.marca || "");
    setItemQtd(item.quantidade);

    setCarrinho((prev) =>
      prev.filter((c) => c.id_produto !== item.id_produto)
    );

    mostrarNotificacao("Item carregado para edição.", "info");
  };

  const totalCarrinho = carrinho.reduce(
    (acc, i) => acc + i.preco * i.quantidade,
    0
  );

  // ------------------ SALVAR VENDA ------------------
  const salvarVenda = async () => {
    if (!cliente) {
      mostrarNotificacao("Selecione um cliente.", "warning");
      return;
    }

    if (carrinho.length === 0) {
      mostrarNotificacao("Carrinho vazio.", "warning");
      return;
    }

    const payload = {
      id_cliente: Number(cliente),
      mtd_pagamento: pagamento,
      itens: carrinho.map((i) => ({
        id_produto: i.id_produto,
        qtdd_pedido: i.quantidade,
      }))
    };

    try {
      const token = localStorage.getItem("token");

      await api.post("/pedidos", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalOpen(false);
      carregarVendas();
    } catch (err) {
      console.error(err);
      mostrarNotificacao(
        err.response?.data?.detalhes ||
        err.response?.data?.erro ||
        "Erro ao registrar venda.",
        "error"
      );
    }
  };

  const abrirModalVenda = () => {
    carregarClientes();
    carregarProdutos();

    setCarrinho([]);
    setCliente("");
    setItemProduto("");
    setItemQtd(1);
    setPagamento("pix");
    setNovoCliente("");
    setShowNovoClienteForm(false);

    setModalOpen(true);
  };

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const vendasDoMes = vendas.filter(v => {
    const dataVenda = normalizarData(v.dt_pedido);

    if (!dataVenda || isNaN(dataVenda.getTime())) return false;

    return (
      dataVenda.getMonth() + 1 === mesAtual &&
      dataVenda.getFullYear() === anoAtual
    );
  });

  // ------------------ RENDER ------------------
  return (
    <div className="vendas-page">

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

          {/* PERÍODO */}
          <div className="filtro-secao">
            <label>Período da venda</label>

            <div className="filtro-periodo-grid">
              <input
                type="date"
                className="filtro-input"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />

              <input
                type="date"
                className="filtro-input"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
          </div>

          {/* PAGAMENTO */}
          <div className="filtro-secao">
            <label>Forma de pagamento</label>

            <div className="checkbox-list">
              {opcoesPagamento.map((opcao) => (
                <div key={opcao.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`pagamento-${opcao.value}`}
                    checked={filtroPagamento.includes(opcao.value)}
                    onChange={() =>
                      toggleFiltro(filtroPagamento, opcao.value, setFiltroPagamento)
                    }
                  />
                  <label htmlFor={`pagamento-${opcao.value}`}>
                    {opcao.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* CLIENTE */}
          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Cliente"
              value={filtroCliente}
              onChange={setFiltroCliente}
              options={clientesFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          {/* VENDEDOR */}
          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Vendedor"
              value={filtroVendedor}
              onChange={setFiltroVendedor}
              options={vendedoresFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          {/* ITEM VENDIDO */}
          <div className="filtro-secao">
            <CampoSugestaoFiltro
              label="Item vendido"
              value={filtroItens}
              onChange={setFiltroItens}
              options={itensFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          {/* FAIXA DE VALOR */}
          <div className="filtro-secao">
            <label>Faixa de valor</label>

            <div className="filtro-periodo-grid">
              <input
                type="number"
                className="filtro-input"
                placeholder="Mín."
                min="0"
                value={filtroValorMin}
                onChange={(e) => setFiltroValorMin(e.target.value)}
              />

              <input
                type="number"
                className="filtro-input"
                placeholder="Máx."
                min="0"
                value={filtroValorMax}
                onChange={(e) => setFiltroValorMax(e.target.value)}
              />
            </div>
          </div>

        </div>

        <div className="filtros-actions">
          <button
            className="btn-limpar"
            onClick={() => {
              setBusca("");
              setFiltroPagamento([]);
              setFiltroDataInicio("");
              setFiltroDataFim("");
              setFiltroCliente("");
              setFiltroVendedor("");
              setFiltroItens("");
              setFiltroValorMin("");
              setFiltroValorMax("");
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


      <div className="vendas-main">
        {/* Título */}
        <div className="title-row" style={{ justifyContent: "space-between" }}>


          <div className="vendas-title">
            <h1>VENDAS</h1>
            <small>
              <strong>{vendasDoMes.length}</strong> venda(s) no mês atual
            </small>
          </div>

          <div style={{ display: "flex", gap: 10 }}>

            <button
              className={`filter-btn-toggle ${filtrosAbertos ? 'active' : ''}`}
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              {filtrosAbertos ? "Ocultar Filtros" : "Filtrar"}
            </button>

            <button className="add-btn" onClick={abrirModalVenda}>
              + Adicionar novo
            </button>

          </div>

        </div>


        {/* Tabela */}
        {loading && <div className="empty">Carregando vendas...</div>}

        {!loading && (
          <div className="table">
            <div className="thead">
              <div className="col">Data da venda</div>
              <div className="col">Cliente</div>
              <div className="col">Itens</div>
              <div className="col right">Total</div>
              <div className="col">Pagamento</div>
              <div className="col">Vendedor</div>
              <div className="col action"></div>
            </div>

            {filtrados.map((v) => (
              <div className="row" key={v.id_pedido}>
                <div className="col">{v.dataFormatada}</div>
                <div className="col">{v.cliente}</div>
                <div className="col">{v.itensResumo}</div>
                <div className="col right">{formatR$(v.total)}</div>
                <div className="col">{v.mtd_pagamento_label}</div>
                <div className="col">{v.vendedor}</div>

                <div className="col action">
                  <button
                    className="link"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");

                        const resp = await api.get(`/pedidos/${v.id_pedido}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });

                        setVendaSelecionada(resp.data);
                        setDetalhesOpen(true);

                      } catch (err) {
                        console.error("Erro ao carregar detalhes da venda:", err);
                        mostrarNotificacao("Erro ao carregar detalhes da venda.", "error");
                      }
                    }}
                  >
                    Detalhes
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {/* MODAL NOVA VENDA */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-box venda-modal-box">

              <div className="modal-header-venda">
                <div>
                  <h2>Nova venda</h2>
                  <p>Selecione o cliente, adicione os produtos e finalize o pagamento.</p>
                </div>

                <button
                  type="button"
                  className="modal-close-x"
                  onClick={() => setModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="venda-modal-content">

                {/* DADOS DA VENDA */}
                <section className="venda-section">
                  <div className="venda-section-title">
                    <span>1</span>
                    <h3>Dados da venda</h3>
                  </div>

                  <div className="venda-form-grid">
                    <div className="campo-venda campo-cliente">
                      <label>Cliente</label>

                      <div className="cliente-select-row">
                        <select
                          value={cliente}
                          onChange={(e) => setCliente(e.target.value)}
                        >
                          <option value="">Selecione um cliente...</option>
                          {clientes.map((c) => (
                            <option key={c.id_cliente} value={c.id_cliente}>
                              {c.razao_social}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn-novo-cliente"
                          onClick={() => {
                            setShowNovoClienteForm(!showNovoClienteForm);
                            setNovoCliente("");
                          }}
                        >
                          + Novo cliente
                        </button>
                      </div>
                    </div>

                    <div className="campo-venda">
                      <label>Vendedor</label>
                      <select
                        value={vendedor}
                        onChange={(e) => setVendedor(e.target.value)}
                      >
                        {usuarios.length === 0 && (
                          <option value={vendedor}>{nomeUsuario}</option>
                        )}

                        {usuarios.map((u) => (
                          <option key={u.id_usuario} value={u.id_usuario}>
                            {u.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {showNovoClienteForm && (
                    <div className="novo-cliente-card">
                      <div className="novo-cliente-header">
                        <div>
                          <h4>Cadastrar novo cliente</h4>
                          <p>Após salvar, o cliente será selecionado automaticamente na venda.</p>
                        </div>

                        <button
                          type="button"
                          className="btn-cancelar-cliente"
                          onClick={() => {
                            setShowNovoClienteForm(false);
                            setNovoCliente("");
                            setClienteNome("");
                            setClienteCpf("");
                            setClienteTelefone("");
                            setClienteEmail("");
                            setClienteEndereco("");
                          }}
                        >
                          Cancelar cadastro
                        </button>
                      </div>

                      <div className="novo-cliente-grid">
                        <div>
                          <label>Nome/Razão social</label>
                          <input
                            type="text"
                            placeholder="Ex: Cliente LTDA."
                            value={clienteNome}
                            onChange={(e) => setClienteNome(e.target.value)}
                          />
                        </div>

                        <div>
                          <label>CPF/CNPJ</label>
                          <input
                            type="text"
                            placeholder="Opcional"
                            value={clienteCpf}
                            onChange={(e) => setClienteCpf(e.target.value)}
                          />
                        </div>

                        <div>
                          <label>Telefone</label>
                          <input
                            type="text"
                            placeholder="Opcional"
                            value={clienteTelefone}
                            onChange={(e) => setClienteTelefone(e.target.value)}
                          />
                        </div>

                        <div>
                          <label>E-mail</label>
                          <input
                            type="email"
                            placeholder="Ex: cliente@email.com"
                            value={clienteEmail}
                            onChange={(e) => setClienteEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="campo-endereco">
                          <label>Endereço</label>
                          <input
                            type="text"
                            placeholder="Opcional"
                            value={clienteEndereco}
                            onChange={(e) => setClienteEndereco(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="novo-cliente-actions">
                        <button
                          type="button"
                          className="save-btn"
                          onClick={async () => {
                            if (!clienteNome.trim()) {
                              mostrarNotificacao("Informe o nome do cliente.", "warning");
                              return;
                            }

                            if (!clienteEmail.trim()) {
                              mostrarNotificacao("Informe o e-mail do cliente.", "warning");
                              return;
                            }

                            const token = localStorage.getItem("token");

                            try {
                              const resp = await api.post(
                                "/clientes",
                                {
                                  razao_social: clienteNome,
                                  cpf_cnpj: clienteCpf || null,
                                  telefone: clienteTelefone || null,
                                  email: clienteEmail || null,
                                  endereco: clienteEndereco || null,
                                },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );

                              const id = resp.data.id_cliente;

                              await carregarClientes();
                              setCliente(id);
                              setShowNovoClienteForm(false);
                              setNovoCliente("");

                              setClienteNome("");
                              setClienteCpf("");
                              setClienteTelefone("");
                              setClienteEmail("");
                              setClienteEndereco("");
                            } catch (err) {
                              console.error(err);
                              mostrarNotificacao(
                                err.response?.data?.erro ||
                                err.response?.data?.detalhes ||
                                "Erro ao cadastrar cliente.",
                                "error"
                              );
                            }
                          }}
                        >
                          Salvar cliente
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* ITENS DA VENDA */}
                <section className="venda-section">
                  <div className="venda-section-title">
                    <span>2</span>
                    <h3>Adicionar produtos</h3>
                  </div>

                  <div className="produto-venda-grid">
                    <div className="campo-venda">
                      <label>Produto</label>
                      <select
                        value={selectNome}
                        onChange={(e) => {
                          setSelectNome(e.target.value);
                          setSelectSabor("");
                          setSelectMarca("");
                        }}
                      >
                        <option value="">Selecione...</option>
                        {nomesUnicos.map((nome, i) => (
                          <option key={i} value={nome}>
                            {nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo-venda">
                      <label>Sabor</label>
                      <select
                        value={selectSabor}
                        onChange={(e) => {
                          setSelectSabor(e.target.value);
                          setSelectMarca("");
                        }}
                        disabled={!selectNome}
                      >
                        <option value="">Selecione...</option>
                        {saboresFiltrados.map((s, i) => (
                          <option key={i} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo-venda">
                      <label>Marca</label>
                      <select
                        value={selectMarca}
                        onChange={(e) => setSelectMarca(e.target.value)}
                        disabled={!selectSabor}
                      >
                        <option value="">Selecione...</option>
                        {marcasFiltradas.map((m, i) => (
                          <option key={i} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo-venda">
                      <label>Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={itemQtd}
                        onChange={(e) => setItemQtd(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="produto-venda-actions">
                    <button
                      type="button"
                      className="btn-adicionar-item"
                      onClick={adicionarItem}
                    >
                      Adicionar item
                    </button>
                  </div>

                  {selectMarca && produtoFinal && (
                    <div className="produto-preview-card">
                      <div>
                        <span>Estoque disponível</span>
                        <strong>{produtoFinal.qtdd_atual} unidades</strong>
                      </div>

                      <div>
                        <span>Preço unitário</span>
                        <strong>R$ {Number(produtoFinal.preco_unitario).toFixed(2)}</strong>
                      </div>

                      <div>
                        <span>Validade mais próxima</span>
                        <strong>
                          {produtoFinal.data_vencimento
                            ? new Date(produtoFinal.data_vencimento).toLocaleDateString("pt-BR")
                            : "-"}
                        </strong>
                      </div>
                    </div>
                  )}
                </section>

                {/* CARRINHO */}
                <section className="venda-section">
                  <div className="venda-section-title">
                    <span>3</span>
                    <h3>Carrinho da venda</h3>
                  </div>

                  {carrinho.length === 0 ? (
                    <div className="carrinho-vazio">
                      Nenhum item adicionado à venda.
                    </div>
                  ) : (
                    <div className="carrinho-table">
                      <div className="carrinho-head">
                        <span>Produto</span>
                        <span>Qtd.</span>
                        <span>Preço unitário</span>
                        <span>Subtotal</span>
                        <span>Ações</span>
                      </div>

                      {carrinho.map((i) => (
                        <div className="carrinho-row" key={i.id_produto}>
                          <span>{i.nome}</span>
                          <span>{i.quantidade}</span>
                          <span>{formatR$(i.preco)}</span>
                          <span>{formatR$(i.preco * i.quantidade)}</span>

                          <div className="carrinho-actions">
                            <button
                              type="button"
                              className="edit-item-btn"
                              onClick={() => editarItemCarrinho(i)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => removerItem(i.id_produto)}
                            >
                              ✖
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* FINALIZAÇÃO */}
                <section className="venda-section venda-finalizacao">
                  <div className="campo-venda">
                    <label>Método de pagamento</label>
                    <select
                      value={pagamento}
                      onChange={(e) => setPagamento(e.target.value)}
                    >
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_debito">Cartão de débito</option>
                      <option value="cartao_credito">Cartão de crédito</option>
                      <option value="boleto">Boleto</option>
                    </select>
                  </div>

                  <div className="total-venda-box">
                    <span>Total da venda</span>
                    <strong>{formatR$(totalCarrinho)}</strong>
                  </div>
                </section>

                <div className="venda-modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="save-btn"
                    onClick={salvarVenda}
                  >
                    Finalizar venda
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {
          detalhesOpen && vendaSelecionada && (
            <div className="modal-overlay">
              <div className="modal-box">

                <h2>Detalhes da venda #{vendaSelecionada.id_pedido}</h2>

                <p>
                  <strong>Data: </strong>
                  {vendaSelecionada.dt_pedido
                    ? new Date(vendaSelecionada.dt_pedido).toLocaleDateString("pt-BR")
                    : "-"}
                </p>

                <p>
                  <strong>Cliente: </strong>
                  {vendaSelecionada.cliente || "-"}
                </p>

                <p>
                  <strong>Vendedor: </strong>
                  {vendaSelecionada.vendedor || "-"}
                </p>

                <p>
                  <strong>Método de pagamento: </strong>
                  {traduzMetodo(vendaSelecionada.mtd_pagamento)}
                </p>

                <h3 style={{ marginTop: 20 }}>Itens</h3>

                <ul className="carrinho-lista">
                  {(vendaSelecionada.itens || []).map((item) => (
                    <li key={item.id_produto} className="item-linha">
                      <span className="item-nome">
                        {item.nome_produto} — {item.qtdd_pedido}x R$ {Number(item.preco_unitario).toFixed(2)}
                      </span>

                      <span className="item-qtd">
                        Subtotal: R$ {Number(item.subtotal).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p style={{ marginTop: 20, fontWeight: "bold" }}>
                  Total: R$ {
                    (vendaSelecionada.itens || [])
                      .reduce((acc, item) => acc + Number(item.subtotal || 0), 0)
                      .toFixed(2)
                  }
                </p>

                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setDetalhesOpen(false)}>
                    Fechar
                  </button>
                </div>

              </div>
            </div>
          )
        }
      </div >
    </div >
  );
}

export default Vendas;