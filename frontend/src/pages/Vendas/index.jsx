// Importa hooks e CSS
import { useMemo, useState } from "react";
import "./style.css";

// ===== Componente principal =====
function Vendas() {
  // Dados mockados de exemplo
  const [itens, setItens] = useState([
    {
      id: 1,
      img: "https://via.placeholder.com/40x60?text=🍦",
      nome: "Casquinha de sorvete",
      codigo: "C-0001",
      categoria: "Casquinhas e Wafers",
      preco: 2.9,
      quantidade: 5,
      ativo: true,
    },
    {
      id: 2,
      img: "https://via.placeholder.com/40x60?text=🍫",
      nome: "Calda de chocolate",
      codigo: "S-0102",
      categoria: "Coberturas",
      preco: 12.5,
      quantidade: 2,
      ativo: true,
    },
  ]);

  const [busca, setBusca] = useState("");

  // Filtro da busca
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return itens;
    return itens.filter((i) =>
      `${i.nome} ${i.codigo} ${i.categoria}`.toLowerCase().includes(q)
    );
  }, [itens, busca]);

  // Alterna ativo/inativo
  const toggleAtivo = (id) => {
    setItens((arr) =>
      arr.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i))
    );
  };

  // Formata em reais
  const formatR$ = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Soma total
  const totalGeral = useMemo(
    () =>
      filtrados.reduce(
        (acc, i) => acc + (Number(i.preco) || 0) * (Number(i.quantidade) || 0),
        0
      ),
    [filtrados]
  );

  return (
    <div className="vendas-page">
      {/* Cabeçalho */}
      <div className="title-row">
        <h1>VENDAS</h1>
        <small>
          <strong>{filtrados.length}</strong> produto(s) listados
        </small>
      </div>

      {/* Busca */}
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
        <div className="total-tag">Total: {formatR$(totalGeral)}</div>
      </div>

      {/* Tabela */}
      <div className="table">
        <div className="thead">
          <div className="col img-col"></div>
          <div className="col">Produto</div>
          <div className="col">Código</div>
          <div className="col">Categoria</div>
          <div className="col right">Preço</div>
          <div className="col center">Qtd.</div>
          <div className="col right">Subtotal</div>
          <div className="col action">Editar</div>
          <div className="col toggle-col"></div>
        </div>

        {filtrados.map((i) => {
          const subtotal =
            (Number(i.preco) || 0) * (Number(i.quantidade) || 0);
          return (
            <div className="row" key={i.id}>
              <div className="col img-col">
                <img src={i.img} alt={i.nome} />
              </div>
              <div className="col">{i.nome}</div>
              <div className="col">{i.codigo}</div>
              <div className="col">{i.categoria}</div>
              <div className="col right">{formatR$(i.preco)}</div>
              <div className="col center">{i.quantidade}</div>
              <div className="col right">{formatR$(subtotal)}</div>
              <div className="col action">
                <button className="link">Editar</button>
              </div>
              <div className="col toggle-col">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={i.ativo}
                    onChange={() => toggleAtivo(i.id)}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          );
        })}

        {!filtrados.length && (
          <div className="empty">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  );
}

// Exporta para uso no App.jsx
export default Vendas;
