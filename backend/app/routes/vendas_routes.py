from flask import request, jsonify, Blueprint
from app.models import db, Venda, VendaEstoque, Cliente, Produto, Estoque
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload
from decimal import Decimal
from datetime import date

vendas_bp = Blueprint('vendas', __name__)


# ROTAS DE VENDAS
@vendas_bp.route('', methods=['GET'])
@jwt_required()
def listar_vendas():
    """
    Lista o histórico de vendas
    """
    vendas = db.session.query(Venda).options(
        joinedload(Venda.cliente),
        joinedload(Venda.vendedor)
    ).order_by(Venda.dt_venda.desc()).all()

    lista_json = []
    for v in vendas:
        lista_json.append({
            "id_venda": v.id_venda,
            "dt_venda": v.dt_venda.isoformat(),
            "valor_total": str(v.valor_total),
            "mtd_pagamento": v.mtd_pagamento,
            "id_cliente": v.id_cliente,
            "nome_cliente": v.cliente.nome_cliente if v.cliente else "Cliente não encontrado",
            "id_usuario": v.id_usuario,
            "nome_vendedor": v.vendedor.nome_usuario if v.vendedor else "Vendedor não encontrado"
        })
    return jsonify(vendas=lista_json), 200

@vendas_bp.route('', methods=['POST'])
@jwt_required()
def criar_venda():
    """
    Regista uma nova venda.
    """
    dados = request.get_json()

    id_cliente = dados.get('id_cliente')
    mtd_pagamento = dados.get('mtd_pagamento')
    itens_venda = dados.get('itens')

    id_usuario_logado = int(get_jwt_identity())

    if not id_cliente or not mtd_pagamento or not itens_venda:
        return jsonify({"erro": "id_cliente, mtd_pagamento e itens são obrigatórios"}), 400

    if not Cliente.query.get(id_cliente):
        return jsonify({"erro": "Cliente não encontrado"}), 404

    try:
        valor_total_calculado = Decimal('0.0')
        itens_para_processar = []

        for item_req in itens_venda:
            id_produto = item_req.get('id_produto')
            qtdd_desejada = item_req.get('quantidade')

            if not id_produto or not qtdd_desejada or qtdd_desejada <= 0:
                return jsonify({"erro": "Item inválido no carrinho"}), 400

            produto = Produto.query.get(id_produto)
            estoque = Estoque.query.filter_by(id_produto=id_produto).first()

            if not produto or not estoque:
                return jsonify({"erro": f"Produto com ID {id_produto} não encontrado ou sem estoque."}), 404

            if produto.data_vencimento < date.today():
                raise Exception(
                    f"Operação bloqueada: O produto '{produto.nome_produto}' está vencido desde {produto.data_vencimento.strftime('%d/%m/%Y')}.")

            if estoque.qtdd_atual < qtdd_desejada:
                raise Exception(
                    f"Estoque insuficiente para '{produto.nome_produto}'. Pedido: {qtdd_desejada}, Disponível: {estoque.qtdd_atual}")

            preco_unitario_venda = produto.preco_unitario
            subtotal_item = preco_unitario_venda * Decimal(qtdd_desejada)
            valor_total_calculado += subtotal_item

            itens_para_processar.append({
                "produto": produto,
                "estoque": estoque,
                "quantidade": qtdd_desejada,
                "preco_unitario_venda": preco_unitario_venda
            })

        nova_venda = Venda(
            id_cliente=id_cliente,
            id_usuario=id_usuario_logado,
            valor_total=valor_total_calculado,
            mtd_pagamento=mtd_pagamento
        )
        db.session.add(nova_venda)

        for item in itens_para_processar:
            estoque_obj = item['estoque']
            estoque_obj.qtdd_atual -= item['quantidade']
            estoque_obj.qtdd_saida += item['quantidade']

            novo_item_venda = VendaEstoque(
                id_estoque=estoque_obj.id_estoque,
                id_produto=item['produto'].id_produto,
                qtdd_venda=item['quantidade'],
                preco_unitario=item['preco_unitario_venda'],
                venda=nova_venda
            )
            db.session.add(novo_item_venda)

        db.session.commit()

        return jsonify({
            "mensagem": "Venda registada com sucesso!",
            "id_venda": nova_venda.id_venda,
            "valor_total": str(nova_venda.valor_total)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao processar a venda", "detalhes": str(e)}), 500


@vendas_bp.route('/<int:id_venda>', methods=['GET'])
@jwt_required()
def detalhar_venda(id_venda):
    """
    Busca uma venda.
    """
    venda = db.session.query(Venda).options(
        joinedload(Venda.cliente),
        joinedload(Venda.vendedor),
        joinedload(Venda.itens).joinedload(VendaEstoque.produto)
    ).filter(Venda.id_venda == id_venda).first()

    if not venda:
        return jsonify({"erro": "Venda não encontrada"}), 404

    itens_vendidos_json = []
    for item in venda.itens:
        itens_vendidos_json.append({
            "id_produto": item.id_produto,
            "nome_produto": item.produto.nome_produto if item.produto else "Produto não encontrado",
            "qtdd_venda": item.qtdd_venda,
            "preco_unitario_na_venda": str(item.preco_unitario),
            "subtotal": str(item.preco_unitario * Decimal(item.qtdd_venda))
        })

    return jsonify({
        "id_venda": venda.id_venda,
        "dt_venda": venda.dt_venda.isoformat(),
        "valor_total": str(venda.valor_total),
        "mtd_pagamento": venda.mtd_pagamento,
        "cliente": {
            "id_cliente": venda.id_cliente,
            "nome_cliente": venda.cliente.nome_cliente if venda.cliente else None
        },
        "vendedor": {
            "id_usuario": venda.id_usuario,
            "nome_vendedor": venda.vendedor.nome_usuario if venda.vendedor else None
        },
        "itens_vendidos": itens_vendidos_json
    }), 200