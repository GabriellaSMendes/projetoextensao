// Importa hooks do React para estado e memorização
import { useMemo, useState } from "react";
// Importa o CSS específico desta página
import "./style.css";

// Componente principal da página de Estoque
export default function Estoque() {
  // ===== Mock inicial de itens (substitua por API depois) =====
  const [itens, setItens] = useState([
    {
      id: 1,
      img: "https://via.placeholder.com/40x60?text=🍦",
      nome: "Casquinha de sorvete",
      codigo: "XXXXXXX",
      categoria: "Casquinhas e Wafers",
      descricao: "Descrição",
      estoque: 50,
      ativo: true, // controle do toggle
    },
  ]);

  // Estado do campo de busca
  const [busca, setBusca] = useState("");

  // Filtragem local (não faz request)
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return itens;
    return itens.filter((i) =>
      `${i.nome} ${i.codigo} ${i.categoria} ${i.descricao}`
        .toLowerCase()
        .includes(q)
    );
  }, [itens, busca]);

  // Alterna o status "ativo" do item (toggle)
  const toggleAtivo = (id) => {
    setItens((arr) => arr.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i)));
  };

  return (
    <div className="estoque-page">
      {/* Título e contagem simples */}
      <div className="title-row">
        <h1>PRODUTOS</h1>
        <small>
          <strong>{filtrados.length}</strong> item(s) cadastrados
        </small>
      </div>

      {/* Barra de busca + botão "Filtrar por" (somente visual) */}
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

      {/* Tabela minimalista */}
      <div className="table">
        {/* Cabeçalho */}
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

        {/* Linhas de dados */}
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
              {/* Toggle custom simples */}
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

        {/* Estado vazio */}
        {!filtrados.length && (
          <div className="empty">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  );
}
