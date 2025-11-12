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

    @app.route('/health')
    def health_check():
        return "API Tropical Mix no ar!", 200

    return app