import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

function formatarData(data) {
  if (!data) return "-";

  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarNivel(nivel) {
  if (nivel === "admin") return "Administrador";
  if (nivel === "vendedor") return "Vendedor";
  return nivel || "-";
}

function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/usuarios/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPerfil(response.data.usuario);
      setMovimentacoes(response.data.movimentacoes || []);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  if (loading) {
    return (
      <main className="perfil-page">
        <div className="perfil-loading">Carregando perfil...</div>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="perfil-page">
        <div className="perfil-empty">Não foi possível carregar os dados do perfil.</div>
      </main>
    );
  }

  return (
    <main className="perfil-page">
      <section className="perfil-header">
        <div>
          <span className="perfil-eyebrow">Minha conta</span>
          <h1>Perfil do usuário</h1>
          <p>
            Consulte seus dados de acesso e acompanhe suas principais ações no sistema.
          </p>
        </div>

        <div className="perfil-avatar">
          {perfil.nome_usuario?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </section>

      <section className="perfil-grid">
        <div className="perfil-card dados-card">
          <h2>Dados cadastrais</h2>

          <div className="perfil-info-lista">
            <div>
              <span>Nome</span>
              <strong>{perfil.nome_usuario}</strong>
            </div>

            <div>
              <span>E-mail</span>
              <strong>{perfil.email}</strong>
            </div>

            <div>
              <span>CPF</span>
              <strong>{perfil.cpf || "-"}</strong>
            </div>

            <div>
              <span>Nível de acesso</span>
              <strong>
                <span className={`perfil-nivel ${perfil.nivel_acesso}`}>
                  {formatarNivel(perfil.nivel_acesso)}
                </span>
              </strong>
            </div>
          </div>
        </div>

        <div className="perfil-card resumo-card">
          <h2>Resumo de atividade</h2>

          <div className="perfil-resumo-grid">
            <div className="perfil-resumo-item">
              <span>Vendas registradas</span>
              <strong>{perfil.total_pedidos}</strong>
            </div>

            <div className="perfil-resumo-item">
              <span>Movimentações de estoque</span>
              <strong>{perfil.total_movimentacoes}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="perfil-card movimentacoes-card">
        <div className="movimentacoes-header">
          <div>
            <h2>Últimas movimentações</h2>
            <p>Histórico recente de movimentações de estoque feitas por este usuário.</p>
          </div>
        </div>

        <div className="perfil-table">
          <div className="perfil-thead">
            <div>Data</div>
            <div>Produto</div>
            <div>Tipo</div>
            <div>Quantidade</div>
          </div>

          {movimentacoes.length === 0 ? (
            <div className="perfil-empty-table">
              Nenhuma movimentação encontrada para este usuário.
            </div>
          ) : (
            movimentacoes.map((mov) => (
              <div className="perfil-row" key={mov.id_movimentacao}>
                <div>{formatarData(mov.ultima_atualizacao)}</div>
                <div>{mov.produto}</div>
                <div>{mov.tipo_movimentacao}</div>
                <div>{mov.qtdd_movimentacao}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Perfil;