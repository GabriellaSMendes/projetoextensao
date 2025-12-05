import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

// normaliza data para o input date
function normalizarDataISO(data) {
  if (!data) return "";
  return data.split("T")[0]; // remove T00:00:00 se existir
}

function formatarDataBR(data) {
  if (!data) return "-";

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);

  //info de forncedores
  const carregarFornecedores = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get("/fornecedores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFornecedores(resp.data.fornecedores);
    } catch (err) {
      console.error("Erro ao carregar fornecedores", err);
    }
  };

  //campos do forms
  const [formData, setFormData] = useState({
    nome_produto: "",
    sabor: "",
    marca: "",
    quantidade: "",
    data_vencimento: "",
    preco_unitario: "",
    id_categoria: "",
    id_fornecedor: "",
  });

  //carregar produtos
  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/estoque/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const produtosNormalizados = response.data.produtos.map(p => ({
        ...p,
        data_vencimento: p.data_vencimento ? normalizarDataISO(p.data_vencimento) : ""
      }));

      setProdutos(produtosNormalizados);

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
    carregarFornecedores();
  }, []);

  //filtro
  const filtrados = produtos.filter((p) =>
    `${p.nome_produto} ${p.marca} ${p.nome} ${p.nome_fornecedor}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  //handler de inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //atualizar o produto (botão editar)
  const atualizarProduto = async () => {
    try {
      const token = localStorage.getItem("token");

      const body = {
        nome_produto: formData.nome_produto,
        sabor: formData.sabor,
        marca: formData.marca,
        preco_unitario: Number(formData.preco_unitario),
        id_categoria: Number(formData.id_categoria),
        data_vencimento: formData.data_vencimento || null,
      };

      await api.put(`/estoque/produtos/${produtoEditando.id_produto}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalOpen(false);
      carregarProdutos();
      setProdutoEditando(null);

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar produto");
    }
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
        id_fornecedor: formData.id_fornecedor ? Number(formData.id_fornecedor) : null,
      };

      await api.post("/estoque/produtos", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalOpen(false);
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao cadastrar produto.");
    }
  };

  const abastecerProduto = async (produto) => {
    try {
      const token = localStorage.getItem("token");

      const body = {
        id_produto: produto.id_produto,
        qtdd_recebida: Number(formData.quantidade),
        id_fornecedor: Number(formData.id_fornecedor), // <----- NOVO
        valor_unitario: Number(formData.preco_unitario) || null
      };

      await api.post("/estoque/abastecer", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      carregarProdutos();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao abastecer o produto.");
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
        <button className="add-btn" onClick={() => {
          setProdutoEditando(null);
          setFormData({
            nome_produto: "",
            sabor: "",
            marca: "",
            quantidade: "",
            data_vencimento: "",
            preco_unitario: "",
            id_categoria: "",
            id_fornecedor: "",
          });
          setModalOpen(true);
        }}>
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
          <div className="col">Sabor</div>
          <div className="col">Marca</div>
          <div className="col">Validade</div>
          <div className="col center">Qtd.</div>
          <div className="col">Fornecedor</div>
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
            <div className="col">{p.nome}</div>
            <div className="col">{p.sabor}</div>
            <div className="col">{p.marca}</div>
            <div className="col">
              {formatarDataBR(p.data_vencimento)}
            </div>
            <div className="col center">{p.qtdd_atual}</div>
            <div className="col">{p.nome_fornecedor || "-"}</div>
            <div className="col action">
              <button
                className="edit-btn"
                onClick={() => {
                  setProdutoEditando(p);
                  setFormData({
                    nome_produto: p.nome_produto,
                    sabor: p.sabor || "",
                    marca: p.marca || "",
                    quantidade: p.qtdd_atual,
                    data_vencimento: normalizarDataISO(p.data_vencimento),
                    preco_unitario: p.preco_unitario,
                    id_categoria: p.id_categoria || ""
                  });
                  setModalOpen(true);
                }}
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* modal - forms p cadastro/edição */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">

            {/* título dinâmico */}
            <h2>{produtoEditando ? "Editar Produto" : "Novo Produto"}</h2>
            <div className="form-grid">

              <div>
                <label>Nome do produto</label>
                <input
                  name="nome_produto"
                  value={formData.nome_produto}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Sabor</label>
                <input
                  name="sabor"
                  value={formData.sabor}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Marca</label>
                <input
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Quantidade</label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  disabled={produtoEditando !== null}
                  className={produtoEditando ? "input-disabled" : ""}
                />

              </div>

              <div>
                <label>Preço unitário</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco_unitario"
                  value={formData.preco_unitario}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Fornecedor</label>
                <select
                  name="id_fornecedor"
                  value={formData.id_fornecedor}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id_fornecedor} value={f.id_fornecedor}>
                      {f.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Categoria</label>
                <select
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Data de vencimento</label>
                <input
                  type="date"
                  name="data_vencimento"
                  value={formData.data_vencimento}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>

              <button
                className="save-btn"
                onClick={() => {
                  if (produtoEditando) {
                    atualizarProduto();
                  } else {

                    const produtoExistente = produtos.find(p =>
                      p.nome_produto.toLowerCase() === formData.nome_produto.toLowerCase() &&
                      (p.marca || "").toLowerCase() === (formData.marca || "").toLowerCase() &&
                      (p.sabor || "").toLowerCase() === (formData.sabor || "").toLowerCase() &&
                      (normalizarDataISO(p.data_vencimento) || "") === (formData.data_vencimento || "") &&
                      (String(p.id_categoria) === String(formData.id_categoria))
                    );

                    if (produtoExistente) {
                      abastecerProduto(produtoExistente);
                    } else {
                      salvarProduto();
                    }
                  }
                }}
              >
                Salvar
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Estoque;
