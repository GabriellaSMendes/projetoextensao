import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  //campos do forms
  const [formData, setFormData] = useState({
    nome_produto: "",
    sabor: "",
    marca: "",
    quantidade: "",
    data_vencimento: "",
    preco_unitario: "",
    id_categoria: "",
  });

  //carregar produtos
  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/estoque/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProdutos(response.data.produtos);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  //categorias
  const carregarCategorias = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/estoque/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategorias(response.data.categorias);
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  };

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
  }, []);

  //filtro
  const filtrados = produtos.filter((p) =>
    `${p.nome_produto} ${p.marca} ${p.nome_categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  //hander
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // salvar produto
  const salvarProduto = async () => {
    try {
      const token = localStorage.getItem("token");

      const body = {
        nome_produto: formData.nome_produto,
        sabor: formData.sabor,
        marca: formData.marca,
        data_vencimento: formData.data_vencimento || null,
        preco_unitario: Number(formData.preco_unitario),
        id_categoria: Number(formData.id_categoria),
        qtdd_inicial: Number(formData.quantidade),
      };

      await api.post("/estoque/produtos", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Produto cadastrado!");

      setModalOpen(false);
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao cadastrar produto.");
    }
  };


  return (
    <div className="estoque-page">

      {/* Título + Botão */}
      <div className="estoque-title-row">

        <div className="estoque-title">
          <h1>PRODUTOS</h1>
          <small><strong>{filtrados.length}</strong> itens listados</small>
        </div>

        <button className="add-btn" onClick={() => setModalOpen(true)}>
          + Adicionar novo
        </button>

      </div>

      {/* Barra de busca */}
      <div className="estoque-search">
        <div className="searchbox">
          <span className="icon">🔍</span>
          <input
            placeholder="Buscar produto"
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
      <div className="estoque-table">
        <div className="thead">
          <div className="col img-col"></div>
          <div className="col">Produto</div>
          <div className="col">Categoria</div>
          <div className="col">Marca</div>
          <div className="col center">Qtd</div>
          <div className="col action">Editar</div>
        </div>

        {loading && <div className="loading">Carregando produtos...</div>}

        {!loading && filtrados.length === 0 && (
          <div className="empty">Nenhum produto encontrado.</div>
        )}

        {filtrados.map((p) => (
          <div className="row" key={p.id_produto}>
            <div className="col img-col">
              {/* Sem imagem ainda */}
              <div className="placeholder-img"></div>
            </div>

            <div className="col">{p.nome_produto}</div>
            <div className="col">{p.nome_categoria}</div>
            <div className="col">{p.marca}</div>
            <div className="col center">{p.qtdd_atual}</div>

            <div className="col action">
              <button className="edit-btn">Editar</button>
            </div>
          </div>
        ))}
      </div>

      {/* model - forms p cadastro de novo produto*/}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2>Novo Produto</h2>

            <div className="form-grid">

              <div>
                <label>Nome do produto</label>
                <input name="nome_produto" onChange={handleChange} />
              </div>

              <div>
                <label>Sabor</label>
                <input name="sabor" onChange={handleChange} />
              </div>

              <div>
                <label>Marca</label>
                <input name="marca" onChange={handleChange} />
              </div>

              <div>
                <label>Quantidade inicial</label>
                <input type="number" name="quantidade" onChange={handleChange} />
              </div>

              <div>
                <label>Preço unitário</label>
                <input type="number" step="0.01" name="preco_unitario" onChange={handleChange} />
              </div>

              <div>
                <label>Data de vencimento</label>
                <input type="date" name="data_vencimento" onChange={handleChange} />
              </div>

              <div>
                <label>Categoria</label>
                <select name="id_categoria" onChange={handleChange}>
                  <option value="">Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nome_categoria}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="save-btn" onClick={salvarProduto}>Salvar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Estoque;
