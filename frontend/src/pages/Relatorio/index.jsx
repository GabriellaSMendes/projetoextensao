import { useState } from "react";
import api from "../../services/api";
import Notification from "../../components/Notification";
import "./style.css";

function Relatorio() {
  const [tipoRelatorio, setTipoRelatorio] = useState("vendas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  function mostrarNotificacao(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3500);
  }

  const tiposRelatorio = {
    vendas: {
      titulo: "Relatório de vendas",
      descricao:
        "Extrai vendas registradas, cliente, vendedor, forma de pagamento, produtos vendidos, quantidades, valores e desconto aplicado.",
      usaPeriodo: true,
    },
    estoque: {
      titulo: "Relatório de estoque",
      descricao:
        "Extrai produtos cadastrados, categoria, sabor, marca, estoque atual, custo unitário, preço de venda e valor potencial.",
      usaPeriodo: false,
    },
    validade: {
      titulo: "Relatório de validade",
      descricao:
        "Extrai lotes disponíveis, fornecedor, quantidade recebida, quantidade disponível, vencimento e dias restantes.",
      usaPeriodo: false,
    },
    movimentacoes: {
      titulo: "Relatório de movimentações",
      descricao:
        "Extrai entradas e saídas de estoque, produto, quantidade, usuário responsável e data da movimentação.",
      usaPeriodo: true,
    },
  };

  const relatorioSelecionado = tiposRelatorio[tipoRelatorio];

  const gerarRelatorio = async () => {
    try {
      setLoading(true);

      if (relatorioSelecionado.usaPeriodo && dataInicio && dataFim) {
        const inicio = new Date(`${dataInicio}T00:00:00`);
        const fim = new Date(`${dataFim}T00:00:00`);

        if (inicio > fim) {
          mostrarNotificacao(
            "A data inicial não pode ser maior que a data final.",
            "warning"
          );
          return;
        }
      }

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      params.append("tipo", tipoRelatorio);

      if (relatorioSelecionado.usaPeriodo) {
        if (dataInicio) params.append("data_inicio", dataInicio);
        if (dataFim) params.append("data_fim", dataFim);
      }

      const response = await api.get(`/dashboard/exportar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const nomeArquivo = `relatorio_${tipoRelatorio}.xlsx`;

      link.href = url;
      link.setAttribute("download", nomeArquivo);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      mostrarNotificacao("Relatório gerado com sucesso.", "success");
    } catch (error) {
      console.error(error);

      mostrarNotificacao(
        error.response?.data?.erro ||
          "Erro ao gerar relatório. Verifique os filtros e tente novamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setTipoRelatorio("vendas");
    setDataInicio("");
    setDataFim("");
  };

  return (
    <div className="relatorio-page">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <main className="relatorio-main">
        <div className="relatorio-header">
          <div>
            <h1>RELATÓRIOS GERENCIAIS</h1>
            <p>
              Gere arquivos em Excel com informações de vendas, estoque,
              validade e movimentações.
            </p>
          </div>
        </div>

        <section className="relatorio-card">
          <div className="relatorio-card-header">
            <div>
              <h2>Gerar relatório</h2>
              <p>
                Selecione o tipo de relatório e preencha os filtros desejados
                para extrair as informações.
              </p>
            </div>
          </div>

          <div className="relatorio-form-grid">
            <div className="campo-relatorio">
              <label>Tipo de relatório</label>
              <select
                value={tipoRelatorio}
                onChange={(e) => setTipoRelatorio(e.target.value)}
              >
                <option value="vendas">Vendas</option>
                <option value="estoque">Estoque</option>
                <option value="validade">Produtos por validade</option>
                <option value="movimentacoes">Movimentações de estoque</option>
              </select>
            </div>

            {relatorioSelecionado.usaPeriodo && (
              <>
                <div className="campo-relatorio">
                  <label>Data inicial</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                <div className="campo-relatorio">
                  <label>Data final</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="relatorio-info-box">
            <span>Relatório selecionado</span>
            <strong>{relatorioSelecionado.titulo}</strong>
            <p>{relatorioSelecionado.descricao}</p>
          </div>

          <div className="relatorio-actions">
            <button
              type="button"
              className="limpar-btn"
              onClick={limparFiltros}
              disabled={loading}
            >
              Limpar filtros
            </button>

            <button
              type="button"
              className="gerar-btn"
              onClick={gerarRelatorio}
              disabled={loading}
            >
              {loading ? "Gerando..." : "Gerar relatório"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Relatorio;