CREATE DATABASE IF NOT EXISTS tropicalmix_db_2
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE tropicalmix_db_2;

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome_produto VARCHAR(150) NOT NULL, 
    sabor VARCHAR(50), 
    marca VARCHAR(100), 
    qtdd_atual INT DEFAULT 0, 
    data_vencimento DATE,
    preco_unitario DECIMAL(10,2) NOT NULL,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('admin','vendedor') DEFAULT 'vendedor'
);

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(14),
    telefone VARCHAR(20),
    email VARCHAR(150),
    endereco VARCHAR(255),
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    dt_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    mtd_pagamento ENUM('dinheiro','cartao_debito', 'cartao_credito','pix','boleto'),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS tipo_movimentacao(
	id_tipo_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
	tipo_movimentacao VARCHAR(150)
);
-- 1 entrada
-- 2 saida

CREATE TABLE IF NOT EXISTS movimentacao_estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_usuario INT NOT NULL,
    id_tipo_movimentacao INT NOT NULL,
    qtdd_movimentacao INT DEFAULT 0,
    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario), 
    FOREIGN KEY (id_tipo_movimentacao) REFERENCES tipo_movimentacao(id_tipo_movimentacao),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE IF NOT EXISTS item_pedido ( -- pedido_produto
    id_item_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    qtdd_pedido INT NOT NULL,
    preco_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (qtdd_pedido * preco_unitario) STORED,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS abastece (
    id_abastecimento INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    id_produto INT NOT NULL,
    dt_abastecimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    qtdd_recebida INT NOT NULL,
    valor_unitario DECIMAL(10,2),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

ALTER TABLE abastece
ADD COLUMN id_usuario INT NOT NULL,
ADD CONSTRAINT fk_abastece_usuario
FOREIGN KEY (id_usuario)
REFERENCES usuario(id_usuario);