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

    pedidos = db.relationship('Pedido', backref='vendedor', lazy=True)
    movimentacoes = db.relationship('MovimentacaoEstoque', backref='usuario', lazy=True)


class Cliente(db.Model):
    __tablename__ = 'cliente'
    id_cliente = db.Column(db.Integer, primary_key=True, autoincrement=True)
    razao_social = db.Column(db.String(100), nullable=False)
    cpf_cnpj = db.Column(db.String(14))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    endereco = db.Column(db.String(255))
    dt_cadastro = db.Column(db.DateTime, default=db.func.now())

    pedidos = db.relationship('Pedido', backref='cliente', lazy=True)


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
    qtdd_atual = db.Column(db.Integer, default=0)
    data_vencimento = db.Column(db.Date)
    preco_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    dt_cadastro = db.Column(db.DateTime, default=db.func.now())
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria'), nullable=False)

    itens_pedido = db.relationship('ItemPedido', backref='produto', lazy=True)
    abastecimentos = db.relationship('Abastece', backref='produto', lazy=True)
    movimentacoes = db.relationship('MovimentacaoEstoque', backref='produto', lazy=True)


# class Estoque(db.Model):
#     __tablename__ = 'estoque'
#     id_estoque = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     id_produto = db.Column(db.Integer, db.ForeignKey('produto.id_produto'), nullable=False, unique=True)
#     qtdd_atual = db.Column(db.Integer, default=0)
#     qtdd_entrada = db.Column(db.Integer, default=0)
#     qtdd_saida = db.Column(db.Integer, default=0)
#     ultima_atualizacao = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

#     abastecimentos = db.relationship('Abastece', backref='estoque', lazy=True)

#     itens_venda = db.relationship('VendaEstoque', backref='estoque', lazy=True)


class Fornecedor(db.Model):
    __tablename__ = 'fornecedor'
    id_fornecedor = db.Column(db.Integer, primary_key=True, autoincrement=True)
    razao_social = db.Column(db.String(150), nullable=False)
    cnpj = db.Column(db.String(18), unique=True)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150))

    abastecimentos = db.relationship('Abastece', backref='fornecedor', lazy=True)


# TABELAS DE TRANSAÇÃO (VENDAS e ABASTECIMENTO)
class Pedido(db.Model): # Era Venda
    __tablename__ = 'pedido'
    id_pedido = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey('cliente.id_cliente'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    dt_pedido = db.Column(db.DateTime, default=db.func.now())
    mtd_pagamento = db.Column(db.Enum('dinheiro', 'cartao_debito', 'cartao_credito', 'pix', 'boleto'))

    itens = db.relationship('ItemPedido', backref='pedido', lazy=True)

class Abastece(db.Model):
    __tablename__ = 'abastece'
    id_abastecimento = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_fornecedor = db.Column(db.Integer, db.ForeignKey('fornecedor.id_fornecedor'), nullable=False)
    id_produto = db.Column(db.Integer, db.ForeignKey('produto.id_produto'), nullable=False) # Agora liga direto no produto
    numero_lote = db.Column(db.String(50))
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    dt_abastecimento = db.Column(db.DateTime, default=db.func.now())
    qtdd_recebida = db.Column(db.Integer, nullable=False)
    qtdd_disponivel = db.Column(db.Integer)
    valor_unitario = db.Column(db.Numeric(10, 2))
    data_vencimento = db.Column(db.Date)

class ItemPedido(db.Model): # Era VendaEstoque
    __tablename__ = 'item_pedido'
    id_item_pedido = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id_pedido'), nullable=False)
    id_produto = db.Column(db.Integer, db.ForeignKey('produto.id_produto'), nullable=False)
    qtdd_pedido = db.Column(db.Integer, nullable=False)
    preco_unitario = db.Column(db.Numeric(10, 2))

# TABELAS DE HISTÓRICO E MOVIMENTAÇÃO
class TipoMovimentacao(db.Model):
    __tablename__ = 'tipo_movimentacao'
    id_tipo_movimentacao = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tipo_movimentacao = db.Column(db.String(150))

class MovimentacaoEstoque(db.Model):
    __tablename__ = 'movimentacao_estoque'
    id_estoque = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_produto = db.Column(db.Integer, db.ForeignKey('produto.id_produto'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    id_tipo_movimentacao = db.Column(db.Integer, db.ForeignKey('tipo_movimentacao.id_tipo_movimentacao'), nullable=False)
    qtdd_movimentacao = db.Column(db.Integer, default=0)
    ultima_atualizacao = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())