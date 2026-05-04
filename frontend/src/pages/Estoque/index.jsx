import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import "./style.css";


function normalizarDataISO(data) {
  if (!data) return "";
  return data.split("T")[0];
}

function formatarDataBR(data) {
  if (!data) return "-";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function CampoSugestao({ label, name, value, onChange, options, placeholder }) {
  const [aberto, setAberto] = useState(false);

  const opcoesFiltradas = options
    .filter((opcao) =>
      opcao.toLowerCase().includes((value || "").toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b));

  const atualizarValor = (novoValor) => {
    onChange({
      target: {
        name,
        value: novoValor
      }
    });
  };

  const selecionarOpcao = (opcao) => {
    atualizarValor(opcao);
    setAberto(false);
  };

  return (
    <div className="campo-sugestao">
      <label>{label}</label>

      <div className={`campo-sugestao-wrapper ${aberto ? "aberto" : ""}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            atualizarValor(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => {
            setTimeout(() => setAberto(false), 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          name={`no-autocomplete-${name}`}
          className="campo-sugestao-input"
        />

        <button
          type="button"
          className="campo-sugestao-seta"
          onMouseDown={(e) => {
            e.preventDefault();
            setAberto(!aberto);
          }}
        >
          ▾
        </button>
      </div>

      {aberto && (
        <div className="sugestao-lista">
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((opcao) => (
              <button
                type="button"
                key={opcao}
                className="sugestao-item"
                onMouseDown={() => selecionarOpcao(opcao)}
              >
                {opcao}
              </button>
            ))
          ) : (
            <div className="sugestao-vazia">
              Novo valor: <strong>{value}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Estoque() {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const [filtroSabor, setFiltroSabor] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const carregarProdutos = async () => {

    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/estoque/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProdutos(response.data.produtos.map(p => ({
        ...p, data_vencimento: p.data_vencimento ? normalizarDataISO(p.data_vencimento) : ""
      })));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const carregarCategorias = async () => {

    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/estoque/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategorias(response.data.categorias);
    } catch (err) { console.error(err); }
  };

  const carregarFornecedores = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/fornecedores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFornecedores(response.data.fornecedores || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
    carregarFornecedores(); // 👈 ADD AQUI
  }, []);

  const toggleFiltro = (lista, item, setLista) => {

    setLista(lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]);
  };

  const filtrados = useMemo(() => {
    return produtos
      .filter((p) => {
        const termo = busca.toLowerCase();

        const atendeBusca =
          p.nome_produto?.toLowerCase().includes(termo) ||
          p.marca?.toLowerCase().includes(termo) ||
          p.sabor?.toLowerCase().includes(termo) ||
          p.nome_fornecedor?.toLowerCase().includes(termo);

        const atendeCategoria =
          filtroCategoria.length === 0 ||
          filtroCategoria.includes(p.nome_categoria);

        const atendeSabor =
          !filtroSabor ||
          p.sabor?.toLowerCase().includes(filtroSabor.toLowerCase());

        return atendeBusca && atendeCategoria && atendeSabor;
      })
      .sort((a, b) => {
        if (a.ativo === b.ativo) {
          return a.nome_produto.localeCompare(b.nome_produto);
        }

        return a.ativo ? -1 : 1;
      });
  }, [produtos, busca, filtroCategoria, filtroSabor]);

  const [formData, setFormData] = useState({
    nome_produto: "",
    sabor: "",
    marca: "",
    preco_unitario: "",
    categoria_nome: "",
    fornecedor_nome: "",
    quantidade: "",
    custo_unitario_lote: "",
    numero_lote: "",
    data_vencimento: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  function dataEhValida(data) {
    if (!data) return true; // permite vazio (igual backend)

    const hoje = new Date();
    const vencimento = new Date(data);

    hoje.setHours(0, 0, 0, 0);
    vencimento.setHours(0, 0, 0, 0);

    return vencimento >= hoje;
  }

  const nomesProdutosExistentes = [...new Set(
    produtos.map((p) => p.nome_produto).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const saboresExistentes = [...new Set(
    produtos.map((p) => p.sabor).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const marcasExistentes = [...new Set(
    produtos.map((p) => p.marca).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const categoriasOrdenadas = [...categorias].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  const fornecedoresOrdenados = [...fornecedores].sort((a, b) =>
    a.razao_social.localeCompare(b.razao_social)
  );

  async function obterOuCriarCategoria(nomeCategoria) {
    const nome = nomeCategoria.trim();

    const categoriaExistente = categorias.find(
      (c) => c.nome.toLowerCase() === nome.toLowerCase()
    );

    if (categoriaExistente) {
      return categoriaExistente.id_categoria;
    }

    const token = localStorage.getItem("token");

    const resp = await api.post(
      "/estoque/categorias",
      { nome },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    await carregarCategorias();

    return resp.data.id_categoria;
  }

  async function obterOuCriarFornecedor(nomeFornecedor) {
    const nome = nomeFornecedor.trim();

    const fornecedorExistente = fornecedores.find(
      (f) => f.razao_social.toLowerCase() === nome.toLowerCase()
    );

    if (fornecedorExistente) {
      return fornecedorExistente.id_fornecedor;
    }

    const token = localStorage.getItem("token");

    const resp = await api.post(
      "/fornecedores",
      { razao_social: nome },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    await carregarFornecedores();

    return resp.data.id_fornecedor;
  }

  const salvarProduto = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!formData.nome_produto.trim()) {
        alert("Informe o nome do produto.");
        return;
      }

      if (!formData.categoria_nome.trim()) {
        alert("Informe a categoria.");
        return;
      }

      if (!formData.fornecedor_nome.trim()) {
        alert("Informe o fornecedor da entrada inicial.");
        return;
      }

      if (!formData.quantidade || Number(formData.quantidade) <= 0) {
        alert("Informe uma quantidade inicial válida.");
        return;
      }

      if (!formData.preco_unitario) {
        alert("Informe o custo unitário padrão.");
        return;
      }

      if (!dataEhValida(formData.data_vencimento)) {
        alert("Produto vencido não pode ser cadastrado.");
        return;
      }

      const idCategoria = await obterOuCriarCategoria(formData.categoria_nome);
      const idFornecedor = await obterOuCriarFornecedor(formData.fornecedor_nome);

      await api.post(
        "/estoque/produtos",
        {
          nome_produto: formData.nome_produto,
          sabor: formData.sabor,
          marca: formData.marca,
          preco_unitario: Number(formData.preco_unitario.replace(",", ".")),
          id_categoria: idCategoria,

          id_fornecedor: idFornecedor,
          qtdd_entrada: Number(formData.quantidade),
          valor_unitario: formData.custo_unitario_lote
            ? Number(formData.custo_unitario_lote.replace(",", "."))
            : Number(formData.preco_unitario.replace(",", ".")),
          numero_lote: formData.numero_lote || null,
          data_vencimento: formData.data_vencimento || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      carregarProdutos();

      setModalOpen(false);

      setFormData({
        nome_produto: "",
        sabor: "",
        marca: "",
        preco_unitario: "",
        categoria_nome: "",
        fornecedor_nome: "",
        quantidade: "",
        custo_unitario_lote: "",
        numero_lote: "",
        data_vencimento: ""
      });
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.erro ||
        error.response?.data?.detalhes ||
        "Erro ao salvar produto."
      );
    }
  };

  const abrirDetalheProduto = (idProduto) => {
    window.open(`/estoque/produtos/${idProduto}`, "_blank");
  };

  const alterarStatusProduto = async (produto) => {
    const acao = produto.ativo ? "ocultar" : "reativar";

    const confirmar = window.confirm(
      `Deseja ${acao} o produto "${produto.nome_produto}"?`
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/estoque/produtos/${produto.id_produto}/status`,
        {
          ativo: !produto.ativo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      carregarProdutos();
    } catch (error) {
      console.error(error);
      alert(`Erro ao ${acao} produto.`);
    }
  };

  return (

    <div className="estoque-container">
      <aside className={`filtros-avancados ${filtrosAbertos ? "aberto" : "fechado"}`}>
        <div className="filtros-header">
          <h2>Filtros Avançados</h2>
          <button className="close-btn" onClick={() => setFiltrosAbertos(false)}>×</button>
        </div>

        <div className="filtro-scroll-area">
          <div className="filtro-secao">
            <label>Pesquisar</label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Produto ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="filtro-secao">
            <label>Categorias</label>
            <div className="checkbox-list">
              {categorias.map((c) => (
                <div key={c.id_categoria} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`cat-${c.id_categoria}`}
                    checked={filtroCategoria.includes(c.nome)}
                    onChange={() => toggleFiltro(filtroCategoria, c.nome, setFiltroCategoria)}
                  />

                  <label htmlFor={`cat-${c.id_categoria}`}>
                    {c.nome} <span>({produtos.filter(p => p.nome === c.nome).length})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>


          <div className="filtro-secao">
            <label>Sabor</label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Digite o sabor..."
              value={filtroSabor}
              onChange={(e) => setFiltroSabor(e.target.value)}
            />
          </div>
        </div>

        <div className="filtros-actions">
          <button className="btn-limpar" onClick={() => { setFiltroCategoria([]); setFiltroSabor(""); setBusca(""); }}>
            Limpar Filtros
          </button>

          <button className="btn-aplicar" onClick={() => setFiltrosAbertos(false)}>
            Aplicar Filtros
          </button>
        </div>
      </aside>

      <main className="estoque-main">
        <div className="estoque-title-row">
          <div className="estoque-title">
            <h1>PRODUTOS</h1>
            <small><strong>{filtrados.length}</strong> itens listados</small>
          </div>

          <div className="actions-right">
            <button
              className={`filter-btn-toggle ${filtrosAbertos ? 'active' : ''}`}
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              {filtrosAbertos ? "Ocultar Filtros" : "Filtrar"}
            </button>

            <button
              className="add-btn"
              onClick={() => {
                setProdutoEditando(null);

                setFormData({
                  nome_produto: "",
                  sabor: "",
                  marca: "",
                  preco_unitario: "",
                  categoria_nome: "",
                  fornecedor_nome: "",
                  quantidade: "",
                  custo_unitario_lote: "",
                  numero_lote: "",
                  data_vencimento: ""
                });

                setModalOpen(true);
              }}
            >
              + Adicionar novo
            </button>
          </div>
        </div>

        <div className="estoque-table">
          <div className="thead">
            <div className="col produto-col">Produto</div>
            <div className="col">Categoria</div>
            <div className="col">Sabor</div>
            <div className="col center">Saldo atual</div>
            <div className="col">Próximo da validade</div>
            <div className="col">Status</div>
            <div className="col">Último fornecedor</div>
            <div className="col action">Ações</div>
          </div>

          {loading ? (
            <div className="loading">Carregando produtos...</div>
          ) : filtrados.length === 0 ? (
            <div className="empty">Nenhum produto encontrado.</div>
          ) : (
            filtrados.map((p) => (
              <div
                className={`row ${p.ativo === false ? "row-inativo" : ""}`}
                key={p.id_produto}
              >
                <div className="col produto-col">
                  <strong>{p.nome_produto}</strong>
                  <span>{p.marca || "-"}</span>
                </div>

                <div className="col">{p.nome_categoria || "-"}</div>
                <div className="col">{p.sabor || "-"}</div>
                <div className="col center saldo-col">{p.qtdd_atual}</div>

                <div className="col">
                  {p.proxima_validade ? formatarDataBR(p.proxima_validade) : "-"}
                </div>

                <div className="col">
                  {p.lotes_vencidos > 0 ? (
                    <span className="status-badge vencido">
                      {p.lotes_vencidos} vencido(s)
                    </span>
                  ) : p.lotes_proximos_validade > 0 ? (
                    <span className="status-badge alerta">
                      {p.lotes_proximos_validade} próximo(s)
                    </span>
                  ) : (
                    <span className="status-badge ok">OK</span>
                  )}
                </div>

                <div className="col">{p.nome_fornecedor || "-"}</div>

                <div className="col action">
                  <button
                    className="edit-btn"
                    onClick={() => abrirDetalheProduto(p.id_produto)}
                  >
                    Detalhes
                  </button>

                  <button
                    className={p.ativo ? "hide-btn" : "restore-btn"}
                    onClick={() => alterarStatusProduto(p)}
                  >
                    {p.ativo ? "Ocultar" : "Reativar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>


      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box produto-modal-box">

            <div className="modal-header-produto">
              <h2>Novo Produto</h2>

              <button
                type="button"
                className="modal-close-x"
                onClick={() => {
                  setModalOpen(false);
                  setProdutoEditando(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-section-title">Dados do produto</div>

            <div className="form-grid">
              <CampoSugestao
                label="Nome do produto"
                name="nome_produto"
                value={formData.nome_produto}
                onChange={handleChange}
                options={nomesProdutosExistentes}
                placeholder="Digite ou selecione..."
              />

              <CampoSugestao
                label="Categoria"
                name="categoria_nome"
                value={formData.categoria_nome}
                onChange={handleChange}
                options={categoriasOrdenadas.map((c) => c.nome)}
                placeholder="Digite ou selecione..."
              />

              <CampoSugestao
                label="Sabor"
                name="sabor"
                value={formData.sabor}
                onChange={handleChange}
                options={saboresExistentes}
                placeholder="Digite ou selecione..."
              />

              <CampoSugestao
                label="Marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                options={marcasExistentes}
                placeholder="Digite ou selecione..."
              />

              <div>
                <label>Custo unitário padrão</label>
                <input
                  type="text"
                  name="preco_unitario"
                  value={formData.preco_unitario}
                  onChange={handleChange}
                  placeholder="Ex: 120.00"
                />
              </div>
            </div>

            <div className="modal-section-title">Entrada inicial de estoque</div>

            <div className="form-grid">
              <CampoSugestao
                label="Fornecedor"
                name="fornecedor_nome"
                value={formData.fornecedor_nome}
                onChange={handleChange}
                options={fornecedoresOrdenados.map((f) => f.razao_social)}
                placeholder="Digite ou selecione..."
              />

              <div>
                <label>Número do lote</label>
                <input
                  type="text"
                  name="numero_lote"
                  value={formData.numero_lote}
                  onChange={handleChange}
                  placeholder="Ex: LOTE-2026-001"
                />
              </div>

              <div>
                <label>Quantidade inicial</label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div>
                <label>Custo unitário do lote</label>
                <input
                  type="text"
                  name="custo_unitario_lote"
                  value={formData.custo_unitario_lote}
                  onChange={handleChange}
                  placeholder="Se vazio, usa o custo padrão"
                />
              </div>

              <div>
                <label>Data de vencimento do lote</label>
                <input
                  type="date"
                  name="data_vencimento"
                  value={formData.data_vencimento}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setProdutoEditando(null);
                }}
              >
                Cancelar
              </button>

              <button className="save-btn" onClick={salvarProduto}>
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