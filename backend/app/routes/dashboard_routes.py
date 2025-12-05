from flask import jsonify, Blueprint, send_file
from app.models import db, Venda, Estoque, Produto, VendaEstoque
from flask_jwt_extended import jwt_required
from sqlalchemy import func, desc
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io
from matplotlib.figure import Figure

dashboard_bp = Blueprint('dashboard', __name__)

def gerar_grafico(df, x, y, titulo):
    # Cria figura isolada (NÃO usa plt)
    fig = Figure(figsize=(5, 4))
    ax = fig.subplots()

    # Gera o gráfico
    ax.bar(df[x], df[y], color="#ffd262")
    ax.set_title(titulo)
    ax.tick_params(axis="x", rotation=45)

    # Salva no buffer
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)

    return buffer

@dashboard_bp.route('/resumo', methods=['GET'])

def get_dashboard_summary():
    """
    Retorna os Indicadores Chave para a tela de relatório.
    """

    # Total das Vendas (Valor em Dinheiro)
    total_faturamento = db.session.query(func.sum(Venda.valor_total)).scalar() or 0

    # Quantidade de Vendas Realizadas
    total_vendas_count = db.session.query(func.count(Venda.id_venda)).scalar() or 0

    # Produtos com Estoque Baixo (Ex: 20 unidades)
    limite_baixo_estoque = 20 # ALTERE AQUI
    produtos_baixo_estoque = db.session.query(func.count(Estoque.id_estoque)) \
                                 .filter(Estoque.qtdd_atual < limite_baixo_estoque).scalar() or 0

    # Produto Mais Vendido
    top_produto = db.session.query(
        Produto.nome_produto,
        func.sum(VendaEstoque.qtdd_venda).label('total_vendido')
    ) \
        .join(VendaEstoque, Produto.id_produto == VendaEstoque.id_produto) \
        .group_by(Produto.nome_produto) \
        .order_by(desc('total_vendido')) \
        .first()

    top_produto_nome = top_produto[0] if top_produto else "Nenhum"
    top_produto_qtd = int(top_produto[1]) if top_produto else 0

    return jsonify({
        "faturamento_total": str(total_faturamento),
        "total_vendas_realizadas": total_vendas_count,
        "alertas_estoque_baixo": produtos_baixo_estoque,
        "produto_campeao": {
            "nome": top_produto_nome,
            "quantidade_vendida": top_produto_qtd
        }
    }), 200
    
 
#   GRÁFICO — Produtos por Categoria
@dashboard_bp.get("/graficos/categorias")
def grafico_categorias():
    df = pd.read_sql("""
        SELECT c.nome AS categoria,
               COUNT(p.id_produto) AS total
        FROM categoria c
        LEFT JOIN produto p ON p.id_categoria = c.id_categoria
        GROUP BY c.id_categoria;
    """, db.engine)

    if df.empty:
        df = pd.DataFrame({"categoria": ["Nenhuma"], "total": [0]})

    return send_file(
        gerar_grafico(df, "categoria", "total", "Produtos por Categoria"),
        mimetype="image/png"
    )


#   GRÁFICO — Estoque Baixo
@dashboard_bp.get("/graficos/estoque_baixo")
def grafico_estoque_baixo():
    df = pd.read_sql("""
        SELECT p.nome_produto AS nome,
               e.qtdd_atual AS quantidade
        FROM estoque e
        JOIN produto p ON p.id_produto = e.id_produto
        WHERE e.qtdd_atual < 20;
    """, db.engine)

    if df.empty:
        df = pd.DataFrame({"nome": ["Nenhum"], "quantidade": [0]})

    return send_file(
        gerar_grafico(df, "nome", "quantidade", "Estoque Baixo"),
        mimetype="image/png"
    )


#   GRÁFICO — TOP 10 Produtos Vendidos
@dashboard_bp.get("/graficos/top10")
def grafico_top10():
    df = pd.read_sql("""
        SELECT p.nome_produto AS nome,
               SUM(ve.qtdd_venda) AS total_vendido
        FROM venda_estoque ve
        JOIN produto p ON p.id_produto = ve.id_produto
        GROUP BY ve.id_produto
        ORDER BY total_vendido DESC
        LIMIT 10;
    """, db.engine)

    if df.empty:
        df = pd.DataFrame({"nome": ["Nenhum"], "total_vendido": [0]})

    return send_file(
        gerar_grafico(df, "nome", "total_vendido", "Top 10 Mais Vendidos"),
        mimetype="image/png"
    )


#   GRÁFICO — Produtos próximos da validade
@dashboard_bp.get("/validade")
def produtos_validade():

    df = pd.read_sql("""
        SELECT 
            p.nome_produto,
            p.data_vencimento,
            DATEDIFF(p.data_vencimento, CURDATE()) AS dias_restantes
        FROM produto p
        WHERE p.data_vencimento IS NOT NULL
        ORDER BY dias_restantes ASC;
    """, db.engine)

    # Transformar em JSON
    return jsonify(df.to_dict(orient="records")), 200