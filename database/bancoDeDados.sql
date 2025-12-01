CREATE DATABASE IF NOT EXISTS estoque_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE estoque_db;

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255)
);

CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    id_categoria INT NOT NULL,
    id_fornecedor INT NOT NULL,
    preco_custo DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    data_validade DATE NULL,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE,
    CONSTRAINT fk_produto_fornecedor FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id) ON DELETE CASCADE
);


CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('admin','vendedor') DEFAULT 'vendedor'
);

CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome_cliente VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    email VARCHAR(150),
    endereco VARCHAR(255),
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    dt_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2),
    mtd_pagamento ENUM('dinheiro','cartao','pix','outros'),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
    origem ENUM('COMPRA', 'VENDA', 'AJUSTE') NOT NULL,
    id_origem INT NULL,
    CONSTRAINT fk_estoque_produto FOREIGN KEY (id_produto) REFERENCES produto(id) ON DELETE CASCADE
);


CREATE TABLE venda_estoque (
    id_venda_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_estoque INT NOT NULL,
    id_produto INT NOT NULL,
    qtdd_venda INT NOT NULL,
    preco_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (qtdd_venda * preco_unitario) STORED,
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_estoque) REFERENCES estoque(id_estoque) ON DELETE CASCADE
);

CREATE TABLE fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150)
);

CREATE TABLE abastece (
    id_abastecimento INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    id_estoque INT NOT NULL,
    dt_abastecimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    qtdd_recebida INT NOT NULL,
    valor_unitario DECIMAL(10,2),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE,
    FOREIGN KEY (id_estoque) REFERENCES estoque(id_estoque) ON DELETE CASCADE
);
