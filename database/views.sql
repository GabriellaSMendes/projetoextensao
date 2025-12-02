-- Estoque total por produto
-- Usa as quantidades de entrada e saída registradas diretamente na tabela 'estoque'
CREATE VIEW vw_saldo_estoque AS
SELECT 
    p.id_produto,
    p.nome_produto,
    p.id_categoria,
    e.qtdd_atual AS estoque_atual
FROM produto p
JOIN estoque e ON p.id_produto = e.id_produto;


-- Produtos com estoque baixo
CREATE VIEW vw_estoque_baixo AS
SELECT 
    s.id_produto,
    s.nome_produto,
    s.estoque_atual
FROM vw_saldo_estoque s
WHERE s.estoque_atual <= 5;


-- Produtos prestes a vencer (próximos 7 dias)
CREATE VIEW vw_produtos_prestes_vencer AS
SELECT 
    p.id_produto,
    p.nome_produto,
    p.data_vencimento,
    DATEDIFF(p.data_vencimento, CURDATE()) AS dias_restantes
FROM produto p
WHERE p.data_vencimento IS NOT NULL
  AND p.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND p.data_vencimento >= CURDATE();


-- Movimentação completa (Entradas por Abastece e Saídas por Venda_Estoque)
CREATE VIEW vw_movimentacao_estoque AS
(
    -- Movimentação de Entrada (Abastecimento)
    SELECT 
        a.id_abastecimento AS id_movimentacao,
        p.nome_produto AS produto,
        'ENTRADA' AS tipo,
        f.razao_social AS origem,
        a.qtdd_recebida AS quantidade,
        a.dt_abastecimento AS data_movimentacao
    FROM abastece a
    JOIN estoque e ON a.id_estoque = e.id_estoque
    JOIN produto p ON e.id_produto = p.id_produto
    JOIN fornecedor f ON a.id_fornecedor = f.id_fornecedor
)
UNION ALL
(
    -- Movimentação de Saída (Venda)
    SELECT 
        ve.id_venda_estoque AS id_movimentacao,
        p.nome_produto AS produto,
        'SAIDA' AS tipo,
        CONCAT('Venda ID: ', v.id_venda) AS origem,
        ve.qtdd_venda AS quantidade,
        v.dt_venda AS data_movimentacao
    FROM venda_estoque ve
    JOIN venda v ON ve.id_venda = v.id_venda
    JOIN produto p ON ve.id_produto = p.id_produto
)
ORDER BY data_movimentacao DESC;


-- Resumo de Vendas
CREATE VIEW vw_vendas_resumo AS
SELECT
    v.id_venda,
    v.dt_venda AS data_venda,
    DATE(v.dt_venda) AS dia,
    MONTH(v.dt_venda) AS mes,
    YEAR(v.dt_venda) AS ano,
    SUM(ve.subtotal) AS total_venda -- Usando a coluna 'subtotal' calculada em venda_estoque
FROM venda v
JOIN venda_estoque ve ON ve.id_venda = v.id_venda
GROUP BY v.id_venda, v.dt_venda;

-- Para resumo diário de vendas:
CREATE VIEW vw_vendas_por_dia AS
SELECT dia, SUM(total_venda) AS total
FROM vw_vendas_resumo
GROUP BY dia
ORDER BY dia;


-- Para resumo mensal de vendas:
CREATE VIEW vw_vendas_por_mes AS
SELECT ano, mes, SUM(total_venda) AS total
FROM vw_vendas_resumo
GROUP BY ano, mes
ORDER BY ano, mes;


-- Custo médio de aquisição por produto
CREATE VIEW vw_custo_medio AS
SELECT 
    p.id_produto,
    p.nome_produto,
    SUM(a.qtdd_recebida * a.valor_unitario) 
        / NULLIF(SUM(a.qtdd_recebida), 0)
    AS custo_medio
FROM produto p
LEFT JOIN estoque e ON p.id_produto = e.id_produto
LEFT JOIN abastece a ON e.id_estoque = a.id_estoque
GROUP BY p.id_produto, p.nome_produto;