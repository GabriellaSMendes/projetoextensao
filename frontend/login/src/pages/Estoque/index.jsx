import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css"; // importa o CSS separado

export default function Estoque() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    quantidade: "",
    preco: "",
  });

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Busca os itens cadastrados
  const carregarItens = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/items"); // ajuste conforme seu backend
      setItens(data || []);
    } catch (error) {
      alert("Erro ao carregar estoque");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  // Cadastrar item
  const cadastrarItem = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return alert("Informe o nome do item.");
    try {
      setLoading(true);
      const novoItem = {
        nome: form.nome.trim(),
        categoria: form.categoria.trim(),
        quantidade: Number(form.quantidade || 0),
        preco: Number(form.preco || 0),
      };
      const { data } = await api.post("/items", novoItem);
      setItens([data, ...itens]);
      setForm({ nome: "", categoria: "", quantidade: "", preco: "" });
    } catch (error) {
      alert("Erro ao cadastrar item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Excluir item
  const excluirItem = async (id) => {
    if (!confirm("Deseja realmente excluir este item?")) return;
    try {
      await api.delete(`/items/${id}`);
      setItens(itens.filter((i) => i.id !== id));
    } catch (error) {
      alert("Erro ao excluir item");
      console.error(error);
    }
  };

  // Salvar alterações inline
  const salvarEdicao = async (item) => {
    try {
      const { data } = await api.put(`/items/${item.id}`, item);
      setItens(itens.map((i) => (i.id === item.id ? data : i)));
      alert("Item atualizado!");
    } catch (error) {
      alert("Erro ao atualizar item");
      console.error(error);
    }
  };

  // Filtrar itens localmente
  const listaFiltrada = itens.filter((i) =>
    `${i.nome} ${i.categoria}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Controle de Estoque</h1>

      {/* Formulário de cadastro */}
      <form onSubmit={cadastrarItem} className="estoque-form">
        <input
          name="nome"
          placeholder="Nome do item"
          value={form.nome}
          onChange={handleChange}
        />
        <input
          name="categoria"
          placeholder="Categoria"
          value={form.categoria}
          onChange={handleChange}
        />
        <input
          name="quantidade"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={handleChange}
        />
        <input
          name="preco"
          placeholder="Preço (R$)"
          value={form.preco}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
      </form>

      {/* Campo de busca */}
      <div className="userList">
        <input
          className="search"
          placeholder="Buscar item..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {loading && !itens.length && (
          <p style={{ color: "#fff" }}>Carregando...</p>
        )}

        {/* Listagem dos itens */}
        {listaFiltrada.map((item) => (
          <div key={item.id} className="user-card">
            <div>
              <p>
                Nome:{" "}
                <span>
                  <input
                    className="row-input"
                    value={item.nome}
                    onChange={(e) =>
                      setItens((s) =>
                        s.map((x) =>
                          x.id === item.id ? { ...x, nome: e.target.value } : x
                        )
                      )
                    }
                  />
                </span>
              </p>

              <p>
                Categoria:{" "}
                <span>
                  <input
                    className="row-input"
                    value={item.categoria}
                    onChange={(e) =>
                      setItens((s) =>
                        s.map((x) =>
                          x.id === item.id
                            ? { ...x, categoria: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </span>
              </p>

              <p>
                Qtd.:{" "}
                <span>
                  <input
                    className="row-input"
                    value={item.quantidade}
                    onChange={(e) =>
                      setItens((s) =>
                        s.map((x) =>
                          x.id === item.id
                            ? { ...x, quantidade: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </span>
              </p>

              <p>
                Preço (R$):{" "}
                <span>
                  <input
                    className="row-input"
                    value={item.preco}
                    onChange={(e) =>
                      setItens((s) =>
                        s.map((x) =>
                          x.id === item.id
                            ? { ...x, preco: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </span>
              </p>
            </div>

            <div className="user-card-buttons">
              <button title="Salvar" onClick={() => salvarEdicao(item)}>
                💾
              </button>
              <button title="Excluir" onClick={() => excluirItem(item.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}

        {!loading && !listaFiltrada.length && (
          <p style={{ color: "#fff" }}>Nenhum item encontrado.</p>
        )}
      </div>
    </div>
  );
}
