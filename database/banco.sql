CREATE DATABASE tropicalmix_db;
USE tropicalmix_db;

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
    quantidade INT DEFAULT 0,
    data_vencimento DATE,
    preco_unitario DECIMAL(10,2) NOT NULL,
    dt_cadastro DATE,
    id_categoria INT,
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
    nome_cliente VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    email VARCHAR(150),
    endereco VARCHAR(255),
    dt_cadastro DATE
);

CREATE TABLE IF NOT EXISTS venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    dt_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2),
    mtd_pagamento ENUM('dinheiro','cartao','pix','outros'),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    qtdd_atual INT DEFAULT 0,
    qtdd_entrada INT DEFAULT 0,
    qtdd_saida INT DEFAULT 0,
    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    id_estoque INT NOT NULL,
    dt_abastecimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    qtdd_recebida INT NOT NULL,
    valor_unitario DECIMAL(10,2),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_estoque) REFERENCES estoque(id_estoque)
);

CREATE TABLE IF NOT EXISTS venda_estoque (
    id_venda_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_estoque INT NOT NULL,
    id_produto INT NOT NULL,
    qtdd_venda INT NOT NULL,
    preco_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (qtdd_venda * preco_unitario) STORED, 
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    FOREIGN KEY (id_estoque) REFERENCES estoque(id_estoque)
);
