// Importa hooks e CSS
import { useMemo, useState } from "react";
import "./style.css";

// ===== Componente principal =====
function Vendas() {
  // Dados mockados de exemplo (uma venda por linha da tabela)
  const [vendas, setVendas] = useState([
    {
      id: 1,
      data: "01/11/2025",
      cliente: "Maria Silva",
      itens: "Casquinha de sorvete, Calda de chocolate",
      valor: 100.0,
      notaFiscal: "#NF-0001",
      metodoPagamento: "Cartão de crédito",
      ativa: true,
    },
    {
      id: 2,
      data: "05/11/2025",
      cliente: "João Souza",
      itens: "Casquinha de sorvete",
      valor: 50.0,
      notaFiscal: "#NF-0002",
      metodoPagamento: "PIX",
      ativa: true,
    },
  ]);

  const [busca, setBusca] = useState("");

  // Filtro da busca (cliente, itens, método)
  // Filtro da busca (procura em cliente, itens e método)
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return vendas;
    return vendas.filter((v) =>
      `${v.cliente} ${v.itens} ${v.metodoPagamento}`.toLowerCase().includes(q)
    );
  }, [vendas, busca]);

  // Formata em reais
      `${v.cliente} ${v.itens} ${v.metodoPagamento}`
        .toLowerCase()
        .includes(q)
    );
  }, [vendas, busca]);

  // Formata valor em reais
  const formatR$ = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // Total de vendas no mês (para o cabeçalho)
  const totalMes = vendas.length;

  // Editar venda (valor + método de pagamento via prompt)
  // Editar venda (altera valor e método de pagamento via prompt)
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
      prompt(
        "Informe o novo método de pagamento:",
        venda.metodoPagamento
      ) ?? venda.metodoPagamento;

    setVendas((lista) =>
      lista.map((v) =>
        v.id === id
          ? { ...v, valor: novoValor, metodoPagamento: novoMetodo }
          : v
      )
    );
  };

  // Excluir venda
  const excluirVenda = (id) => {
    if (!confirm("Deseja realmente excluir esta venda?")) return;
    setVendas((lista) => lista.filter((v) => v.id !== id));
  };

  // Total de vendas (só para exibir no cabeçalho)
  const totalMes = vendas.length;

  return (
    <div className="vendas-page">
      {/* Cabeçalho igual ao layout: VENDAS + texto do lado */}
      <div className="title-row">
        <h1>VENDAS</h1>
        <span className="subtitle">
          {totalMes} venda(s) no mês atual
        </span>
      </div>

      {/* Barra de busca + botão Filtrar por */}
        <div>
          <h1>VENDAS</h1>
          <small>{totalMes} venda(s) no mês atual</small>
        </div>
      </div>

      {/* Barra de busca + botão de filtro */}
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
{/* 
        <button className="filter-btn">
          Filtrar por <span className="icon">🧪</span>
        </button> */}

        <button className="filter-btn">
          Filtrar por <span className="icon">🧪</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="table">
        {/* Cabeçalho da tabela */}
        {/* Cabeçalho da tabela igual ao da imagem */}
        <div className="thead">
          <div className="col">Data da venda</div>
          <div className="col">Cliente</div>
          <div className="col">Itens</div>
          <div className="col right">Valor da venda</div>
          {/* <div className="col">Nota fiscal</div> */}
          <div className="col">Nota fiscal</div>
          <div className="col">Método pagamento</div>
          <div className="col action">Editar</div>
          <div className="col center">Excluir</div>
        </div>

        {/* Linhas */}
        {filtradas.map((v) => (
          <div className="row" key={v.id}>
            <div className="col">{v.data}</div>
            <div className="col">{v.cliente}</div>
            <div className="col">{v.itens}</div>
            <div className="col right">{formatR$(v.valor)}</div>
            {/* <div className="col">
              <button className="link">Acessar nota fiscal</button>
            </div> */}
            <div className="col">
              <button className="link">Acessar nota fiscal</button>
            </div>
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

        {!filtradas.length && (
          <div className="empty">Nenhuma venda encontrada.</div>
        )}
      </div>
    </div>
  );
}

// Exporta para uso no App
export default Vendas;