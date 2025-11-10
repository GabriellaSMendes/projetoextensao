import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Estoque() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // form simples
  const [f, setF] = useState({ nome: "", categoria: "", quantidade: "", preco: "" });
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  // carrega lista
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/items"); // ajuste se sua rota for outra
      setItens(data || []);
    } catch (e) {
      alert("Erro ao carregar estoque.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // criar
  const createItem = async (e) => {
    e.preventDefault();
    if (!f.nome.trim()) return alert("Informe o nome.");
    try {
      setLoading(true);
      const payload = {
        nome: f.nome.trim(),
        categoria: f.categoria.trim(),
        quantidade: Number(f.quantidade || 0),
        preco: Number(f.preco || 0),
      };
      const { data } = await api.post("/items", payload);
      setItens([data, ...itens]);
      setF({ nome: "", categoria: "", quantidade: "", preco: "" });
    } catch (e) {
      alert("Erro ao cadastrar.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // excluir
  const del = async (id) => {
    if (!confirm("Excluir este item?")) return;
    try {
      await api.delete(`/items/${id}`);
      setItens(itens.filter(i => i.id !== id));
    } catch (e) {
      alert("Erro ao excluir.");
      console.error(e);
    }
  };

  // editar inline (salva tudo que foi alterado)
  const save = async (i) => {
    try {
      const payload = {
        nome: i.nome?.trim() || "",
        categoria: i.categoria?.trim() || "",
        quantidade: Number(i.quantidade || 0),
        preco: Number(i.preco || 0),
      };
      const { data } = await api.put(`/items/${i.id}`, payload);
      setItens(itens.map(x => x.id === i.id ? data : x));
      alert("Salvo!");
    } catch (e) {
      alert("Erro ao salvar.");
      console.error(e);
    }
  };

  // filtro básico
  const list = itens.filter(i =>
    `${i.nome} ${i.categoria}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Estoque</h1>

      <form onSubmit={createItem}>
        <input name="nome" placeholder="Nome" value={f.nome} onChange={onChange} />
        <input name="categoria" placeholder="Categoria" value={f.categoria} onChange={onChange} />
        <input name="quantidade" placeholder="Qtd." value={f.quantidade} onChange={onChange} />
        <input name="preco" placeholder="Preço (R$)" value={f.preco} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? "Aguarde..." : "Cadastrar"}</button>
      </form>

      <div className="userList">
        <input
          className="search"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            border: "1px solid #48456C", borderRadius: 30, height: 40,
            background: "#363643", color: "#fff", padding: "0 12px", width: 400
          }}
        />

        {loading && !itens.length && <p style={{ color:"#fff" }}>Carregando…</p>}

        {list.map(i => (
          <div key={i.id} className="user-card">
            <div>
              <p>Nome: <span>
                <input value={i.nome ?? ""} onChange={(e)=>setItens(s=>s.map(x=>x.id===i.id?{...x,nome:e.target.value}:x))}
                  style={inp} />
              </span></p>

              <p>Categoria: <span>
                <input value={i.categoria ?? ""} onChange={(e)=>setItens(s=>s.map(x=>x.id===i.id?{...x,categoria:e.target.value}:x))}
                  style={inp} />
              </span></p>

              <p>Qtd.: <span>
                <input value={i.quantidade ?? ""} onChange={(e)=>setItens(s=>s.map(x=>x.id===i.id?{...x,quantidade:e.target.value}:x))}
                  style={inp} />
              </span></p>

              <p>Preço (R$): <span>
                <input value={i.preco ?? ""} onChange={(e)=>setItens(s=>s.map(x=>x.id===i.id?{...x,preco:e.target.value}:x))}
                  style={inp} />
              </span></p>
            </div>

            <div className="user-card-buttons">
              <button title="Salvar" onClick={() => save(i)}>💾</button>
              <button title="Excluir" onClick={() => del(i.id)}>🗑️</button>
            </div>
          </div>
        ))}

        {!loading && !list.length && <p style={{ color:"#fff" }}>Sem itens.</p>}
      </div>
    </div>
  );
}