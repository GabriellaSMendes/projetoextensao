

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






function Estoque() {


  const [filtrosAbertos, setFiltrosAbertos] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);

  const [filtroCategoria, setFiltroCategoria] = useState([]);


  const [filtroSabor, setFiltroSabor] = useState([]);


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


    return produtos.filter((p) => {


      const atendeBusca = p.nome_produto.toLowerCase().includes(busca.toLowerCase()) ||


        p.marca?.toLowerCase().includes(busca.toLowerCase());


      const atendeCategoria = filtroCategoria.length === 0 || filtroCategoria.includes(p.nome);


      const atendeSabor = filtroSabor.length === 0 || filtroSabor.includes(p.sabor);






      return atendeBusca && atendeCategoria && atendeSabor;


    });


  }, [produtos, busca, filtroCategoria, filtroSabor]);

  const [formData, setFormData] = useState({
    nome_produto: "",
    sabor: "",
    marca: "",
    quantidade: "",
    preco_unitario: "",
    id_fornecedor: "",
    id_categoria: "",
    data_vencimento: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const salvarProduto = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/estoque/produtos",
        {
          nome_produto: formData.nome_produto,
          sabor: formData.sabor,
          marca: formData.marca,
          qtdd_entrada: Number(formData.quantidade),
          preco_unitario: Number(formData.preco_unitario.replace(",", ".")),
          id_fornecedor: formData.id_fornecedor || null,
          id_categoria: formData.id_categoria || null,
          data_vencimento: formData.data_vencimento || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔄 Atualiza lista
      carregarProdutos();

      // 🔒 Fecha modal
      setModalOpen(false);

      // 🧹 Limpa form
      setFormData({
        nome_produto: "",
        sabor: "",
        marca: "",
        quantidade: "",
        preco_unitario: "",
        id_fornecedor: "",
        id_categoria: "",
        data_vencimento: ""
      });

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto");
    }
  };

  const atualizarProduto = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/estoque/produtos/${produtoEditando.id_produto}`,
        {
          nome_produto: formData.nome_produto,
          sabor: formData.sabor,
          marca: formData.marca,
          preco_unitario: formData.preco_unitario
          ? Number(formData.preco_unitario.replace(",", "."))
          : 0,
          id_fornecedor: formData.id_fornecedor || null,
          id_categoria: formData.id_categoria || null,
          data_vencimento: formData.data_vencimento || null,

          qtdd_atual: Number(formData.quantidade) || produtoEditando.qtdd_atual
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      carregarProdutos();
      setModalOpen(false);
      setProdutoEditando(null);

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar produto");
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


            <label>Sabores</label>


            <div className="checkbox-list">


              {[...new Set(produtos.map((p) => p.sabor))].filter(Boolean).map((s) => (


                <div key={s} className="checkbox-item">


                  <input


                    type="checkbox"


                    id={`sabor-${s}`}


                    checked={filtroSabor.includes(s)}


                    onChange={() => toggleFiltro(filtroSabor, s, setFiltroSabor)}


                  />


                  <label htmlFor={`sabor-${s}`}>{s}</label>


                </div>


              ))}


            </div>


          </div>


        </div>






        <div className="filtros-actions">


          <button className="btn-limpar" onClick={() => { setFiltroCategoria([]); setFiltroSabor([]); setBusca(""); }}>


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
                  quantidade: "",
                  preco_unitario: "",
                  id_fornecedor: "",
                  id_categoria: "",
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






          {loading ? (


            <div className="loading">Carregando produtos...</div>


          ) : filtrados.length === 0 ? (


            <div className="empty">Nenhum produto encontrado.</div>


          ) : (


            filtrados.map((p) => (


              <div className="row" key={p.id_produto}>


                <div className="col img-col"><div className="placeholder-img"></div></div>


                <div className="col">{p.nome_produto}</div>


                <div className="col">{p.nome}</div>


                <div className="col">{p.sabor}</div>


                <div className="col">{p.marca}</div>


                <div className="col">{formatarDataBR(p.data_vencimento)}</div>


                <div className="col center">{p.qtdd_atual}</div>


                <div className="col">{p.nome_fornecedor || "-"}</div>


                <div className="col action">


                  <button
                    className="edit-btn"
                    onClick={() => {
                      setProdutoEditando(p);

                      setFormData({
                        nome_produto: p.nome_produto || "",
                        sabor: p.sabor || "",
                        marca: p.marca || "",
                        quantidade: p.qtdd_atual || "",
                        preco_unitario: p.preco_unitario || "",
                        id_fornecedor: p.id_fornecedor || "",
                        id_categoria: p.id_categoria || "",
                        data_vencimento: p.data_vencimento
                        ? p.data_vencimento.split("T")[0]
                        : ""
                      });

                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>


                </div>


              </div>


            ))


          )}


        </div>


      </main>










      {/* Adicione isso antes do fim do return */}

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
                  type="text"
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
              <button
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setProdutoEditando(null);
                }}
              >
                Cancelar
              </button>

              <button
                className="save-btn"
                onClick={() => {
                  if (produtoEditando) {
                    atualizarProduto();
                  } else {
                    salvarProduto();
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

