// Importa os hooks do React
import { useMemo, useState } from "react";
// Importa o arquivo de estilos
import "./style.css";

// ===== Componente principal Estoque =====
function Estoque() {
  // Lista de produtos mockada (pode ser substituída pela API futuramente)
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

  // Campo de busca
  const [busca, setBusca] = useState("");

  // Filtra itens conforme a busca
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return itens;
    return itens.filter((i) =>
      `${i.nome} ${i.codigo} ${i.categoria} ${i.descricao}`
        .toLowerCase()
        .includes(q)
    );
  }, [itens, busca]);

  // Alterna ativo/inativo
  const toggleAtivo = (id) => {
    setItens((arr) =>
      arr.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i))
    );
  };

  return (
    <div className="estoque-page">
      {/* Título */}
      <div className="title-row">
        <h1>PRODUTOS</h1>
        <small>
          <strong>{filtrados.length}</strong> item(s) cadastrados
        </small>
      </div>

      {/* Barra de busca e botão de filtro */}
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

        <button className="filter-btn">
          Filtrar por <span className="icon">🧪</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="table">
        <div className="thead">
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
          <div className="row" key={i.id}>
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
          <div className="empty">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  );
}

// Exporta o componente para uso no App.jsx
export default Estoque;
