from flask import Blueprint, jsonify, request
from flask_bcrypt import generate_password_hash
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from app import db
from app.models import Usuario

usuario_bp = Blueprint('usuarios', __name__)

# FUNÇÃO AUXILIAR DE AUTORIZAÇÃO
def is_admin():
    """
    Verifica se o usuário logado no momento possui o nível de acesso 'admin'
    """
    id_usuario_logado = get_jwt_identity()
    usuario = Usuario.query.get(id_usuario_logado)

    if usuario and usuario.nivel_acesso == 'admin':
        return True
    return False


# ROTAS DE USUÁRIO
@usuario_bp.route('', methods=['POST'])
@jwt_required()
def criar_usuario():
    # Verificação de Permissão
    if not is_admin():
        return jsonify({"erro": "Acesso negado. Apenas administradores podem criar novos usuários."}), 403

    dados = request.get_json()
    nome = dados.get('nome_usuario')
    email = dados.get('email')
    senha = dados.get('senha')
    nivel_acesso = dados.get('nivel_acesso', 'vendedor')  # Padrão é vendedor

    if not nome or not email or not senha:
        return jsonify({"erro": "Nome, e-mail e senha são obrigatórios"}), 400

    if nivel_acesso not in ['admin', 'vendedor']:
        return jsonify({"erro": "Nível de acesso inválido. Use 'admin' ou 'vendedor'."}), 400

    senha_hash = generate_password_hash(senha).decode('utf-8')

    novo_usuario = Usuario(
        nome_usuario=nome,
        cpf=dados.get('cpf'),
        email=email,
        senha=senha_hash,
        nivel_acesso=nivel_acesso
    )

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({
            "mensagem": f"Usuário '{nome}' criado com sucesso!",
            "id_usuario": novo_usuario.id_usuario
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "Este e-mail já está cadastrado no sistema."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao criar usuário", "detalhes": str(e)}), 500


@usuario_bp.route('', methods=['GET'])
@jwt_required()
def listar_usuarios():
    # Verificação de Permissão
    if not is_admin():
        return jsonify({"erro": "Acesso negado. Apenas administradores podem visualizar a lista de usuários."}), 403

    usuarios = Usuario.query.all()
    lista_json = []

    for u in usuarios:
        lista_json.append({
            "id_usuario": u.id_usuario,
            "nome_usuario": u.nome_usuario,
            "cpf": u.cpf,
            "email": u.email,
            "nivel_acesso": u.nivel_acesso
            # Nunca retornamos a senha nem o hash
        })

    return jsonify(usuarios=lista_json), 200


@usuario_bp.route('/<int:id_usuario>', methods=['GET'])
@jwt_required()
def detalhar_usuario(id_usuario):
    if not is_admin():
        return jsonify({"erro": "Acesso negado."}), 403

    u = Usuario.query.get_or_404(id_usuario)
    return jsonify({
        "id_usuario": u.id_usuario,
        "nome_usuario": u.nome_usuario,
        "cpf": u.cpf,
        "email": u.email,
        "nivel_acesso": u.nivel_acesso
    }), 200


@usuario_bp.route('/<int:id_usuario>', methods=['PUT'])
@jwt_required()
def atualizar_usuario(id_usuario):
    if not is_admin():
        return jsonify({"erro": "Acesso negado. Apenas administradores podem editar usuários."}), 403

    u = Usuario.query.get_or_404(id_usuario)
    dados = request.get_json()

    u.nome_usuario = dados.get('nome_usuario', u.nome_usuario)
    u.cpf = dados.get('cpf', u.cpf)
    u.email = dados.get('email', u.email)

    # Atualização de Nível de Acesso
    novo_nivel = dados.get('nivel_acesso')
    if novo_nivel:
        if novo_nivel in ['admin', 'vendedor']:
            u.nivel_acesso = novo_nivel
        else:
            return jsonify({"erro": "Nível de acesso inválido."}), 400

    # Atualização de Senha
    nova_senha = dados.get('senha')
    if nova_senha:
        u.senha = generate_password_hash(nova_senha).decode('utf-8')

    try:
        db.session.commit()
        return jsonify({"mensagem": f"Usuário {id_usuario} atualizado com sucesso!"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "E-mail já em uso por outro usuário."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar usuário", "detalhes": str(e)}), 500


@usuario_bp.route('/<int:id_usuario>', methods=['DELETE'])
@jwt_required()
def deletar_usuario(id_usuario):
    if not is_admin():
        return jsonify({"erro": "Acesso negado. Apenas administradores podem excluir usuários."}), 403

    # Proteção: O admin não pode deletar a si mesmo
    id_usuario_logado = int(get_jwt_identity())
    if id_usuario == id_usuario_logado:
        return jsonify({"erro": "Operação não permitida. Você não pode excluir a sua própria conta."}), 400

    u = Usuario.query.get_or_404(id_usuario)

    try:
        db.session.delete(u)
        db.session.commit()
        return jsonify({"mensagem": f"Usuário '{u.nome_usuario}' deletado com sucesso!"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "erro": "Não é possível excluir este usuário pois ele possui histórico de pedidos ou movimentações atrelados a ele."
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar usuário", "detalhes": str(e)}), 500