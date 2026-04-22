USE tropicalmix_db_2;

-- INSERÇÃO DE TRIGGERS
DELIMITER $$

CREATE TRIGGER trg_item_pedido_before_insert
BEFORE INSERT ON item_pedido
FOR EACH ROW
BEGIN
    DECLARE qtd_atual INT;

    SELECT qtdd_atual
    INTO qtd_atual
    FROM produto
    WHERE id_produto = NEW.id_produto;

    IF NEW.qtdd_pedido > qtd_atual THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Estoque insuficiente para realizar a venda.';
    END IF;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_item_pedido_before_update
BEFORE UPDATE ON item_pedido
FOR EACH ROW
BEGIN

    DECLARE qtd_atual INT;
    DECLARE diferenca INT;

    SELECT qtdd_atual
    INTO qtd_atual
    FROM produto
    WHERE id_produto = OLD.id_produto;

    SET diferenca = NEW.qtdd_pedido - OLD.qtdd_pedido;

    IF diferenca > 0 AND diferenca > qtd_atual THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Estoque insuficiente para atualizar a venda.';
    END IF;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_item_pedido_after_insert
AFTER INSERT ON item_pedido
FOR EACH ROW
BEGIN

    UPDATE produto
    SET qtdd_atual = qtdd_atual - NEW.qtdd_pedido
    WHERE id_produto = NEW.id_produto;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_item_pedido_after_update
AFTER UPDATE ON item_pedido
FOR EACH ROW
BEGIN

    UPDATE produto
    SET qtdd_atual = qtdd_atual + OLD.qtdd_pedido - NEW.qtdd_pedido
    WHERE id_produto = NEW.id_produto;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_item_pedido_after_delete
AFTER DELETE ON item_pedido
FOR EACH ROW
BEGIN

    UPDATE produto
    SET qtdd_atual = qtdd_atual + OLD.qtdd_pedido
    WHERE id_produto = OLD.id_produto;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_abastece_after_insert
AFTER INSERT ON abastece
FOR EACH ROW
BEGIN

    UPDATE produto
    SET qtdd_atual = qtdd_atual + NEW.qtdd_recebida
    WHERE id_produto = NEW.id_produto;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_abastece_after_update
AFTER UPDATE ON abastece
FOR EACH ROW
BEGIN

    UPDATE produto
    SET qtdd_atual = qtdd_atual - OLD.qtdd_recebida + NEW.qtdd_recebida
    WHERE id_produto = NEW.id_produto;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_abastece_after_delete
AFTER DELETE ON abastece
FOR EACH ROW
BEGIN

    UPDATE produto
    SET qtdd_atual = qtdd_atual - OLD.qtdd_recebida
    WHERE id_produto = OLD.id_produto;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_log_saida_item_pedido
AFTER INSERT ON item_pedido
FOR EACH ROW
BEGIN

DECLARE usuario_responsavel INT;

SELECT id_usuario
INTO usuario_responsavel
FROM pedido
WHERE id_pedido = NEW.id_pedido;

INSERT INTO movimentacao_estoque
(
    id_produto,
    id_tipo_movimentacao,
    qtdd_movimentacao,
    id_usuario
)
VALUES
(
    NEW.id_produto,
    2,
    NEW.qtdd_pedido,
    usuario_responsavel
);

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_log_entrada_abastecimento
AFTER INSERT ON abastece
FOR EACH ROW
BEGIN

INSERT INTO movimentacao_estoque
(
    id_produto,
    id_tipo_movimentacao,
    qtdd_movimentacao,
    id_usuario
)
VALUES
(
    NEW.id_produto,
    1,
    NEW.qtdd_recebida,
    NEW.id_usuario
);

END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_bloqueia_estoque_negativo
BEFORE UPDATE ON produto
FOR EACH ROW
BEGIN

    IF NEW.qtdd_atual < 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operação inválida: estoque não pode ser negativo.';

    END IF;

END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_bloqueia_delete_produto
BEFORE DELETE ON produto
FOR EACH ROW
BEGIN

    IF EXISTS (
        SELECT 1
        FROM item_pedido
        WHERE id_produto = OLD.id_produto
    )

    OR EXISTS (
        SELECT 1
        FROM abastece
        WHERE id_produto = OLD.id_produto
    )

    OR EXISTS (
        SELECT 1
        FROM movimentacao_estoque
        WHERE id_produto = OLD.id_produto
    )

    THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Produto não pode ser excluído: existe histórico associado.';

    END IF;

END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_log_update_abastece
AFTER UPDATE ON abastece
FOR EACH ROW
BEGIN

INSERT INTO movimentacao_estoque
(
    id_produto,
    id_tipo_movimentacao,
    qtdd_movimentacao,
    id_usuario
)
VALUES
(
    NEW.id_produto,
    1,
    NEW.qtdd_recebida - OLD.qtdd_recebida,
    NEW.id_usuario
);

END$$

DELIMITER ;
