import os
from datetime import timedelta
import secrets


class Config:
    """Configuração base."""
    SECRET_KEY = secrets.token_hex(32)

    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:Judo09041003.@localhost/tropicalmix_db' # ATUALIZAR PARA CONECTAR AO DB
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = SECRET_KEY

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}