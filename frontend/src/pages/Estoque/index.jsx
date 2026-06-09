import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Notification from "../../components/Notification";
import ConfirmModal from "../../components/ConfirmModal";
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

const LIMITE_ESTOQUE_BAIXO = 20;


function produtoComEstoqueBaixo(produto) {
  return Number(produto.qtdd_atual) > 0 && Number(produto.qtdd_atual) <= LIMITE_ESTOQUE_BAIXO;
}

const LIMITE_PROXIMO_VENCIMENTO = 45;

function getValidadeProduto(produto) {
  return produto.validade_lote || produto.data_vencimento || "";
}

function diasAteVencimento(produto) {
  const validade = getValidadeProduto(produto);

  if (!validade) return null;

  const hoje = new Date();
  const vencimento = new Date(`${validade}T00:00:00`);

  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);

  const diffMs = vencimento - hoje;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function produtoVencido(produto) {
  const dias = diasAteVencimento(produto);
  return dias !== null && dias < 0;
}

function produtoProximoValidade(produto) {
  const dias = diasAteVencimento(produto);
  return dias !== null && dias >= 0 && dias <= LIMITE_PROXIMO_VENCIMENTO;
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
  const navigate = useNavigate();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const [filtroSabor, setFiltroSabor] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroFornecedor, setFiltroFornecedor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoDetalhe, setProdutoDetalhe] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    aberto: false,
    produto: null
  });
  const [notification, setNotification] = useState({
    message: "",
    type: "success"
  });
  function mostrarNotificacao(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3500);
  }
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

  const categoriasFiltro = [...new Set(
    produtos.map((p) => p.nome_categoria).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const saboresFiltro = [...new Set(
    produtos.map((p) => p.sabor).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const marcasFiltro = [...new Set(
    produtos.map((p) => p.marca).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const fornecedoresFiltro = [...new Set(
    produtos.map((p) => p.nome_fornecedor).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const filtrados = useMemo(() => {
    return produtos
      .filter((p) => {
        const termo = busca.toLowerCase().trim();

        const atendeBusca =
          !termo ||
          p.nome_produto?.toLowerCase().includes(termo) ||
          p.marca?.toLowerCase().includes(termo) ||
          p.sabor?.toLowerCase().includes(termo) ||
          p.nome_categoria?.toLowerCase().includes(termo) ||
          p.nome_fornecedor?.toLowerCase().includes(termo);

        const atendeCategoria =
          filtroCategoria.length === 0 ||
          filtroCategoria.includes(p.nome_categoria);

        const atendeSabor =
          !filtroSabor ||
          p.sabor?.toLowerCase().includes(filtroSabor.toLowerCase());

        const atendeMarca =
          !filtroMarca ||
          p.marca?.toLowerCase().includes(filtroMarca.toLowerCase());

        const atendeFornecedor =
          !filtroFornecedor ||
          p.nome_fornecedor?.toLowerCase().includes(filtroFornecedor.toLowerCase());

        const statusProduto = [];

        if (produtoVencido(p)) {
          statusProduto.push("vencido");
        }

        if (!produtoVencido(p) && produtoProximoValidade(p)) {
          statusProduto.push("proximo_validade");
        }

        if (produtoComEstoqueBaixo(p)) {
          statusProduto.push("estoque_baixo");
        }

        if (
          !produtoVencido(p) &&
          !produtoProximoValidade(p) &&
          !produtoComEstoqueBaixo(p)
        ) {
          statusProduto.push("ok");
        }

        const atendeStatus =
          filtroStatus.length === 0 ||
          filtroStatus.some((status) => statusProduto.includes(status));
        return (
          atendeBusca &&
          atendeCategoria &&
          atendeSabor &&
          atendeMarca &&
          atendeFornecedor &&
          atendeStatus
        );
      })
      .sort((a, b) => {
        if (a.ativo === b.ativo) {
          return a.nome_produto.localeCompare(b.nome_produto);
        }

        return a.ativo ? -1 : 1;
      });
  }, [
    produtos,
    busca,
    filtroCategoria,
    filtroSabor,
    filtroMarca,
    filtroFornecedor,
    filtroStatus
  ]);

  const [formData, setFormData] = useState({
    nome_produto: "",
    sabor: "",
    marca: "",
    custo_unitario: "",
    preco_unitario: "",
    categoria_nome: "",
    fornecedor_nome: "",
    quantidade: "",
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
        mostrarNotificacao("Informe o nome do produto.", "warning");
        return;
      }

      if (!formData.categoria_nome.trim()) {
        mostrarNotificacao("Informe a categoria.", "warning");
        return;
      }

      if (!formData.fornecedor_nome.trim()) {
        mostrarNotificacao("Informe o fornecedor da entrada inicial.", "warning");
        return;
      }

      if (!formData.quantidade || Number(formData.quantidade) <= 0) {
        mostrarNotificacao("Informe uma quantidade inicial válida.", "warning");
        return;
      }

      if (!formData.custo_unitario) {
        mostrarNotificacao("Informe o custo unitário.", "warning");
        return;
      }

      if (!formData.preco_unitario) {
        mostrarNotificacao("Informe o preço de venda.", "warning");
        return;
      }

      if (!dataEhValida(formData.data_vencimento)) {
        mostrarNotificacao("Produto vencido não pode ser cadastrado.", "warning");
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
          custo_unitario: Number(formData.custo_unitario.replace(",", ".")),
          preco_unitario: Number(formData.preco_unitario.replace(",", ".")),
          id_categoria: idCategoria,
          id_fornecedor: idFornecedor,
          qtdd_entrada: Number(formData.quantidade),
          valor_unitario: Number(formData.custo_unitario.replace(",", ".")),
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
        custo_unitario: "",
        preco_unitario: "",
        categoria_nome: "",
        fornecedor_nome: "",
        quantidade: "",
        custo_unitario_lote: "",
        numero_lote: "",
        data_vencimento: ""
      });

      mostrarNotificacao("Produto salvo com sucesso.", "success");

    } catch (error) {
      console.error(error);
      mostrarNotificacao(
        error.response?.data?.erro ||
        error.response?.data?.detalhes ||
        "Erro ao salvar produto.",
        "error"
      );
    }
  };

  const abrirDetalheProduto = (produto) => {
    navigate(`/estoque/produtos/${produto.id_produto}`);
  };

  const abrirConfirmacaoStatusProduto = (produto) => {
    setConfirmModal({
      aberto: true,
      produto
    });
  };

  const alterarStatusProduto = async () => {
    const produto = confirmModal.produto;
    if (!produto) return;

    const acao = produto.ativo ? "ocultar" : "reativar";

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

      setConfirmModal({
        aberto: false,
        produto: null
      });

      carregarProdutos();

      mostrarNotificacao(
        produto.ativo
          ? "Produto ocultado com sucesso."
          : "Produto reativado com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(error);

      mostrarNotificacao(`Erro ao ${acao} produto.`, "error");
    }
  };

  return (

    <div className="estoque-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
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
              placeholder="Produto, marca, sabor, categoria ou fornecedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="filtro-secao">
            <label>Status</label>
            <div className="checkbox-list">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="status-vencido"
                  checked={filtroStatus.includes("vencido")}
                  onChange={() =>
                    toggleFiltro(filtroStatus, "vencido", setFiltroStatus)
                  }
                />
                <label htmlFor="status-vencido">Vencido</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="status-proximo"
                  checked={filtroStatus.includes("proximo_validade")}
                  onChange={() =>
                    toggleFiltro(filtroStatus, "proximo_validade", setFiltroStatus)
                  }
                />
                <label htmlFor="status-proximo">Próximo da validade</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="status-baixo"
                  checked={filtroStatus.includes("estoque_baixo")}
                  onChange={() =>
                    toggleFiltro(filtroStatus, "estoque_baixo", setFiltroStatus)
                  }
                />
                <label htmlFor="status-baixo">Estoque baixo</label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="status-ok"
                  checked={filtroStatus.includes("ok")}
                  onChange={() =>
                    toggleFiltro(filtroStatus, "ok", setFiltroStatus)
                  }
                />
                <label htmlFor="status-ok">OK</label>
              </div>
            </div>
          </div>

          <div className="filtro-secao">
            <label>Categorias</label>
            <div className="checkbox-list">
              {categoriasFiltro.map((categoria) => (
                <div key={categoria} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`cat-${categoria}`}
                    checked={filtroCategoria.includes(categoria)}
                    onChange={() =>
                      toggleFiltro(filtroCategoria, categoria, setFiltroCategoria)
                    }
                  />

                  <label htmlFor={`cat-${categoria}`}>
                    {categoria}
                    <span>
                      ({produtos.filter((p) => p.nome_categoria === categoria).length})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filtro-secao">
            <CampoSugestao
              label="Sabor"
              name="filtroSabor"
              value={filtroSabor}
              onChange={(e) => setFiltroSabor(e.target.value)}
              options={saboresFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestao
              label="Marca"
              name="filtroMarca"
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
              options={marcasFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>

          <div className="filtro-secao">
            <CampoSugestao
              label="Fornecedor"
              name="filtroFornecedor"
              value={filtroFornecedor}
              onChange={(e) => setFiltroFornecedor(e.target.value)}
              options={fornecedoresFiltro}
              placeholder="Digite ou selecione..."
            />
          </div>
        </div>

        <div className="filtros-actions">
          <button
            className="btn-limpar"
            onClick={() => {
              setFiltroCategoria([]);
              setFiltroSabor("");
              setFiltroMarca("");
              setFiltroFornecedor("");
              setFiltroStatus([]);
              setBusca("");
            }}
          >
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
                  custo_unitario: "",
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
            <div className="col center">Qtd. atual</div>
            <div className="col">Próxima validade</div>
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
                className={`row 
                    ${p.ativo === false ? "row-inativo" : ""} 
                    ${produtoComEstoqueBaixo(p) ? "row-estoque-baixo" : ""}
                  `}
                key={p.id_produto}
              >
                <div className="col produto-col">
                  <div className="produto-nome-linha">
                    <strong>{p.nome_produto}</strong>

                    {produtoComEstoqueBaixo(p) && (
                      <span className="estoque-badge baixo">estoque baixo</span>
                    )}
                  </div>

                  <span>{p.marca || "-"}</span>
                </div>

                <div className="col">{p.nome_categoria || "-"}</div>
                <div className="col">{p.sabor || "-"}</div>
                <div className="col center saldo-col">{p.qtdd_atual}</div>

                <div className="col">
                  {getValidadeProduto(p) ? formatarDataBR(getValidadeProduto(p)) : "-"}
                </div>

                <div className="col">
                  {produtoVencido(p) ? (
                    <span className="status-badge vencido">Vencido</span>
                  ) : produtoProximoValidade(p) ? (
                    <span className="status-badge alerta">
                      Vence em {diasAteVencimento(p)} dia(s)
                    </span>
                  ) : produtoComEstoqueBaixo(p) ? (
                    <span className="status-badge alerta">Estoque baixo</span>
                  ) : (
                    <span className="status-badge ok">OK</span>
                  )}
                </div>

                <div className="col">{p.nome_fornecedor || "-"}</div>

                <div className="col action">
                  <button
                    className="edit-btn"
                    onClick={() => abrirDetalheProduto(p)}
                  >
                    Detalhes
                  </button>

                  <button
                    className={p.ativo ? "hide-btn" : "restore-btn"}
                    onClick={() => abrirConfirmacaoStatusProduto(p)}
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
        <div className="produto-modal-overlay">
          <div className="produto-modal-card">
            <div className="produto-modal-header">
              <div>
                <h2>Novo Produto</h2>
                <p>
                  Cadastre os dados do produto e registre a entrada inicial no estoque.
                </p>
              </div>

              <button
                type="button"
                className="produto-modal-close"
                onClick={() => {
                  setModalOpen(false);
                  setProdutoEditando(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="produto-modal-section-title">Dados do produto</div>

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
                <label>Custo unitário</label>
                <input
                  type="text"
                  name="custo_unitario"
                  value={formData.custo_unitario}
                  onChange={handleChange}
                  placeholder="Ex: 80.00"
                />
              </div>

              <div>
                <label>Preço de venda</label>
                <input
                  type="text"
                  name="preco_unitario"
                  value={formData.preco_unitario}
                  onChange={handleChange}
                  placeholder="Ex: 120.00"
                />
              </div>
            </div>

            <div className="produto-modal-section-title">Entrada inicial de estoque</div>

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

            <div className="produto-modal-actions">
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
      {confirmModal.aberto && confirmModal.produto && (
        <ConfirmModal
          title={confirmModal.produto.ativo ? "Ocultar produto" : "Reativar produto"}
          message={`Deseja ${confirmModal.produto.ativo ? "ocultar" : "reativar"
            } o produto "${confirmModal.produto.nome_produto}"?`}
          confirmText={confirmModal.produto.ativo ? "Ocultar" : "Reativar"}
          cancelText="Cancelar"
          type={confirmModal.produto.ativo ? "warning" : "info"}
          onConfirm={alterarStatusProduto}
          onCancel={() =>
            setConfirmModal({
              aberto: false,
              produto: null
            })
          }
        />
      )}
    </div>
  );
}

export default Estoque;