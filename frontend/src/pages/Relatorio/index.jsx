import { useEffect, useState } from "react";
import api from "../../services/api";
import "./style.css";

function Relatorio() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validade, setValidade] = useState([]);

  const carregarValidade = async () => {
    try {
      const resp = await api.get("/dashboard/validade");
      setValidade(resp.data);
    } catch (err) {
      console.error("Erro ao carregar validade:", err);
    }
  };

  useEffect(() => {
    carregarResumo();
    carregarValidade();
  }, []);


  // Carregar indicadores principais
  const carregarResumo = async () => {
    try {
      const token = localStorage.getItem("token");

      const resp = await api.get("/dashboard/resumo", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumo(resp.data);
    } catch (err) {
      console.error("Erro ao carregar resumo do dashboard:", err);
      alert("Erro ao carregar dados do relatório.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, []);

  return (
    <div className="dashboard-page">
      {/* TÍTULO */}
      <div className="dashboard-header">
        <h1>RELATÓRIO E DASHBOARD</h1>
        <p>Visão geral das vendas, produtos e estoque</p>
      </div>

      {/* INDICADORES */}
      {loading && <div className="loading">Carregando dados...</div>}

      {resumo && (
        <div className="cards-grid">
          <div className="dash-card">
            <h3>Faturamento Total</h3>
            <p className="valor">
              R$ {Number(resumo.faturamento_total || 0).toFixed(2)}
            </p>
          </div>

          <div className="dash-card">
            <h3>Vendas Realizadas</h3>
            <p className="valor">{resumo.total_vendas_realizadas}</p>
          </div>

          <div className="dash-card">
            <h3>Produtos com Estoque Baixo</h3>
            <p className="valor">{resumo.alertas_estoque_baixo}</p>
          </div>

          <div className="dash-card">
            <h3>Produto Mais Vendido</h3>
            <p className="produto">{resumo.produto_campeao.nome}</p>
            <span className="qtd">{resumo.produto_campeao.quantidade_vendida} un.</span>
          </div>
        </div>
      )}

      {/* GRÁFICOS */}
      <div className="graficos-section">
        <h2>Gráficos</h2>

        <div className="graficos-grid">
          <div className="grafico-box">
            <h4>Produtos por Categoria</h4>
            <img src="/api/dashboard/graficos/categorias" alt="Categorias" />
          </div>

          <div className="grafico-box">
            <h4>Estoque Baixo</h4>
            <img src="/api/dashboard/graficos/estoque_baixo" alt="Estoque Baixo" />
          </div>

          <div className="grafico-box">
            <h4>Top 10 Produtos Mais Vendidos</h4>
            <img src="/api/dashboard/graficos/top10" alt="Top vendidos" />
          </div>

          <div className="grafico-box">
            <h4>Produtos Próximos da Validade</h4>

            <table className="tabela-validade">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Data de Vencimento</th>
                  <th>Dias Restantes</th>
                </tr>
              </thead>
              <tbody>
                {validade.map((item, index) => (
                  <tr
                    key={index}
                    className={
                      item.dias_restantes <= 0
                        ? "vencido"
                        : item.dias_restantes <= 10
                          ? "alerta"
                          : ""
                    }
                  >
                    <td>{item.nome_produto}</td>
                    <td>{new Date(item.data_vencimento).toLocaleDateString("pt-BR")}</td>

                    <td className={item.dias_restantes <= 0 ? "vencido-texto" : ""}>
                      {item.dias_restantes <= 0 ? <strong>VENCIDO</strong> : item.dias_restantes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Relatorio;
