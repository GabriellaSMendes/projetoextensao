from flask import request, jsonify, Blueprint
from app.models import db, Pedido, ItemPedido, Cliente, Produto, Usuario
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload
from datetime import date

pedido_bp = Blueprint('pedidos', __name__)

# ROTAS DE VENDAS
@pedido_bp.route('', methods=['GET'])
@jwt_required()
def listar_pedidos():
    pedidos = db.session.query(Pedido).options(
        joinedload(Pedido.cliente),
        joinedload(Pedido.vendedor)
    ).order_by(Pedido.dt_pedido.desc()).all()

    lista_json = []
    for p in pedidos:
        lista_json.append({
            "id_pedido": p.id_pedido,
            "dt_pedido": p.dt_pedido.isoformat() if p.dt_pedido else None,
            "mtd_pagamento": p.mtd_pagamento,
            "desconto": str(p.desconto or 0),
            "cliente": p.cliente.razao_social if p.cliente else None,
            "vendedor": p.vendedor.nome_usuario if p.vendedor else None
        })
    return jsonify(pedidos=lista_json), 200


@pedido_bp.route('', methods=['POST'])
@jwt_required()
def criar_pedido():
    """
    Registra um novo pedido
    """
    dados = request.get_json()

    id_cliente = dados.get('id_cliente')
    mtd_pagamento = dados.get('mtd_pagamento')
    itens_pedido = dados.get('itens')
    desconto = dados.get("desconto", 0)

    id_usuario_logado = int(get_jwt_identity())
    
    usuario_logado = Usuario.query.get(id_usuario_logado)
    id_usuario_payload = dados.get("id_usuario")

    if usuario_logado and usuario_logado.nivel_acesso == "admin" and id_usuario_payload:
        id_usuario_venda = int(id_usuario_payload)
    else:
        id_usuario_venda = id_usuario_logado

    if not id_cliente or not mtd_pagamento or not itens_pedido:
        return jsonify({"erro": "id_cliente, mtd_pagamento e itens são obrigatórios"}), 400

    if not Cliente.query.get(id_cliente):
        return jsonify({"erro": "Cliente não encontrado"}), 404

    try:
        # Cria o cabeçalho do Pedido
        novo_pedido = Pedido(
            id_cliente=id_cliente,
            id_usuario=id_usuario_venda,
            mtd_pagamento=mtd_pagamento,
            desconto=desconto or 0
        )
        db.session.add(novo_pedido)

        db.session.flush()

        # Adiciona os Itens do Pedido
        for item_req in itens_pedido:
            id_produto = item_req.get('id_produto')
            qtdd_pedido = item_req.get('qtdd_pedido')

            produto = Produto.query.get(id_produto)
            if not produto:
                raise ValueError(f"Produto ID {id_produto} não encontrado.")

            # Regra de Negócio: Produto Vencido
            if produto.data_vencimento and produto.data_vencimento < date.today():
                raise ValueError(f"O produto '{produto.nome_produto}' está vencido e não pode ser vendido.")

            # Cria o item do pedido, no commit o banco vai disparar os triggers.
            # Se não houver estoque, o banco vai lançar um erro e cancelar tudo.
            novo_item = ItemPedido(
                id_pedido=novo_pedido.id_pedido,
                id_produto=id_produto,
                qtdd_pedido=qtdd_pedido,
                preco_unitario=produto.preco_unitario
            )
            db.session.add(novo_item)

        db.session.commit()

        return jsonify({
            "mensagem": "Pedido registrado com sucesso! Estoque atualizado automaticamente.",
            "id_pedido": novo_pedido.id_pedido
        }), 201

    except Exception as e:
        db.session.rollback()
        mensagem_erro = str(e)
        return jsonify({"erro": "Não foi possível concluir o pedido.", "detalhes": mensagem_erro}), 400


@pedido_bp.route('/<int:id_pedido>', methods=['GET'])
@jwt_required()
def detalhar_pedido(id_pedido):
    pedido = db.session.query(Pedido).options(
        joinedload(Pedido.cliente),
        joinedload(Pedido.vendedor),
        joinedload(Pedido.itens).joinedload(ItemPedido.produto)
    ).filter(Pedido.id_pedido == id_pedido).first()

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404

    itens_json = []
    subtotal_pedido = 0

    for item in pedido.itens:
        preco_unitario = float(item.preco_unitario or 0)
        quantidade = int(item.qtdd_pedido or 0)
        subtotal_item = preco_unitario * quantidade

        subtotal_pedido += subtotal_item

        itens_json.append({
            "id_produto": item.id_produto,
            "nome_produto": item.produto.nome_produto if item.produto else None,
            "qtdd_pedido": quantidade,
            "preco_unitario": str(preco_unitario),
            "subtotal": str(subtotal_item)
        })

    desconto = float(pedido.desconto or 0)
    total_pedido = max(subtotal_pedido - desconto, 0)

    return jsonify({
        "id_pedido": pedido.id_pedido,
        "dt_pedido": pedido.dt_pedido.isoformat() if pedido.dt_pedido else None,
        "mtd_pagamento": pedido.mtd_pagamento,
        "desconto": str(desconto),
        "subtotal": str(subtotal_pedido),
        "total": str(total_pedido),
        "cliente": pedido.cliente.razao_social if pedido.cliente else None,
        "vendedor": pedido.vendedor.nome_usuario if pedido.vendedor else None,
        "itens": itens_json
    }), 200