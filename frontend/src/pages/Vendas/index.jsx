import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

// traduz enum do banco para texto amigável
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
  // estados principais
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  // modal nova venda
  const [modalOpen, setModalOpen] = useState(false);

  // selects
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // form da venda
  const [formVenda, setFormVenda] = useState({
    id_cliente: "",
    mtd_pagamento: "",
  });

  // campos para CADASTRO RÁPIDO de cliente/produto
  const [novoClienteNome, setNovoClienteNome] = useState("");

  const [novoProdutoNome, setNovoProdutoNome] = useState("");
  const [novoProdutoPreco, setNovoProdutoPreco] = useState("");
  const [novoProdutoEstoque, setNovoProdutoEstoque] = useState("");

  // itens adicionados à venda
  const [itensVenda, setItensVenda] = useState([]);

  // controles do "item sendo montado"
  const [novoItem, setNovoItem] = useState({
    id_produto: "",
    quantidade: "",
  });

  // ---------- CARREGAR DADOS BÁSICOS ----------
  const carregarVendas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      // 1) lista básica de vendas
      const respLista = await api.get("/vendas", config);
      const lista = respLista.data?.vendas || [];

      // 2) detalhes de cada venda (itens)
      const detalhesPromises = lista.map((v) =>
        api.get(`/vendas/${v.id_venda}`, config).catch(() => null)
      );
      const detalhes = await Promise.all(detalhesPromises);

      const vendasFormatadas = lista.map((venda, index) => {
        const det = detalhes[index]?.data;

        const itensTexto = det?.itens_vendidos
          ? det.itens_vendidos
            .map(
              (item) =>
                `${item.qtdd_venda}x ${item.nome_produto ?? "Produto"}`
            )
            .join(", ")
          : "Itens não disponíveis";

        return {
          id_venda: venda.id_venda,
          dataFormatada: new Date(venda.dt_venda).toLocaleDateString("pt-BR"),
          nome_cliente: venda.nome_cliente || "Cliente não encontrado",
          itens: itensTexto,
          valor_total: Number(venda.valor_total || 0),
          metodo_pagamento: traduzMetodo(venda.mtd_pagamento),
        };
      });

      setVendas(vendasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      alert("Erro ao carregar vendas.");
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const resp = await api.get("/clientes", config);
      setClientes(resp.data.clientes || resp.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const resp = await api.get("/estoque/produtos", config);
      setProdutos(resp.data.produtos || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  useEffect(() => {
    carregarVendas();
    carregarClientes();
    carregarProdutos();
  }, []);

  // ---------- FILTRO ----------
  const filtradas = vendas.filter((v) =>
    `${v.nome_cliente} ${v.itens} ${v.metodo_pagamento}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  // ---------- UTILITÁRIOS ----------
  const formatR$ = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // editar venda só no front
  const editarVenda = (id_venda) => {
    const venda = vendas.find((v) => v.id_venda === id_venda);
    if (!venda) return;

    const novoValorStr = prompt(
      "Informe o novo valor da venda:",
      String(venda.valor_total)
    );
    if (novoValorStr === null) return;

    const novoValor = Number(novoValorStr.replace(",", "."));
    if (isNaN(novoValor) || novoValor < 0) {
      alert("Valor inválido.");
      return;
    }

    const novoMetodo =
      prompt("Informe o novo método de pagamento:", venda.metodo_pagamento) ??
      venda.metodo_pagamento;

    setVendas((lista) =>
      lista.map((v) =>
        v.id_venda === id_venda
          ? { ...v, valor_total: novoValor, metodo_pagamento: novoMetodo }
          : v
      )
    );
  };

  const excluirVenda = (id_venda) => {
    if (!confirm("Deseja realmente excluir esta venda da listagem?")) return;
    setVendas((lista) => lista.filter((v) => v.id_venda !== id_venda));
  };

  // ---------- FORM NOVA VENDA / MODAL ----------

  const abrirModalNovaVenda = () => {
    setFormVenda({ id_cliente: "", mtd_pagamento: "" });
    setNovoClienteNome("");
    setNovoProdutoNome("");
    setNovoProdutoPreco("");
    setNovoProdutoEstoque("");
    setItensVenda([]);
    setNovoItem({ id_produto: "", quantidade: "" });
    setModalOpen(true);
  };

  const handleChangeVenda = (e) => {
    const { name, value } = e.target;
    setFormVenda((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeNovoItem = (e) => {
    const { name, value } = e.target;
    setNovoItem((prev) => ({ ...prev, [name]: value }));
  };

  // adiciona item à lista (produto existente OU novo produto)
  const adicionarItemVenda = () => {
    const quantidadeNum = Number(novoItem.quantidade);

    if (!quantidadeNum || quantidadeNum <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    // CASO 1: produto existente selecionado no select
    if (novoItem.id_produto) {
      const produto = produtos.find(
        (p) => p.id_produto === Number(novoItem.id_produto)
      );
      if (!produto) {
        alert("Produto selecionado inválido.");
        return;
      }

      setItensVenda((lista) => [
        ...lista,
        {
          tipo: "existente",
          id_produto: produto.id_produto,
          nome_produto: produto.nome_produto,
          quantidade: quantidadeNum,
        },
      ]);
      setNovoItem({ id_produto: "", quantidade: "" });
      return;
    }

    // CASO 2: nenhum produto selecionado, mas foi digitado um novo
    if (!novoProdutoNome.trim()) {
      alert(
        "Selecione um produto existente OU preencha os dados do novo produto."
      );
      return;
    }

    const precoNum = Number(
      (novoProdutoPreco || "").toString().replace(",", ".")
    );
    const estoqueInicialNum = Number(novoProdutoEstoque || quantidadeNum);

    if (!precoNum || precoNum <= 0) {
      alert("Informe um preço válido para o novo produto.");
      return;
    }

    if (!estoqueInicialNum || estoqueInicialNum <= 0) {
      alert("Informe o estoque inicial do novo produto.");
      return;
    }

    setItensVenda((lista) => [
      ...lista,
      {
        tipo: "novo",
        nome_produto: novoProdutoNome.trim(),
        quantidade: quantidadeNum,
        preco_unitario: precoNum,
        qtdd_inicial: estoqueInicialNum,
      },
    ]);

    // não limpamos os campos de produto novo totalmente para reaproveitar,
    // só zeramos a quantidade do item atual
    setNovoItem({ id_produto: "", quantidade: "" });
  };

  const removerItemVenda = (index) => {
    setItensVenda((lista) => lista.filter((_, i) => i !== index));
  };

  // salva venda (cria cliente/produto se for o caso)
  const salvarVenda = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      // 1) resolver cliente (existente ou novo)
      let idClienteFinal = formVenda.id_cliente
        ? Number(formVenda.id_cliente)
        : null;

      if (!idClienteFinal && novoClienteNome.trim()) {
        const respCli = await api.post(
          "/clientes",
          {
            nome_cliente: novoClienteNome.trim(),
            // adicione aqui outros campos se quiser (cpf, email, telefone...)
          },
          config
        );

        const dadosCli = respCli.data || {};
        // ajuste o nome do campo conforme sua API
        idClienteFinal =
          dadosCli.id_cliente || dadosCli.id || dadosCli.novo_id || null;
      }

      if (!idClienteFinal) {
        alert("Selecione um cliente ou cadastre um novo.");
        return;
      }

      if (!formVenda.mtd_pagamento) {
        alert("Selecione o método de pagamento.");
        return;
      }

      if (itensVenda.length === 0) {
        alert("Adicione pelo menos um item à venda.");
        return;
      }

      // 2) resolver produtos (existentes + criar novos antes de enviar venda)
      const itensParaEnviar = [];

      for (const item of itensVenda) {
        if (item.tipo === "existente") {
          itensParaEnviar.push({
            id_produto: item.id_produto,
            quantidade: item.quantidade,
          });
        } else {
          // cria produto novo no estoque
          const respProd = await api.post(
            "/estoque/produtos",
            {
              nome_produto: item.nome_produto,
              sabor: "",
              marca: "",
              data_vencimento: null,
              preco_unitario: item.preco_unitario,
              id_categoria: null, // opcional
              qtdd_inicial: item.qtdd_inicial,
            },
            config
          );

          const dadosProd = respProd.data || {};
          const novoIdProd =
            dadosProd.id_produto ||
            dadosProd.id ||
            dadosProd.novo_id_produto ||
            null;

          if (!novoIdProd) {
            throw new Error("Não foi possível obter o ID do novo produto.");
          }

          itensParaEnviar.push({
            id_produto: novoIdProd,
            quantidade: item.quantidade,
          });
        }
      }

      // 3) envia venda para o backend
      const body = {
        id_cliente: idClienteFinal,
        mtd_pagamento: formVenda.mtd_pagamento,
        itens: itensParaEnviar,
      };

      await api.post("/vendas", body, config);

      alert("Venda registrada com sucesso!");
      setModalOpen(false);
      carregarVendas();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      alert("Erro ao registrar venda.");
    }
  };

  const totalMes = vendas.length;

  // ---------- RENDER ----------
  return (
    <div className="vendas-page">
      {/* Título + botão nova venda */}
      <div className="title-row" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h1>VENDAS</h1>
          <span className="subtitle">{totalMes} venda(s) no mês atual</span>
        </div>

        <button className="add-btn" onClick={abrirModalNovaVenda}>
          + Registrar venda
        </button>
      </div>

      {/* Barra de busca */}
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

      {loading && <div className="empty">Carregando vendas...</div>}

      {!loading && (
        <div className="table">
          <div className="thead">
            <div className="col">Data da venda</div>
            <div className="col">Cliente</div>
            <div className="col">Itens</div>
            <div className="col right">Valor da venda</div>
            <div className="col">Método pagamento</div>
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
                <button
                  className="link"
                  onClick={() => editarVenda(v.id_venda)}
                >
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

          {!loading && filtradas.length === 0 && (
            <div className="empty">Nenhuma venda encontrada.</div>
          )}
        </div>
      )}

      {/* MODAL NOVA VENDA */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Adicionar novo</h2>

            {/* linha 1: cliente + método + novo cliente */}
            <div className="form-grid">
              <div>
                <label>Cliente</label>
                <select
                  name="id_cliente"
                  value={formVenda.id_cliente}
                  onChange={handleChangeVenda}
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nome_cliente}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Método de pagamento</label>
                <select
                  name="mtd_pagamento"
                  value={formVenda.mtd_pagamento}
                  onChange={handleChangeVenda}
                >
                  <option value="">Selecione...</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label>Novo cliente (opcional)</label>
                <input
                  placeholder="Nome do novo cliente"
                  value={novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                />
              </div>
            </div>

            <hr style={{ margin: "16px 0" }} />

            <h3>Itens da venda</h3>

            {/* linha 2: produto existente + quantidade + botão */}
            <div className="form-grid">
              <div>
                <label>Produto existente</label>
                <select
                  name="id_produto"
                  value={novoItem.id_produto}
                  onChange={handleChangeNovoItem}
                >
                  <option value="">Selecione...</option>
                  {produtos.map((p) => (
                    <option key={p.id_produto} value={p.id_produto}>
                      {p.nome_produto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Quantidade</label>
                <input
                  type="number"
                  name="quantidade"
                  value={novoItem.quantidade}
                  onChange={handleChangeNovoItem}
                  min="1"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="save-btn"
                  onClick={adicionarItemVenda}
                >
                  Adicionar item
                </button>
              </div>
            </div>

            {/* linha 3: cadastro rápido de produto novo */}
            <div className="form-grid" style={{ marginTop: 12 }}>
              <div>
                <label>Novo produto (nome)</label>
                <input
                  placeholder="Nome do novo produto"
                  value={novoProdutoNome}
                  onChange={(e) => setNovoProdutoNome(e.target.value)}
                />
              </div>

              <div>
                <label>Preço unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={novoProdutoPreco}
                  onChange={(e) => setNovoProdutoPreco(e.target.value)}
                />
              </div>

              <div>
                <label>Estoque inicial</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex.: 100"
                  value={novoProdutoEstoque}
                  onChange={(e) => setNovoProdutoEstoque(e.target.value)}
                />
              </div>
            </div>

            {/* lista de itens adicionados */}
            {itensVenda.length > 0 && (
              <ul style={{ marginTop: 12 }}>
                {itensVenda.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                      fontSize: 14,
                    }}
                  >
                    <span>
                      {item.quantidade}x {item.nome_produto}
                      {item.tipo === "novo" && " (novo produto)"}
                    </span>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => removerItemVenda(index)}
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="save-btn" onClick={salvarVenda}>
                Salvar venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendas;
