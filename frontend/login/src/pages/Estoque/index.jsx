import { useMemo, useState } from "react";
import "./style.css";

export default function Estoque() {
  // Mock simples (você pode trocar depois por chamada à API)
  const [itens, setItens] = useState([
    {
      id: 1,
      img: "https://via.placeholder.com/40x60?text=🍦",
      nome: "Casquinha de sorvete",
      codigo: "XXXXXXX",
      categoria: "Casquinhas e Wafers",
      descricao: "Descrição",
      estoque: 50,
      ativo: true,
    },
  ]);

  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return itens;
    return itens.filter((i) =>
      `${i.nome} ${i.codigo} ${i.categoria} ${i.descricao}`
        .toLowerCase()
        .includes(q)
    );
  }, [itens, busca]);

  const toggleAtivo = (id) => {
    setItens((arr) =>
      arr.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i))
    );
  };

  return (
    <div className="estoque-page">
      {/* Top bar / logo + menu */}
      <header className="tm-header">
        <div className="tm-logo">🌞 Tropical <b>Mix</b></div>
        <nav className="tm-menu">
          <a href="#" className="muted">Início</a>
          <a href="#" className="muted">Análise</a>
          <a href="#" className="active">Estoque</a>
          <a href="#" className="muted">Vendas</a>
          <a href="#" className="muted">Fornecedores</a>
        </nav>
        <div className="tm-account">Minha conta 🔎</div>
      </header>

      <main className="tm-main">
        {/* Título + total */}
        <div className="tm-title-row">
          <h1>PRODUTOS</h1>
          <small>
            <strong>{filtrados.length}</strong> item(s) cadastrados
          </small>
        </div>

        {/* Barra de busca e filtro */}
        <div className="tm-search-row">
          <div className="tm-search">
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

          <button className="tm-filter">
            Filtrar por <span className="icon">🧪</span>
          </button>
        </div>

        {/* Tabela básica */}
        <div className="tm-table">
          <div className="tm-thead">
            <div className="col img-col"></div>
            <div className="col">Produto</div>
            <div className="col">Código</div>
            <div className="col">Categoria</div>
            <div className="col">Descrição</div>
            <div className="col estq">Estoque</div>
            <div className="col action">Editar</div>
            <div className="col toggle-col"></div>
          </div>

          {filtrados.map((i) => (
            <div className="tm-row" key={i.id}>
              <div className="col img-col">
                <img src={i.img} alt={i.nome} />
              </div>
              <div className="col">{i.nome}</div>
              <div className="col">{i.codigo}</div>
              <div className="col">{i.categoria}</div>
              <div className="col">{i.descricao}</div>
              <div className="col estq">{i.estoque}</div>
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
          ))}

          {!filtrados.length && (
            <div className="tm-empty">Nenhum produto encontrado.</div>
          )}
        </div>
      </main>
    </div>
  );
}
