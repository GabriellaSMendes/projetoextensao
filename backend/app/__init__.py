from flask import Flask
from flask_jwt_extended import JWTManager
from app.config import config_by_name
from app.models import db

jwt = JWTManager()

def create_app(config_name='default'):
    """
    Applicaton Factory: cria a instância do flask
    """
    app = Flask(__name__)

    app.config.from_object(config_by_name[config_name])

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

    from app.routes.vendas_routes import vendas_bp
    app.register_blueprint(vendas_bp, url_prefix='/api/vendas')

    from app.routes.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    @app.route('/health')
    def health_check():
        return "API Tropical Mix no ar!", 200

    return app