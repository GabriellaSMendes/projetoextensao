from flask import jsonify, Blueprint
from app.models import db, Pedido, ItemPedido, Produto
from flask_jwt_extended import jwt_required
from sqlalchemy import func, desc

dashboard_bp = Blueprint('dashboard', __name__)


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