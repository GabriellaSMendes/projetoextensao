from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import config_by_name
from app.models import db

jwt = JWTManager()

def create_app(config_name='default'):
    """
    Applicaton Factory: cria a instância do flask
    """
    app = Flask(__name__)

    app.config.from_object(config_by_name[config_name])
    
    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.routes.estoque_routes import estoque_bp
    app.register_blueprint(estoque_bp, url_prefix='/api/estoque')

    from app.routes.fornecedor_routes import fornecedor_bp
    app.register_blueprint(fornecedor_bp, url_prefix='/api/fornecedores')

    from app.routes.cliente_routes import cliente_bp
    app.register_blueprint(cliente_bp, url_prefix='/api/clientes')

    from app.routes.pedido_routes import pedido_bp
    app.register_blueprint(pedido_bp, url_prefix='/api/pedidos')

    from app.routes.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    from app.routes.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix='/api/usuarios')

    @app.route('/health')
    def health_check():
        return "API Tropical Mix no ar!", 200

    return app