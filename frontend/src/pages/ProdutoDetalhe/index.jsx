import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "./style.css";
import Notification from "../../components/Notification";
import ConfirmModal from "../../components/ConfirmModal";

function formatarDataHora(data) {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatarDataBR(data) {
    if (!data) return "-";

    const partes = data.split("-");
    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularDiasAteVencimento(data) {
    if (!data) return null;

    const hoje = new Date();
    const vencimento = new Date(data + "T00:00:00");

    hoje.setHours(0, 0, 0, 0);

    const diffMs = vencimento - hoje;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function ProdutoDetalhe() {
    const { id } = useParams();
    const [produto, setProduto] = useState(null);
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [abastecimentos, setAbastecimentos] = useState([]);
    const [filtrarVencimentosProximos, setFiltrarVencimentosProximos] = useState(false);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalEntradaOpen, setModalEntradaOpen] = useState(false);
    const [entradaForm, setEntradaForm] = useState({
        id_fornecedor: "",
        qtdd_recebida: "",
        valor_unitario: "",
        data_vencimento: "",
        numero_lote: ""
    });

    const [notification, setNotification] = useState({
        message: "",
        type: "success"
    });

    const [confirmLoteModal, setConfirmLoteModal] = useState({
        aberto: false,
        abastecimento: null
    });

    function mostrarNotificacao(message, type = "success") {
        setNotification({ message, type });

        setTimeout(() => {
            setNotification({ message: "", type: "success" });
        }, 3500);
    }

    async function carregarDetalhes() {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const produtoResp = await api.get(`/estoque/produtos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const movimentacoesResp = await api.get(
                `/estoque/produtos/${id}/movimentacoes`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const abastecimentosResp = await api.get(
                `/estoque/produtos/${id}/abastecimentos`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setProduto(produtoResp.data.produto);
            setMovimentacoes(movimentacoesResp.data.movimentacoes || []);
            setAbastecimentos(abastecimentosResp.data.abastecimentos || []);
        } catch (err) {
            console.error("Erro ao carregar detalhe do produto:", err);
            setErro(
                err.response?.data?.erro ||
                err.response?.data?.msg ||
                "Erro ao carregar detalhe do produto"
            );
        } finally {
            setLoading(false);
        }
    }

    async function carregarFornecedores() {
        try {
            const token = localStorage.getItem("token");

            const resp = await api.get("/fornecedores", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFornecedores(resp.data.fornecedores || []);
        } catch (err) {
            console.error("Erro ao carregar fornecedores:", err);
        }
    }

    useEffect(() => {
        carregarDetalhes();
        carregarFornecedores();
    }, [id]);

    const handleEntradaChange = (e) => {
        setEntradaForm({
            ...entradaForm,
            [e.target.name]: e.target.value
        });
    };

    const registrarEntrada = async () => {
        if (!entradaForm.id_fornecedor) {
            alert("Selecione um fornecedor.");
            return;
        }

        if (!entradaForm.qtdd_recebida || Number(entradaForm.qtdd_recebida) <= 0) {
            alert("Informe uma quantidade válida.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await api.post(
                "/estoque/abastecer",
                {
                    id_produto: Number(id),
                    id_fornecedor: Number(entradaForm.id_fornecedor),
                    qtdd_recebida: Number(entradaForm.qtdd_recebida),
                    valor_unitario: entradaForm.valor_unitario
                        ? Number(entradaForm.valor_unitario.replace(",", "."))
                        : null,
                    data_vencimento: entradaForm.data_vencimento || null,
                    numero_lote: entradaForm.numero_lote || null
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setModalEntradaOpen(false);
            setEntradaForm({
                id_fornecedor: "",
                qtdd_recebida: "",
                valor_unitario: "",
                data_vencimento: "",
                numero_lote: ""
            });

            carregarDetalhes();
        } catch (err) {
            console.error("Erro ao registrar entrada:", err);
            alert(
                err.response?.data?.erro ||
                err.response?.data?.detalhes ||
                "Erro ao registrar entrada de estoque."
            );
        }
    };

    const abrirConfirmacaoBaixaLote = (abastecimento) => {
        setConfirmLoteModal({
            aberto: true,
            abastecimento
        });
    };

    const baixarLote = async () => {
        const abastecimento = confirmLoteModal.abastecimento;

        if (!abastecimento) return;

        try {
            const token = localStorage.getItem("token");

            await api.patch(
                `/estoque/abastecimentos/${abastecimento.id_abastecimento}/baixar`,
                {
                    motivo: "Descarte por validade vencida"
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setConfirmLoteModal({
                aberto: false,
                abastecimento: null
            });

            mostrarNotificacao("Lote baixado do estoque com sucesso.", "success");
            carregarDetalhes();
        } catch (err) {
            console.error("Erro ao baixar lote:", err);

            setConfirmLoteModal({
                aberto: false,
                abastecimento: null
            });

            mostrarNotificacao(
                err.response?.data?.detalhes ||
                err.response?.data?.erro ||
                "Erro ao baixar lote do estoque.",
                "error"
            );
        }
    };
    const lotesDisponiveis = abastecimentos.filter(
        (ab) => Number(ab.qtdd_disponivel) > 0
    );

    const lotesVencidos = lotesDisponiveis.filter((ab) => {
        const dias = calcularDiasAteVencimento(ab.data_vencimento);
        return dias !== null && dias < 0;
    });

    const estoqueTotal = lotesDisponiveis.reduce((total, lote) => {
        return total + (Number(lote.qtdd_disponivel) || 0);
    }, 0);

    const proximaValidade = lotesDisponiveis
        .filter((ab) => {
            const dias = calcularDiasAteVencimento(ab.data_vencimento);
            return dias !== null && dias >= 0;
        })
        .sort(
            (a, b) =>
                new Date(a.data_vencimento) - new Date(b.data_vencimento)
        )[0]?.data_vencimento;

    const quantidadeVencida = lotesVencidos.reduce((total, lote) => {
        return total + (Number(lote.qtdd_disponivel) || 0);
    }, 0);

    const lotesProximosVencimento = lotesDisponiveis.filter((ab) => {
        const dias = calcularDiasAteVencimento(ab.data_vencimento);
        return dias !== null && dias >= 0 && dias <= 45;
    });

    const lotesExibidos = filtrarVencimentosProximos
        ? [...lotesVencidos, ...lotesProximosVencimento]
        : lotesDisponiveis;

    const custoTotalEstoque = lotesExibidos.reduce((total, lote) => {
        const quantidade = Number(lote.qtdd_disponivel) || 0;
        const custoUnitario = Number(lote.valor_unitario) || 0;

        return total + quantidade * custoUnitario;
    }, 0);

    const valorVendaEstoque =
        (Number(produto?.qtdd_atual) || 0) *
        (Number(produto?.preco_unitario) || 0);

    if (erro) {
        return (
            <div className="produto-detalhe-page">
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ message: "", type: "success" })}
                />
                <h1>Detalhe do Produto</h1>
                <p className="produto-error">{erro}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="produto-detalhe-page">
                <h1>Detalhe do Produto</h1>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="produto-detalhe-page">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: "", type: "success" })}
            />
            <div className="produto-header">
                <div>
                    <h1>Detalhe do Produto</h1>
                    <p className="produto-subtitle">
                        Informações consolidadas e histórico de movimentações
                    </p>
                </div>

                <button
                    className="btn-entrada"
                    onClick={() => setModalEntradaOpen(true)}
                >
                    Registrar entrada
                </button>
            </div>

            {produto && (
                <section className="produto-card">
                    <div className="produto-card-section">
                        <div className="section-title-row">
                            <h3>Dados do produto</h3>
                        </div>

                        <div className="produto-info-grid">
                            <div>
                                <span className="card-label">Nome</span>
                                <strong>{produto.nome_produto}</strong>
                            </div>

                            <div>
                                <span className="card-label">Categoria</span>
                                <strong>{produto.nome_categoria || "-"}</strong>
                            </div>

                            <div>
                                <span className="card-label">Sabor</span>
                                <strong>{produto.sabor || "-"}</strong>
                            </div>

                            <div>
                                <span className="card-label">Marca</span>
                                <strong>{produto.marca || "-"}</strong>
                            </div>

                            <div>
                                <span className="card-label">Estoque atual</span>
                                <strong>{produto.qtdd_atual}</strong>
                            </div>

                            <div
                                className={`validade-card-info ${lotesVencidos.length > 0
                                    ? "validade-vencido"
                                    : lotesProximosVencimento.length > 0
                                        ? "validade-alerta"
                                        : ""
                                    }`}
                                onClick={() => setFiltrarVencimentosProximos(!filtrarVencimentosProximos)}
                            >
                                <span className="card-label">Próximo da validade</span>

                                <strong>
                                    {lotesVencidos.length + lotesProximosVencimento.length}{" "}
                                    {lotesVencidos.length + lotesProximosVencimento.length === 1 ? "lote" : "lotes"}
                                </strong>

                                <small>
                                    {lotesVencidos.length > 0
                                        ? `${lotesVencidos.length} vencido(s)`
                                        : lotesProximosVencimento.length > 0
                                            ? "Vencimento em até 45 dias"
                                            : "Nenhum alerta de validade"}
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="produto-card-section valores-section">
                        <div className="section-title-row">
                            <h3>Resumo financeiro</h3>
                        </div>

                        <div className="produto-valores-grid">
                            <div className="valor-resumo-card">
                                <span className="card-label">Custo unitário</span>
                                <strong>
                                    {produto.custo_unitario
                                        ? `R$ ${Number(produto.custo_unitario).toFixed(2)}`
                                        : "-"}
                                </strong>
                            </div>

                            <div className="valor-resumo-card">
                                <span className="card-label">Preço de venda</span>
                                <strong>
                                    {produto.preco_unitario
                                        ? `R$ ${Number(produto.preco_unitario).toFixed(2)}`
                                        : "-"}
                                </strong>
                            </div>

                            <div className="valor-resumo-card">
                                <span className="card-label">Custo total do estoque</span>
                                <strong>R$ {custoTotalEstoque.toFixed(2)}</strong>
                            </div>

                            <div className="valor-resumo-card destaque">
                                <span className="card-label">Valor potencial de venda</span>
                                <strong>R$ {valorVendaEstoque.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="lotes-section">
                <div className="lotes-header">
                    <div>
                        <h2>Lotes em estoque</h2>
                        <p>
                            {filtrarVencimentosProximos
                                ? "Mostrando apenas lotes com vencimento em até 45 dias."
                                : "Visualização por fornecedor, validade e saldo disponível."}
                        </p>
                    </div>

                    {filtrarVencimentosProximos && (
                        <button
                            className="limpar-filtro-validade"
                            onClick={() => setFiltrarVencimentosProximos(false)}
                        >
                            Limpar filtro
                        </button>
                    )}
                </div>

                {lotesExibidos.length === 0 ? (
                    <p className="empty-history">
                        Nenhuma entrada registrada para este produto.
                    </p>
                ) : (
                    <table className="lotes-table">
                        <thead>
                            <tr>
                                <th>Validade</th>
                                <th>Lote</th>
                                <th>Fornecedor</th>
                                <th>Qtd. recebida</th>
                                <th>Qtd. disponível</th>
                                <th>Custo unitário</th>
                                <th>Custo total do lote</th>
                                <th>Entrada</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lotesExibidos.map((ab) => {
                                const dias = calcularDiasAteVencimento(ab.data_vencimento);
                                const custoTotalLote =
                                    (Number(ab.qtdd_disponivel) || 0) * (Number(ab.valor_unitario) || 0);

                                return (
                                    <tr
                                        key={ab.id_abastecimento}
                                        className={
                                            dias !== null && dias < 0
                                                ? "lote-vencido"
                                                : dias !== null && dias >= 0 && dias <= 45
                                                    ? "lote-alerta"
                                                    : ""
                                        }
                                    >
                                        <td>
                                            {formatarDataBR(ab.data_vencimento)}

                                            {dias !== null && dias < 0 && (
                                                <span className="validade-badge vencido">vencido</span>
                                            )}

                                            {dias !== null && dias >= 0 && dias <= 45 && (
                                                <span className="validade-badge">até 45 dias</span>
                                            )}
                                        </td>
                                        <td>{ab.numero_lote || "-"}</td>
                                        <td>{ab.fornecedor || "-"}</td>
                                        <td>{ab.qtdd_recebida}</td>
                                        <td>{ab.qtdd_disponivel}</td>
                                        <td>
                                            {ab.valor_unitario
                                                ? `R$ ${Number(ab.valor_unitario).toFixed(2)}`
                                                : "-"}
                                        </td>

                                        <td>
                                            R$ {custoTotalLote.toFixed(2)}
                                        </td>

                                        <td>
                                            {formatarDataHora(ab.dt_abastecimento)}
                                        </td>

                                        <td>
                                            {dias !== null && dias < 0 && Number(ab.qtdd_disponivel) > 0 ? (
                                                <button
                                                    type="button"
                                                    className="btn-baixar-lote"
                                                    onClick={() => abrirConfirmacaoBaixaLote(ab)}
                                                >
                                                    Baixar lote
                                                </button>
                                            ) : (
                                                <span className="acao-indisponivel">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="historico-section">
                <h2>Histórico de Movimentações</h2>

                {movimentacoes.length === 0 ? (
                    <p className="empty-history">
                        Nenhuma movimentação registrada para este produto.
                    </p>
                ) : (
                    <table className="historico-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Quantidade</th>
                                <th>Usuário</th>
                            </tr>
                        </thead>

                        <tbody>
                            {movimentacoes.map((mov) => (
                                <tr key={mov.id_movimentacao}>
                                    <td>{formatarDataHora(mov.ultima_atualizacao)}</td>
                                    <td>{mov.tipo_movimentacao}</td>
                                    <td>
                                        {mov.tipo_movimentacao?.toLowerCase() === "entrada" ? "+" : "-"}
                                        {Math.abs(Number(mov.qtdd_movimentacao))}
                                    </td>
                                    <td>{mov.usuario}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {modalEntradaOpen && (
                <div className="modal-overlay">
                    <div className="entrada-modal">
                        <h2>Registrar entrada</h2>

                        <div className="entrada-form">
                            <div>
                                <label>Fornecedor</label>
                                <select
                                    name="id_fornecedor"
                                    value={entradaForm.id_fornecedor}
                                    onChange={handleEntradaChange}
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
                                <label>Número do lote</label>
                                <input
                                    type="text"
                                    name="numero_lote"
                                    value={entradaForm.numero_lote}
                                    onChange={handleEntradaChange}
                                    placeholder="Ex: LOTE-2026-001"
                                />
                            </div>

                            <div>
                                <label>Quantidade recebida</label>
                                <input
                                    type="number"
                                    name="qtdd_recebida"
                                    value={entradaForm.qtdd_recebida}
                                    onChange={handleEntradaChange}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label>Custo unitário</label>
                                <input
                                    type="text"
                                    name="valor_unitario"
                                    value={entradaForm.valor_unitario}
                                    onChange={handleEntradaChange}
                                    placeholder="Ex: 120.00"
                                />
                            </div>

                            <div>
                                <label>Data de vencimento do lote</label>
                                <input
                                    type="date"
                                    name="data_vencimento"
                                    value={entradaForm.data_vencimento}
                                    onChange={handleEntradaChange}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                        </div>

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setModalEntradaOpen(false)}
                            >
                                Cancelar
                            </button>

                            <button className="save-btn" onClick={registrarEntrada}>
                                Salvar entrada
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmLoteModal.aberto && confirmLoteModal.abastecimento && (
                <ConfirmModal
                    title="Baixar lote vencido"
                    message={`Deseja baixar o lote "${confirmLoteModal.abastecimento.numero_lote || "-"}" do estoque? Essa ação irá remover ${confirmLoteModal.abastecimento.qtdd_disponivel} unidade(s) disponíveis deste lote.`}
                    confirmText="Baixar lote"
                    cancelText="Cancelar"
                    type="danger"
                    onConfirm={baixarLote}
                    onCancel={() =>
                        setConfirmLoteModal({
                            aberto: false,
                            abastecimento: null
                        })
                    }
                />
            )}
        </div>
    );
}

export default ProdutoDetalhe;