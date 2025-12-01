import mysql.connector
import pandas as pd
import matplotlib.pyplot as plt

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="aang_Zuko2",
    database="estoque_db"
)
cursor = db.cursor()


views_sql = [

    # Produtos prestes a vencer
    """
    CREATE OR REPLACE VIEW vw_produtos_prestes_vencer AS
    SELECT 
        p.id_produto,
        p.nome_produto,
        p.data_vencimento,
        DATEDIFF(p.data_vencimento, CURDATE()) AS dias_restantes
    FROM produto p
    WHERE p.data_vencimento IS NOT NULL
      AND p.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND p.data_vencimento >= CURDATE();
    """,

    # Estoque total
    """
    CREATE OR REPLACE VIEW vw_saldo_estoque AS
    SELECT 
        p.id_produto,
        p.nome_produto,
        p.id_categoria,
        SUM(
            CASE 
                WHEN e.qtdd_entrada > 0 THEN e.qtdd_entrada
                WHEN e.qtdd_saida > 0 THEN -e.qtdd_saida
            END
        ) AS estoque_atual
    FROM produto p
    LEFT JOIN estoque e ON p.id_produto = e.id_produto
    GROUP BY p.id_produto, p.nome_produto, p.id_categoria;
    """,

    # Produtos que estáo com o estoque baixo
    """
    CREATE OR REPLACE VIEW vw_estoque_baixo AS
    SELECT 
        s.id_produto,
        s.nome_produto,
        s.estoque_atual
    FROM vw_saldo_estoque s
    WHERE s.estoque_atual <= 5;
    """,

    # Vendas por dia
    """
    CREATE OR REPLACE VIEW vw_vendas_por_dia AS
    SELECT dia, SUM(total_venda) AS total
    FROM vw_vendas_resumo
    GROUP BY dia;
    """,

    # Vendas por mês
    """
    CREATE OR REPLACE VIEW vw_vendas_por_mes AS
    SELECT ano, mes, SUM(total_venda) AS total
    FROM vw_vendas_resumo
    GROUP BY ano, mes;
    """,

    # Custo médio de aquisição
    """
    CREATE OR REPLACE VIEW vw_custo_medio AS
    SELECT 
        p.id_produto,
        p.nome_produto,
        SUM(e.qtdd_entrada * e.qtdd_entrada) 
            / NULLIF(SUM(e.qtdd_entrada), 0)
        AS custo_medio
    FROM produto p
    LEFT JOIN abastece a ON a.id_estoque = p.id_produto
    LEFT JOIN estoque e ON e.id_estoque = a.id_estoque
    GROUP BY p.id_produto, p.nome_produto;
    """
]

for sql in views_sql:
    cursor.execute(sql)
db.commit()

# Parte dos gráficos
# Produtos por categoria
query_cat = """
SELECT c.nome AS categoria, COUNT(p.id_produto) AS total
FROM categoria c
LEFT JOIN produto p ON p.id_categoria = c.id_categoria
GROUP BY c.id_categoria;
"""
df_total_por_categoria = pd.read_sql(query_cat, db)

plt.bar(df_total_por_categoria["categoria"], df_total_por_categoria["total"])
plt.title("Total de produtos por categoria")
plt.xticks(rotation=45)
plt.ylabel("Quantidade de produtos")
plt.show()


# Estoque baixo
query_baixo = "SELECT * FROM vw_estoque_baixo;"
df_estoque_baixo = pd.read_sql(query_baixo, db)

plt.bar(df_estoque_baixo["nome_produto"], df_estoque_baixo["estoque_atual"])
plt.title("Produtos com estoque baixo")
plt.xticks(rotation=45)
plt.ylabel("Estoque")
plt.show()


# Mais vendidos
query_mais_vendidos = """
SELECT p.nome_produto, SUM(ve.qtdd_venda) AS total_vendido
FROM venda_estoque ve
JOIN produto p ON p.id_produto = ve.id_produto
GROUP BY p.id_produto
ORDER BY total_vendido DESC
LIMIT 10;
"""
df_top_vendidos = pd.read_sql(query_mais_vendidos, db)

plt.bar(df_top_vendidos["nome_produto"], df_top_vendidos["total_vendido"])
plt.title("Top 10 produtos mais vendidos")
plt.xticks(rotation=45)
plt.ylabel("Quantidade vendida")
plt.show()


# Produtos acabando ou vencendo
query_acabando_vencendo = """
SELECT p.nome_produto, s.estoque_atual, p.data_vencimento
FROM produto p
LEFT JOIN vw_saldo_estoque s ON s.id_produto = p.id_produto
WHERE s.estoque_atual <= 5 
   OR p.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY);
"""
df_acabando_vencendo = pd.read_sql(query_acabando_vencendo, db)

plt.bar(df_acabando_vencendo["nome_produto"], df_acabando_vencendo["estoque_atual"])
plt.title("Produtos acabando ou prestes a vencer")
plt.xticks(rotation=45)
plt.ylabel("Quantidade")
plt.show()


