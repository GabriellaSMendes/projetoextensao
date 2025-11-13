from flask import request, jsonify, Blueprint
from app.models import db, Cliente
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

cliente_bp = Blueprint('clientes', __name__)


# ROTAS DE CLIENTES
@cliente_bp.route('', methods=['GET'])
@jwt_required()
def listar_clientes():
    """
    Lista todos os clientes.
    """
    clientes = Cliente.query.all()
    lista_json = []
    for c in clientes:
        lista_json.append({
            "id_cliente": c.id_cliente,
            "nome_cliente": c.nome_cliente,
            "cpf": c.cpf,
            "telefone": c.telefone,
            "email": c.email,
            "endereco": c.endereco,
            "dt_cadastro": c.dt_cadastro.isoformat() if c.dt_cadastro else None
        })
    return jsonify(clientes=lista_json), 200

@cliente_bp.route('', methods=['POST'])
@jwt_required()
def criar_cliente():
    """
    Cria um novo cliente.
    """
    dados = request.get_json()
    nome_cliente = dados.get('nome_cliente')

    if not nome_cliente:
        return jsonify({"erro": "Nome do cliente é obrigatório"}), 400

    novo_cliente = Cliente(
        nome_cliente=nome_cliente,
        cpf=dados.get('cpf'),
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
        "nome_cliente": c.nome_cliente,
        "cpf": c.cpf,
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

    c.nome_cliente = dados.get('nome_cliente', c.nome_cliente)
    c.cpf = dados.get('cpf', c.cpf)
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
            "erro": "Não é possível deletar. O cliente está associado a vendas."
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar cliente", "detalhes": str(e)}), 500