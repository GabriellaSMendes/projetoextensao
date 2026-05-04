import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
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
    case "outros":
      return "Outros";
    default:
      return mtd || "-";
  }
}

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

function Vendas() {
  // --------------------- ESTADOS ---------------------
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [filtroItens, setFiltroItens] = useState("");

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

  const toggleFiltro = (lista, item, setLista) => {
    setLista(lista.includes(item)
      ? lista.filter(i => i !== item)
      : [...lista, item]
    );
  };

  const filtrados = useMemo(() => {
    return vendas.filter((v) => {

      const atendeBusca =
        v.nome_cliente?.toLowerCase().includes(busca.toLowerCase()) ||
        v.vendedor?.toLowerCase().includes(busca.toLowerCase());

      const atendePagamento =
        filtroPagamento.length === 0 ||
        filtroPagamento.includes(
          (v.metodo_pagamento || "").toLowerCase()
        )

      const atendeItens =
        !filtroItens ||
        v.itemPrincipal?.toLowerCase().includes(filtroItens.toLowerCase());

      return atendeBusca && atendePagamento && atendeItens;

    });
  }, [vendas, busca, filtroPagamento, filtroItens]);

  const itensUnicos = [
    ...new Set(
      vendas.map(v => v.itemPrincipal)
    )
  ];

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
        lista.map((v) =>
          api.get(`/pedidos/${v.id_pedido}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null)
        )
      );

      const vendasFormatadas = lista.map((venda, i) => {
        const det = detalhes[i]?.data;

        let itensTexto = "—";
        let itemPrincipal = "";
        let totalCalculado = 0;

        if (det?.itens && det.itens.length > 0) {
          const itens = det.itens;
          const primeiro = itens[0].nome_produto;
          const totalProdutos = itens.length;

          itemPrincipal = primeiro;

          // ✅ CALCULAR TOTAL AQUI
          totalCalculado = itens.reduce((acc, item) => {
            return acc + Number(item.preco_unitario) * item.qtdd_pedido;
          }, 0);

          if (totalProdutos === 1) {
            itensTexto = primeiro;
          } else {
            itensTexto = `${primeiro} + ${totalProdutos - 1} item(s)`;
          }
        }

        return {
          id_venda: venda.id_pedido,
          dt_venda: venda.dt_pedido, // 🔥 aproveita e corrige isso também
          dataFormatada: new Date(venda.dt_pedido).toLocaleDateString("pt-BR"),
          nome_cliente: venda.cliente,
          itens: itensTexto,
          itemPrincipal: itemPrincipal,
          valor_total: totalCalculado, // ✅ AGORA CORRETO
          metodo_pagamento: venda.mtd_pagamento,          // 🔥 valor real
          metodo_pagamento_label: traduzMetodo(venda.mtd_pagamento), // 🔥 label
          vendedor: venda.vendedor || "—"
        };
      });

      setVendas(vendasFormatadas);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar vendas.");
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
      setNomeUsuarioLogado(usuario.nomeUsuario);
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

  // ------------------ EXCLUIR (BACKEND) ------------------
  const excluirVenda = async (id_venda) => {
    if (!confirm("Deseja realmente excluir esta venda? Isso devolve os itens ao estoque.")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/pedidos/${id_venda}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      carregarVendas();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir venda.");
    }
  };

  // ------------------ CARRINHO ------------------
  const adicionarItem = () => {
    if (!produtoFinal) return alert("Selecione nome, sabor e marca.");

    if (itemQtd > produtoFinal.qtdd_atual)
      return alert("Quantidade maior do que o estoque disponível.");

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

  const totalCarrinho = carrinho.reduce(
    (acc, i) => acc + i.preco * i.quantidade,
    0
  );

  // ------------------ SALVAR VENDA ------------------
  const salvarVenda = async () => {
    if (!cliente) return alert("Selecione um cliente.");
    if (carrinho.length === 0) return alert("Carrinho vazio.");

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
      alert("Erro ao registrar venda.");
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
    const dataVenda = normalizarData(v.dt_venda);

    if (!dataVenda || isNaN(dataVenda.getTime())) return false;

    return (
      dataVenda.getMonth() + 1 === mesAtual &&
      dataVenda.getFullYear() === anoAtual
    );
  });

  console.log("data_venda recebida:", filtrados.map(v => v.dt_venda));

  // ------------------ RENDER ------------------
  return (
    <div className="vendas-page">


      <aside className={`filtros-avancados ${filtrosAbertos ? "aberto" : "fechado"}`}>

        <div className="filtros-header">
          <h2>Filtros Avançados</h2>
          <button className="close-btn" onClick={() => setFiltrosAbertos(false)}>×</button>
        </div>

        <div className="filtro-scroll-area">

          {/* BUSCA */}
          <div className="filtro-secao">
            <label>Pesquisar</label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Cliente ou vendedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* PAGAMENTO */}
          <div className="filtro-secao">
            <label>Forma de pagamento</label>
            <div className="checkbox-list">
              {["dinheiro", "cartao_debito", "cartao_credito", "pix", "outros"].map((tipo) => (
                <div key={tipo} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={tipo}
                    checked={filtroPagamento.includes(tipo)}
                    onChange={() => toggleFiltro(filtroPagamento, tipo, setFiltroPagamento)}
                  />
                  <label htmlFor={tipo}>{tipo}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="filtro-secao">
            <label>Itens</label>

            <input
              type="text"
              className="filtro-input"
              placeholder="Digite o nome do item..."
              value={filtroItens}
              onChange={(e) => setFiltroItens(e.target.value)}
            />
          </div>

        </div>

        <div className="filtros-actions">
          <button
            className="btn-limpar"
            onClick={() => {
              setBusca("");
              setFiltroPagamento([]);
              setFiltroItens("");
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
              <div className="col center"></div>
            </div>

            {filtrados.map((v) => (
              <div className="row" key={v.id_venda}>
                <div className="col">{v.dataFormatada}</div>
                <div className="col">{v.nome_cliente}</div>
                <div className="col">{v.itens}</div>
                <div className="col right">{formatR$(v.valor_total)}</div>
                <div className="col">{v.metodo_pagamento_label}</div>
                <div className="col">{v.vendedor}</div>

                <div className="col action">
                  <button
                    className="link"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");

                        const resp = await api.get(`/pedidos/${v.id_venda}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });

                        setVendaSelecionada(resp.data);
                        setDetalhesOpen(true);

                      } catch (err) {
                        console.error("Erro ao carregar detalhes da venda:", err);
                        alert("Erro ao carregar detalhes.");
                      }
                    }}
                  >
                    Detalhes
                  </button>
                </div>

                <div className="col center">
                  <button
                    className="delete-btn"
                    onClick={() => excluirVenda(v.id_venda)}
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>Nova Venda</h2>

              <div className="modal-grid">
                {/* =============== COLUNA ESQUERDA =============== */}
                <div className="modal-col">

                  {/* CLIENTE */}
                  <label>Cliente</label>
                  <select value={cliente} onChange={(e) => setCliente(e.target.value)}>
                    <option value="">Selecione...</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.razao_social}
                      </option>
                    ))}
                  </select>

                  {/* Novo cliente */}
                  <div className="novo-cliente-inline">
                    <input
                      type="text"
                      placeholder="Novo cliente"
                      value={novoCliente}
                      onChange={(e) => setNovoCliente(e.target.value)}
                    />

                    <button
                      className="criar-btn"
                      onClick={() => {
                        if (!novoCliente.trim()) return alert("Digite um nome");
                        setClienteNome(novoCliente);
                        setShowNovoClienteForm(true);
                      }}
                    >
                      Criar
                    </button>
                  </div>

                  {showNovoClienteForm && (
                    <div className="novo-cliente-form">
                      <h3>Novo cliente</h3>

                      <input
                        type="text"
                        placeholder="Nome"
                        value={clienteNome}
                        onChange={(e) => setClienteNome(e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="CPF"
                        value={clienteCpf}
                        onChange={(e) => setClienteCpf(e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="Telefone"
                        value={clienteTelefone}
                        onChange={(e) => setClienteTelefone(e.target.value)}
                      />

                      <input
                        type="email"
                        placeholder="E-mail"
                        value={clienteEmail}
                        onChange={(e) => setClienteEmail(e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="Endereço"
                        value={clienteEndereco}
                        onChange={(e) => setClienteEndereco(e.target.value)}
                      />

                      <button
                        className="save-btn"
                        onClick={async () => {
                          const token = localStorage.getItem("token");

                          try {
                            const resp = await api.post(
                              "/clientes",
                              {
                                razao_social: clienteNome,
                                cpf_cnpj: clienteCpf,
                                telefone: clienteTelefone || null,
                                email: clienteEmail || null,
                                endereco: clienteEndereco || null,
                              },
                              { headers: { Authorization: `Bearer ${token}` } }
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
                          }
                        }}
                      >
                        Salvar cliente
                      </button>
                    </div>
                  )}

                  {/* VENDEDOR */}
                  <label style={{ marginTop: 20 }}>Vendedor</label>
                  <select value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
                    {/* enquanto a rota não existe */}
                    {usuarios.length === 0 && (
                      <option value={vendedor}>{nomeUsuario}</option>
                    )}

                    {/* quando o backend criar a rota /usuarios */}
                    {usuarios.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nome}
                      </option>
                    ))}
                  </select>

                  {/* PAGAMENTO */}
                  <label>Método de pagamento</label>
                  <select
                    value={pagamento}
                    onChange={(e) => setPagamento(e.target.value)}
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                {/* =============== COLUNA DIREITA =============== */}
                <div className="modal-col">

                  {/* NOME DO PRODUTO */}
                  <label style={{ marginTop: 20 }}>Nome do produto</label>
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
                      <option key={i} value={nome}>{nome}</option>
                    ))}
                  </select>

                  {/* SABOR */}
                  {selectNome && (
                    <>
                      <label style={{ marginTop: 16 }}>Sabor</label>
                      <select
                        value={selectSabor}
                        onChange={(e) => {
                          setSelectSabor(e.target.value);
                          setSelectMarca("");
                        }}
                      >
                        <option value="">Selecione...</option>
                        {saboresFiltrados.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {/* MARCA */}
                  {selectSabor && (
                    <>
                      <label style={{ marginTop: 16 }}>Marca</label>
                      <select
                        value={selectMarca}
                        onChange={(e) => setSelectMarca(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {marcasFiltradas.map((m, i) => (
                          <option key={i} value={m}>{m}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {/* PREVIEW DO PRODUTO FINAL */}
                  {selectMarca && produtoFinal && (
                    <div style={{ marginTop: 12, fontSize: 14 }}>
                      <p><strong>Validade mais próxima:</strong> {new Date(produtoFinal.data_vencimento).toLocaleDateString("pt-BR")}</p>
                      <p><strong>Estoque disponível:</strong> {produtoFinal.qtdd_atual} unidades</p>
                      <p><strong>Preço:</strong> R$ {Number(produtoFinal.preco_unitario).toFixed(2)}</p>
                    </div>
                  )}

                  <label style={{ marginTop: 20 }}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQtd}
                    onChange={(e) => setItemQtd(Number(e.target.value))}
                  />

                  <button className="add-btn" style={{ marginTop: 10 }} onClick={adicionarItem}>
                    Adicionar item
                  </button>

                  {/* CARRINHO */}
                  <div className="resumo-venda">
                    <h3>Itens da venda</h3>

                    {carrinho.length === 0 && <p>Nenhum item.</p>}

                    {carrinho.length > 0 && (
                      <ul className="carrinho-lista">
                        {carrinho.map((i) => (
                          <li key={i.id_produto}>
                            {i.quantidade}x {i.nome} — R$
                            {(i.preco * i.quantidade).toFixed(2)}
                            <button
                              className="delete-btn"
                              onClick={() => removerItem(i.id_produto)}
                              style={{ marginLeft: 10 }}
                            >
                              ✖
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="total">
                      Total: R$ {totalCarrinho.toFixed(2)}
                    </p>
                  </div>

                  <p style={{ marginTop: 12, fontWeight: "bold" }}>
                    Total: R$ {totalCarrinho.toFixed(2)}
                  </p>

                  <div className="modal-actions" style={{ marginTop: 20 }}>
                    <button className="cancel-btn" onClick={() => setModalOpen(false)}>
                      Cancelar
                    </button>
                    <button className="save-btn" onClick={salvarVenda}>
                      Finalizar venda
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )
        }

        {
          detalhesOpen && vendaSelecionada && (
            <div className="modal-overlay">
              <div className="modal-box">

                <h2>Detalhes da venda #{vendaSelecionada.id_venda}</h2>

                <p><strong>Data: </strong>
                  {new Date(vendaSelecionada.dt_venda).toLocaleDateString("pt-BR")}
                </p>

                <p><strong>Cliente: </strong>
                  {vendaSelecionada.cliente?.razao_social}
                </p>

                <p><strong>Vendedor: </strong>
                  {vendaSelecionada.vendedor?.nome_usuario}
                </p>

                <p><strong>Método de pagamento: </strong>
                  {traduzMetodo(vendaSelecionada.mtd_pagamento)}
                </p>

                <h3 style={{ marginTop: 20 }}>Itens</h3>

                <ul className="carrinho-lista">
                  {(vendaSelecionada.itens || []).map((item) => (
                    <li key={item.id_produto} className="item-linha">
                      <span className="item-nome">
                        {item.nome_produto} — R$ {(item.preco_unitario_na_venda * item.qtdd_venda).toFixed(2)}
                      </span>
                      <span className="item-qtd">{item.qtdd_venda}x</span>
                    </li>
                  ))}
                </ul>

                <p style={{ marginTop: 20, fontWeight: "bold" }}>
                  Total: R$ {Number(vendaSelecionada.valor_total).toFixed(2)}
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