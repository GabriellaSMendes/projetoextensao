from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# MODELOS DE AUTENTICAÇÃO e USUÁRIOS
class Usuario(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome_usuario = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14))
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    nivel_acesso = db.Column(db.Enum('admin', 'vendedor'), default='vendedor')

    vendas = db.relationship('Venda', backref='vendedor', lazy=True)


class Cliente(db.Model):
    __tablename__ = 'cliente'
    id_cliente = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome_cliente = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    endereco = db.Column(db.String(255))
    dt_cadastro = db.Column(db.Date, default=db.func.current_date())

    vendas = db.relationship('Venda', backref='cliente', lazy=True)


# MODELOS DE CATÁLOGO e ESTOQUE
class Categoria(db.Model):
    __tablename__ = 'categoria'
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(255), nullable=True)

    produtos = db.relationship('Produto', backref='categoria', lazy=True)


class Produto(db.Model):
    __tablename__ = 'produto'
    id_produto = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome_produto = db.Column(db.String(150), nullable=False)
    sabor = db.Column(db.String(50))
    marca = db.Column(db.String(100))

    quantidade = db.Column(db.Integer, default=0) # <-----

    data_vencimento = db.Column(db.Date)
    preco_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    dt_cadastro = db.Column(db.Date, default=db.func.current_date())
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria'), nullable=True)

    estoque = db.relationship('Estoque', backref='produto', lazy=True, uselist=False)

    itens_venda = db.relationship('VendaEstoque', backref='produto', lazy=True)


class Estoque(db.Model):
    __tablename__ = 'estoque'
    id_estoque = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_produto = db.Column(db.Integer, db.ForeignKey('produto.id_produto'), nullable=False, unique=True)
    qtdd_atual = db.Column(db.Integer, default=0)
    qtdd_entrada = db.Column(db.Integer, default=0)
    qtdd_saida = db.Column(db.Integer, default=0)
    ultima_atualizacao = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    abastecimentos = db.relationship('Abastece', backref='estoque', lazy=True)

    itens_venda = db.relationship('VendaEstoque', backref='estoque', lazy=True)


class Fornecedor(db.Model):
    __tablename__ = 'fornecedor'
    id_fornecedor = db.Column(db.Integer, primary_key=True, autoincrement=True)
    razao_social = db.Column(db.String(150), nullable=False)
    cnpj = db.Column(db.String(18), unique=True)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150))

    abastecimentos = db.relationship('Abastece', backref='fornecedor', lazy=True)


# TABELAS DE TRANSAÇÃO (VENDAS e ABASTECIMENTO)
class Venda(db.Model):
    __tablename__ = 'venda'
    id_venda = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey('cliente.id_cliente'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    dt_venda = db.Column(db.DateTime, default=db.func.now())
    valor_total = db.Column(db.Numeric(10, 2))
    mtd_pagamento = db.Column(db.Enum('dinheiro', 'cartao', 'pix', 'outros'))

    itens = db.relationship('VendaEstoque', backref='venda', lazy=True)

class Abastece(db.Model):
    __tablename__ = 'abastece'
    id_abastecimento = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_fornecedor = db.Column(db.Integer, db.ForeignKey('fornecedor.id_fornecedor'), nullable=False)
    id_estoque = db.Column(db.Integer, db.ForeignKey('estoque.id_estoque'), nullable=False)
    dt_abastecimento = db.Column(db.DateTime, default=db.func.now())
    qtdd_recebida = db.Column(db.Integer, nullable=False)
    valor_unitario = db.Column(db.Numeric(10, 2))


# TABELA ASOCIATIVA
class VendaEstoque(db.Model):
    __tablename__ = 'venda_estoque'
    id_venda_estoque = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_venda = db.Column(db.Integer, db.ForeignKey('venda.id_venda'), nullable=False)
    id_estoque = db.Column(db.Integer, db.ForeignKey('estoque.id_estoque'), nullable=False)
    id_produto = db.Column(db.Integer, db.ForeignKey('produto.id_produto'), nullable=False)
    qtdd_venda = db.Column(db.Integer, nullable=False)
    preco_unitario = db.Column(db.Numeric(10, 2))
    # subtotal?