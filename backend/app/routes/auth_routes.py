from flask import request, jsonify, Blueprint
from app.models import db, Usuario
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

bcrypt = Bcrypt()

@auth_bp.route('/registrar', methods=['POST'])
def registrar():
    dados = request.get_json()
    nome_usuario = dados.get('nome_usuario')
    email = dados.get('email')
    senha_plana = dados.get('senha')

    if not nome_usuario or not email or not senha_plana:
        return jsonify({"erro": "Nome, email e senha são obrigatórios"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"erro": "Email já cadastrado"}), 409

    senha_hash = bcrypt.generate_password_hash(senha_plana).decode('utf-8')

    novo_usuario = Usuario(
        nome_usuario=nome_usuario,
        email=email,
        senha=senha_hash,
        nivel_acesso=dados.get('nivel_acesso', 'vendedor'),
        cpf=dados.get('cpf')
    )

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"mensagem": f"Usuário '{nome_usuario}' registrado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao registrar usuário", "detalhes": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get('email')
    senha_plana = dados.get('senha')

    if not email or not senha_plana:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    usuario = Usuario.query.filter_by(email=email).first()

    if usuario and bcrypt.check_password_hash(usuario.senha, senha_plana):
        identity = str(usuario.id_usuario)

        additional_claims = {
            "email": usuario.email,
            "nivel": usuario.nivel_acesso,
            "nome": usuario.nome_usuario
        }

        access_token = create_access_token(
            identity=identity,
            additional_claims=additional_claims
        )

        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"erro": "Email ou senha inválidos"}), 401


# @auth_bp.route('/perfil', methods=['GET'])
# @jwt_required()
# def get_profile():
#     """
#     Uma rota protegida para teste.
#     """
#
#     current_user_id = get_jwt_identity()
#
#     token_data = get_jwt()
#
#     user_email = token_data.get("email")
#     user_level = token_data.get("nivel")
#     user_name = token_data.get("nome")
#
#     return jsonify(
#         logged_in_as={
#             "id": current_user_id,
#             "email": user_email,
#             "nivel": user_level,
#             "nome": user_name
#         },
#         message="O seu token é válido!"
#     ), 200