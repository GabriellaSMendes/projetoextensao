from flask import request, jsonify, Blueprint
from app.models import db, Cliente, Pedido
from app.utils import validar_cnpj, validar_cpf
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

cliente_bp = Blueprint('clientes', __name__)


# ROTAS DE CLIENTES
@cliente_bp.route('', methods=['GET'])
@jwt_required()
def listar_clientes():
    """
    Lista todos os clientes com a data da última compra.
    """

    ultima_compra_subquery = (
        db.session.query(
            Pedido.id_cliente,
            func.max(Pedido.dt_pedido).label("ultima_compra")
        )
        .group_by(Pedido.id_cliente)
        .subquery()
    )

    clientes = (
        db.session.query(
            Cliente,
            ultima_compra_subquery.c.ultima_compra
        )
        .outerjoin(
            ultima_compra_subquery,
            Cliente.id_cliente == ultima_compra_subquery.c.id_cliente
        )
        .order_by(Cliente.razao_social.asc())
        .all()
    )

    lista_json = []

    for c, ultima_compra in clientes:
        lista_json.append({
            "id_cliente": c.id_cliente,
            "razao_social": c.razao_social,
            "cpf_cnpj": c.cpf_cnpj,
            "telefone": c.telefone,
            "email": c.email,
            "endereco": c.endereco,
            "dt_cadastro": c.dt_cadastro.isoformat() if c.dt_cadastro else None,
            "ultima_compra": ultima_compra.isoformat() if ultima_compra else None
        })

    return jsonify(clientes=lista_json), 200

@cliente_bp.route('', methods=['POST'])
@jwt_required()
def criar_cliente():
    """
    Cria um novo cliente.
    """
    
    dados = request.get_json()
    razao_social = dados.get('razao_social')
    cpf_cnpj = dados.get('cpf_cnpj')
    if cpf_cnpj:
        # Remove pontos e traços para contar o tamanho
        doc_limpo = ''.join(filter(str.isdigit, cpf_cnpj))
        
        if len(doc_limpo) == 11: # É CPF
            if not validar_cpf(cpf_cnpj):
                return jsonify({"erro": "CPF inválido."}), 400
        elif len(doc_limpo) == 14: # É CNPJ
            if not validar_cnpj(cpf_cnpj):
                return jsonify({"erro": "CNPJ inválido."}), 400
        else:
            return jsonify({"erro": "Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos numéricos."}), 400 

    if not razao_social:
        return jsonify({"erro": "A Razão Social (ou Nome) é obrigatória"}), 400

    novo_cliente = Cliente(
        razao_social=razao_social,
        cpf_cnpj=dados.get('cpf_cnpj'),
        telefone=dados.get('telefone'),
        email=dados.get('email'),
        endereco=dados.get('endereco')
    )
    
    try:
        db.session.add(novo_cliente)
        db.session.commit()
        return jsonify({
            "mensagem": "Cliente criado com sucesso!",
            "id_cliente": novo_cliente.id_cliente
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao criar cliente", "detalhes": str(e)}), 500


@cliente_bp.route('/<int:id_cliente>', methods=['GET'])
@jwt_required()
def detalhar_cliente(id_cliente):
    """
    Busca um cliente.
    """
    c = Cliente.query.get_or_404(id_cliente)

    return jsonify({
        "id_cliente": c.id_cliente,
        "razao_social": c.razao_social,
        "cpf_cnpj": c.cpf_cnpj,
        "telefone": c.telefone,
        "email": c.email,
        "endereco": c.endereco,
        "dt_cadastro": c.dt_cadastro.isoformat() if c.dt_cadastro else None
    }), 200


@cliente_bp.route('/<int:id_cliente>', methods=['PUT'])
@jwt_required()
def atualizar_cliente(id_cliente):
    """
    Atualiza os dados de um cliente.
    """
    c = Cliente.query.get_or_404(id_cliente)
    dados = request.get_json()

    c.razao_social = dados.get('razao_social', c.razao_social)
    c.cpf_cnpj = dados.get('cpf_cnpj', c.cpf_cnpj)
    c.telefone = dados.get('telefone', c.telefone)
    c.email = dados.get('email', c.email)
    c.endereco = dados.get('endereco', c.endereco)

    try:
        db.session.commit()
        return jsonify({"mensagem": f"Cliente {id_cliente} atualizado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar cliente", "detalhes": str(e)}), 500


@cliente_bp.route('/<int:id_cliente>', methods=['DELETE'])
@jwt_required()
def deletar_cliente(id_cliente):
    """
    Deleta um cliente.
    """
    c = Cliente.query.get_or_404(id_cliente)

    try:
        db.session.delete(c)
        db.session.commit()
        return jsonify({"mensagem": f"Cliente {id_cliente} deletado com sucesso!"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "erro": "Não é possível deletar. O cliente está associado a pedidos."
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar cliente", "detalhes": str(e)}), 500