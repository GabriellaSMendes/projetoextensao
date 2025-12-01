-- Estoque total por produto
CREATE VIEW vw_saldo_estoque AS
SELECT 
    p.id AS id_produto,
    p.nome,
    p.id_categoria,
    SUM(
        CASE 
            WHEN e.tipo = 'ENTRADA' THEN e.quantidade
            WHEN e.tipo = 'SAIDA' THEN -e.quantidade
        END
    ) AS estoque_atual
FROM produto p
LEFT JOIN estoque e ON p.id = e.id_produto
GROUP BY p.id, p.nome, p.id_categoria;


-- Produtos com estoque baixo
CREATE VIEW vw_estoque_baixo AS
SELECT 
    s.id_produto,
    s.nome,
    s.estoque_atual
FROM vw_saldo_estoque s
WHERE s.estoque_atual <= 5;


-- Produtos prestes a vencer
CREATE VIEW vw_produtos_prestes_vencer AS
SELECT 
    p.id,
    p.nome,
    p.data_validade,
    DATEDIFF(p.data_validade, CURDATE()) AS dias_restantes
FROM produto p
WHERE p.data_validade IS NOT NULL
  AND p.data_validade <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND p.data_validade >= CURDATE();


-- Movimentação completa
CREATE VIEW vw_movimentacao_estoque AS
SELECT 
    e.id,
    p.nome AS produto,
    e.tipo,
    e.origem,
    e.quantidade,
    e.data_entrada,
    e.id_origem
FROM estoque e
JOIN produto p ON p.id = e.id_produto
ORDER BY e.data_entrada DESC;

-- Produtos com estoque baixo (≤ 5 unidades)
CREATE VIEW vw_estoque_baixo AS
SELECT 
    s.id_produto,
    s.nome,
    s.estoque_atual
FROM vw_saldo_estoque s
WHERE s.estoque_atual <= 5;

-- Vendas por dia/mês
CREATE VIEW vw_vendas_resumo AS
SELECT
    v.id AS id_venda,
    v.data_venda,
    DATE(v.data_venda) AS dia,
    MONTH(v.data_venda) AS mes,
    YEAR(v.data_venda) AS ano,
    SUM(ve.quantidade * ve.preco_unitario) AS total_venda
FROM venda v
JOIN venda_estoque ve ON ve.id_venda = v.id
GROUP BY v.id;

-- Para resumo diário:

CREATE VIEW vw_vendas_por_dia AS
SELECT dia, SUM(total_venda) AS total
FROM vw_vendas_resumo
GROUP BY dia;


-- Para resumo mensal:

CREATE VIEW vw_vendas_por_mes AS
SELECT ano, mes, SUM(total_venda) AS total
FROM vw_vendas_resumo
GROUP BY ano, mes;

