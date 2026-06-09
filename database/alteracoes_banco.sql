ALTER TABLE abastece
ADD COLUMN data_vencimento DATE NULL AFTER valor_unitario;

ALTER TABLE abastece
ADD COLUMN qtdd_disponivel INT NULL AFTER qtdd_recebida;

ALTER TABLE abastece
ADD COLUMN numero_lote VARCHAR(50) NULL AFTER id_produto;

ALTER TABLE produto
ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE produto
ADD COLUMN custo_unitario DECIMAL(10,2) NULL AFTER preco_unitario;

ALTER TABLE pedido
ADD COLUMN desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER mtd_pagamento;