from flask import Flask, request, jsonify
from db import db
from models import User
import pymysql
pymysql.install_as_MySQLdb()


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/tropical_mix' # ATUALIZAR PARA CONECTAR AO BD
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# CREATE - Registrar novo usuário
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Usuário já existe!'}), 400

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Usuário criado com sucesso!'}), 201

# READ - Listar todos os usuários
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    result = [{'id': u.id, 'email': u.email} for u in users]
    return jsonify(result)

# UPDATE - Atualizar senha
@app.route('/api/update/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    new_password = data.get('password')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado!'}), 404

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Senha atualizada com sucesso!'})

# DELETE - Excluir usuário
@app.route('/api/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado!'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'Usuário excluído com sucesso!'})

# LOGIN - Verificar credenciais
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return jsonify({'message': 'Login realizado com sucesso!'})
    else:
        return jsonify({'error': 'Usuário ou senha incorretos!'}), 401

if __name__ == '__main__':
    app.run(debug=True)
