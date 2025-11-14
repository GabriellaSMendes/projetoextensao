// src/pages/Vendas/index.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

// traduz o enum do banco para texto mais amigável
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
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  // --------- CARREGAR VENDAS DO BACKEND ----------
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

      // 2) busca detalhes de cada venda (itens vendidos)
      const detalhesPromises = lista.map((v) =>
        api.get(`/vendas/${v.id_venda}`, config).catch(() => null)
      );
      const detalhes = await Promise.all(detalhesPromises);

      // 3) monta o objeto no formato da tela
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

  useEffect(() => {
    carregarVendas();
  }, []);

  // --------- FILTRO ----------
  const filtradas = vendas.filter((v) =>
    `${v.nome_cliente} ${v.itens} ${v.metodo_pagamento}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  // --------- UTILITÁRIOS ----------
  const formatR$ = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // Editar venda (apenas no front por enquanto)
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

  // Excluir venda (apenas removendo da lista local)
  const excluirVenda = (id_venda) => {
    if (!confirm("Deseja realmente excluir esta venda da listagem?")) return;
    setVendas((lista) => lista.filter((v) => v.id_venda !== id_venda));
  };

  const totalMes = vendas.length;

  // --------- RENDER ----------
  return (
    <div className="vendas-page">
      {/* Título + contador */}
      <div className="title-row">
        <h1>VENDAS</h1>
        <span className="subtitle">{totalMes} venda(s) no mês atual</span>
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

      {/* Estados de carregamento / erro / tabela */}
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
    </div>
  );
}

export default Vendas;
