import "./style.css";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

// ===== Componente principal =====
function Vendas() {
  // Estado das vendas vindas da API
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // --------- BUSCA NO BACKEND ----------
  useEffect(() => {
    const carregarVendas = async () => {
      try {
        setCarregando(true);
        setErro("");

        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        // 1) Busca lista básica de vendas
        const respLista = await api.get("/vendas", config);
        const lista = respLista.data?.vendas || [];

        // 2) Para cada venda, busca os itens no endpoint detalhado
        const detalhesPromises = lista.map((v) =>
          api.get(`/vendas/${v.id_venda}`, config).catch(() => null)
        );
        const detalhes = await Promise.all(detalhesPromises);

        // 3) Monta o array final já no formato da tela
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
            id: venda.id_venda,
            data: new Date(venda.dt_venda).toLocaleDateString("pt-BR"),
            cliente: venda.nome_cliente || "Cliente não encontrado",
            itens: itensTexto,
            valor: Number(venda.valor_total || 0),
            metodoPagamento: traduzMetodo(venda.mtd_pagamento),
          };
        });

        setVendas(vendasFormatadas);
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar vendas. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    carregarVendas();
  }, []);

  // Tradução dos enums do backend para texto bonitinho
  const traduzMetodo = (mtd) => {
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
  };

  // --------- FILTRO DE BUSCA ----------
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return vendas;
    return vendas.filter((v) =>
      `${v.cliente} ${v.itens} ${v.metodoPagamento}`
        .toLowerCase()
        .includes(q)
    );
  }, [vendas, busca]);

  // --------- UTILITÁRIOS ----------
  const formatR$ = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // Editar venda (apenas no front, sem enviar para o backend)
  const editarVenda = (id) => {
    const venda = vendas.find((v) => v.id === id);
    if (!venda) return;

    const novoValorStr = prompt(
      "Informe o novo valor da venda:",
      String(venda.valor)
    );
    if (novoValorStr === null) return;
    const novoValor = Number(novoValorStr.replace(",", "."));
    if (isNaN(novoValor) || novoValor < 0) {
      alert("Valor inválido.");
      return;
    }

    const novoMetodo =
      prompt("Informe o novo método de pagamento:", venda.metodoPagamento) ??
      venda.metodoPagamento;

    setVendas((lista) =>
      lista.map((v) =>
        v.id === id ? { ...v, valor: novoValor, metodoPagamento: novoMetodo } : v
      )
    );
  };

  // Excluir venda (apenas removendo da lista local)
  const excluirVenda = (id) => {
    if (!confirm("Deseja realmente excluir esta venda da lista?")) return;
    setVendas((lista) => lista.filter((v) => v.id !== id));
  };

  const totalMes = vendas.length;

  // --------- RENDER ----------
  return (
    <div className="vendas-page">
      {/* Cabeçalho */}
      <div className="title-row">
        <h1>VENDAS</h1>
        <span className="subtitle">{totalMes} venda(s) no mês atual</span>
      </div>

      {/* Barra de busca */}
      <div className="search-row">
        <div className="searchbox">
          <span className="icon">🔍</span>
          <input
            placeholder="Buscar"
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

      {carregando && <div className="empty">Carregando vendas...</div>}
      {erro && !carregando && <div className="empty">{erro}</div>}

      {/* Tabela */}
      {!carregando && !erro && (
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
            <div className="row" key={v.id}>
              <div className="col">{v.data}</div>
              <div className="col">{v.cliente}</div>
              <div className="col">{v.itens}</div>
              <div className="col right">{formatR$(v.valor)}</div>
              <div className="col">{v.metodoPagamento}</div>
              <div className="col action">
                <button className="link" onClick={() => editarVenda(v.id)}>
                  Editar
                </button>
              </div>
              <div className="col center">
                <button
                  className="delete-btn"
                  onClick={() => excluirVenda(v.id)}
                >
                  ✖
                </button>
              </div>
            </div>
          ))}

          {!filtradas.length && !carregando && !erro && (
            <div className="empty">Nenhuma venda encontrada.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Vendas;
