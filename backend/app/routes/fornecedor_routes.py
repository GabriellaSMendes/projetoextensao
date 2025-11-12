from flask import request, jsonify, Blueprint
from sqlalchemy.exc import IntegrityError

from app.models import db, Fornecedor
from flask_jwt_extended import jwt_required

fornecedor_bp = Blueprint('fornecedores', __name__)


# ROTAS DE FORNECEDORES
@fornecedor_bp.route('', methods=['GET'])
@jwt_required()
def listar_fornecedores():
    """
    Lista todos os fornecedores.
    """
    fornecedores = Fornecedor.query.all()
    lista_json = []
    for f in fornecedores:
        lista_json.append({
            "id_fornecedor": f.id_fornecedor,
            "razao_social": f.razao_social,
            "cnpj": f.cnpj,
            "telefone": f.telefone,
            "email": f.email
        })
    return jsonify(fornecedores=lista_json), 200

@fornecedor_bp.route('', methods=['POST'])
@jwt_required()
def criar_fornecedor():
    """
    Cria um novo fornecedor.
    """
    dados = request.get_json()
    razao_social = dados.get('razao_social')
    cnpj = dados.get('cnpj')

    if not razao_social:
        return jsonify({"erro": "Razão Social é obrigatória"}), 400

    novo_fornecedor = Fornecedor(
        razao_social=razao_social,
        cnpj=cnpj,
        telefone=dados.get('telefone'),
        email=dados.get('email')
    )

    try:
        db.session.add(novo_fornecedor)
        db.session.commit()
        return jsonify({
            "mensagem": "Fornecedor criado com sucesso!",
            "id_fornecedor": novo_fornecedor.id_fornecedor
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        if 'cnpj' in str(e.orig):
            return jsonify({"erro": "CNPJ já cadastrado"}), 409
        return jsonify({"erro": "Erro de integridade no banco de dados", "detalhes": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao criar fornecedor", "detalhes": str(e)}), 500


@fornecedor_bp.route('/<int:id_fornecedor>', methods=['GET'])
@jwt_required()
def detalhar_fornecedor(id_fornecedor):
    """
    Busca um fornecedor.
    """
    f = Fornecedor.query.get_or_404(id_fornecedor)

    return jsonify({
        "id_fornecedor": f.id_fornecedor,
        "razao_social": f.razao_social,
        "cnpj": f.cnpj,
        "telefone": f.telefone,
        "email": f.email
    }), 200


@fornecedor_bp.route('/<int:id_fornecedor>', methods=['PUT'])
@jwt_required()
def atualizar_fornecedor(id_fornecedor):
    """
    Atualiza os dados de um fornecedor.
    """
    f = Fornecedor.query.get_or_404(id_fornecedor)
    dados = request.get_json()

    f.razao_social = dados.get('razao_social', f.razao_social)
    f.cnpj = dados.get('cnpj', f.cnpj)
    f.telefone = dados.get('telefone', f.telefone)
    f.email = dados.get('email', f.email)

    try:
        db.session.commit()
        return jsonify({"mensagem": f"Fornecedor {id_fornecedor} atualizado com sucesso!"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "Erro: CNPJ já pode estar em uso por outro fornecedor"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar fornecedor", "detalhes": str(e)}), 500


@fornecedor_bp.route('/<int:id_fornecedor>', methods=['DELETE'])
@jwt_required()
def deletar_fornecedor(id_fornecedor):
    """
    Deleta um fornecedor.
    """
    f = Fornecedor.query.get_or_404(id_fornecedor)

    try:
        db.session.delete(f)
        db.session.commit()
        return jsonify({"mensagem": f"Fornecedor {id_fornecedor} deletado com sucesso!"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "erro": "Não é possível deletar. O fornecedor está associado a registos de abastecimento."
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar fornecedor", "detalhes": str(e)}), 500