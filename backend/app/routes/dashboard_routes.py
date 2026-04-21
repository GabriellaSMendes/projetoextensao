from flask import jsonify, Blueprint, send_file
from app.models import db, Pedido, Produto, ItemPedido
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
@jwt_required()
def get_dashboard_summary():
    """
    Retorna os Indicadores Chave para a tela de relatório.
    """
    # Faturamento Total
    total_faturamento = db.session.query(func.sum(ItemPedido.subtotal)).scalar() or 0

    # Quantidade Total de Pedidos Realizados
    total_pedidos = db.session.query(func.count(Pedido.id_pedido)).scalar() or 0

    # Produtos com Estoque baixo
    limite_baixo = 20
    baixo_stock = db.session.query(func.count(Produto.id_produto)) \
                      .filter(Produto.qtdd_atual < limite_baixo).scalar() or 0

    # Produto Mais Vendido
    top_produto = db.session.query(
        Produto.nome_produto,
        func.sum(ItemPedido.qtdd_pedido).label('total_vendido')
    ) \
        .join(ItemPedido) \
        .group_by(Produto.id_produto) \
        .order_by(desc('total_vendido')) \
        .first()

    return jsonify({
        "faturamento_total": str(total_faturamento),
        "total_pedidos": total_pedidos,
        "alertas_stock_baixo": baixo_stock,
        "produto_mais_vendido": {
            "nome": top_produto[0] if top_produto else "Nenhum",
            "quantidade": int(top_produto[1]) if top_produto else 0
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
        SELECT nome_produto AS nome,
               qtdd_atual AS quantidade
        FROM produto
        WHERE qtdd_atual < 20;
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
               SUM(ip.qtdd_pedido) AS total_vendido
        FROM item_pedido ip
        JOIN produto p ON p.id_produto = ip.id_produto
        GROUP BY ip.id_produto
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