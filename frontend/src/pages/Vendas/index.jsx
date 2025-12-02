import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

// traduz enum do banco
function traduzMetodo(mtd) {
  switch (mtd) {
    case "dinheiro":
      return "Dinheiro";
    case "cartao":
      return "Cartão";
    case "pix":
      return "PIX";
    case "outros":
      return "Outros";
    default:
      return mtd || "-";
  }
}

function Vendas() {
  // --------------------- ESTADOS ---------------------
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [cliente, setCliente] = useState("");
  const [novoCliente, setNovoCliente] = useState("");

  const [itemProduto, setItemProduto] = useState("");
  const [itemQtd, setItemQtd] = useState(1);
  const [carrinho, setCarrinho] = useState([]);

  const [pagamento, setPagamento] = useState("pix");

  // formulário de novo cliente
  const [showNovoClienteForm, setShowNovoClienteForm] = useState(false);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCpf, setClienteCpf] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");

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

      const respLista = await api.get("/vendas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const lista = respLista.data?.vendas || [];

      const detalhes = await Promise.all(
        lista.map((v) =>
          api.get(`/vendas/${v.id_venda}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null)
        )
      );

      const vendasFormatadas = lista.map((venda, i) => {
        const det = detalhes[i]?.data;

        const itensTexto = det?.itens_vendidos
          ? det.itens_vendidos
              .map((item) => `${item.qtdd_venda}x ${item.nome_produto}`)
              .join(", ")
          : "Itens não disponíveis";

        return {
          id_venda: venda.id_venda,
          dataFormatada: new Date(venda.dt_venda).toLocaleDateString("pt-BR"),
          nome_cliente: venda.nome_cliente,
          itens: itensTexto,
          valor_total: Number(venda.valor_total || 0),
          metodo_pagamento: traduzMetodo(venda.mtd_pagamento),
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

  // ------------------ FILTRO ------------------
  const filtradas = vendas.filter((v) =>
    `${v.nome_cliente} ${v.itens} ${v.metodo_pagamento}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

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

      await api.delete(`/vendas/${id_venda}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Venda excluída com sucesso.");
      carregarVendas();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir venda.");
    }
  };

  // ------------------ CARRINHO ------------------
  const adicionarItem = () => {
    if (!itemProduto) return alert("Selecione um produto.");
    const produto = produtos.find((p) => p.id_produto == itemProduto);

    if (itemQtd > produto.qtdd_atual)
      return alert("Quantidade maior que o estoque disponível.");

    setCarrinho((prev) => [
      ...prev,
      {
        id_produto: produto.id_produto,
        nome: produto.nome_produto,
        quantidade: itemQtd,
        preco: Number(produto.preco_unitario),
      },
    ]);

    setItemProduto("");
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
        quantidade: i.quantidade,
      })),
    };

    try {
      const token = localStorage.getItem("token");

      await api.post("/vendas", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Venda registrada com sucesso!");
      setModalOpen(false);
      carregarVendas();
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar venda.");
    }
  };

  const totalMes = vendas.length;

  // ------------------ RENDER ------------------
  return (
    <div className="vendas-page">
      {/* Título */}
      <div className="title-row" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <h1>VENDAS</h1>
          <span className="subtitle">{totalMes} venda(s) no mês atual</span>
        </div>

        <button
          className="add-btn"
          onClick={() => {
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
          }}
        >
          + Registrar venda
        </button>
      </div>

      {/* Busca */}
      <div className="search-row">
        <div className="searchbox">
          <span className="icon">🔍</span>
          <input
            placeholder="Buscar venda"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button className="clear" onClick={() => setBusca("")}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      {loading && <div className="empty">Carregando vendas...</div>}

      {!loading && (
        <div className="table">
          <div className="thead">
            <div className="col">Data</div>
            <div className="col">Cliente</div>
            <div className="col">Itens</div>
            <div className="col right">Total</div>
            <div className="col">Pagamento</div>
            <div className="col action">Editar</div>
            <div className="col center">Excluir</div>
          </div>

          {filtradas.map((v) => (
            <div className="row" key={v.id_venda}>
              <div className="col">{v.dataFormatada}</div>
              <div className="col">{v.nome_cliente}</div>
              <div className="col">{v.itens}</div>
              <div className="col right">{formatR$(v.valor_total)}</div>
              <div className="col">{v.metodo_pagamento}</div>

              <div className="col action">
                <button className="link" onClick={() => alert("Função futura")}>
                  Editar
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

            {/* CLIENTE */}
            <label>Cliente</label>
            <select value={cliente} onChange={(e) => setCliente(e.target.value)}>
              <option value="">Selecione...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nome_cliente}
                </option>
              ))}
            </select>

            {/* Novo cliente */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="text"
                placeholder="Novo cliente"
                value={novoCliente}
                onChange={(e) => setNovoCliente(e.target.value)}
              />

              <button
                className="save-btn"
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
                          nome_cliente: clienteNome,
                          cpf: clienteCpf || null,
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

            {/* PRODUTO */}
            <label style={{ marginTop: "20px", display: "block" }}>Produto</label>
            <select
              value={itemProduto}
              onChange={(e) => setItemProduto(e.target.value)}
            >
              <option value="">Selecione...</option>
              {produtos.map((p) => (
                <option key={p.id_produto} value={p.id_produto}>
                  {p.nome_produto}
                </option>
              ))}
            </select>

            {itemProduto && (
              <p className="estoque-info">
                Estoque disponível:{" "}
                {produtos.find((p) => p.id_produto == itemProduto)?.qtdd_atual}
                {" unidades"}
              </p>
            )}

            <input
              type="number"
              min="1"
              value={itemQtd}
              onChange={(e) => setItemQtd(Number(e.target.value))}
              style={{ marginTop: 8 }}
            />

            <button className="add-btn" style={{ marginTop: 10 }} onClick={adicionarItem}>
              Adicionar item
            </button>

            {/* CARRINHO */}
            <h3 style={{ marginTop: 20 }}>Itens da venda</h3>

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

            <p style={{ marginTop: 12, fontWeight: "bold" }}>
              Total: R$ {totalCarrinho.toFixed(2)}
            </p>

            {/* PAGAMENTO */}
            <label>Método de pagamento</label>
            <select
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
            >
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="outros">Outros</option>
            </select>

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
      )}
    </div>
  );
}

export default Vendas;
