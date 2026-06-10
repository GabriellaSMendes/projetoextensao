import os
from datetime import timedelta
import secrets
from urllib.parse import quote_plus


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AIVEN_CA_PATH = os.path.join(BASE_DIR, "aiven-ca.pem")


def montar_database_url():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    db_user = os.getenv("DB_USER", "root")
    db_password = quote_plus(os.getenv("DB_PASSWORD", "root"))
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "tropicalmix_db")

    return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


class Config:
    """Configuração base."""
    SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))

    SQLALCHEMY_DATABASE_URI =  montar_database_url()

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "ca": AIVEN_CA_PATH
            }
        }
    }

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

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