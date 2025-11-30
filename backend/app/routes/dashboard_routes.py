from flask import jsonify, Blueprint
from app.models import db, Venda, Estoque, Produto, VendaEstoque
from flask_jwt_extended import jwt_required
from sqlalchemy import func, desc

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/resumo', methods=['GET'])
@jwt_required()
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