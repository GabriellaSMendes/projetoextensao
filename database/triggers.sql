-- Venda diminui a quantidade de itens do estoque
DELIMITER $$

CREATE TRIGGER trg_baixa_estoque
AFTER INSERT ON venda_estoque
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual - NEW.qtdd_venda,
        qtdd_saida = qtdd_saida + NEW.qtdd_venda
    WHERE id_estoque = NEW.id_estoque;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_ajuste_estoque_update
AFTER UPDATE ON venda_estoque
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual + OLD.qtdd_venda,
        qtdd_saida = qtdd_saida - OLD.qtdd_venda
    WHERE id_estoque = OLD.id_estoque;
    UPDATE estoque
    SET qtdd_atual = qtdd_atual - NEW.qtdd_venda,
        qtdd_saida = qtdd_saida + NEW.qtdd_venda
    WHERE id_estoque = NEW.id_estoque;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_retorna_estoque_delete
AFTER DELETE ON venda_estoque
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual + OLD.qtdd_venda,
        qtdd_saida = qtdd_saida - OLD.qtdd_venda
    WHERE id_estoque = OLD.id_estoque;
END$$

DELIMITER ;


-- Para quando o estoque é abastecido e aumenta a quantidade dos itens
DELIMITER $$

CREATE TRIGGER trg_abastecimento_entrada
AFTER INSERT ON abastece
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual + NEW.qtdd_recebida,
        qtdd_entrada = qtdd_entrada + NEW.qtdd_recebida
    WHERE id_estoque = NEW.id_estoque;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_abastecimento_update
AFTER UPDATE ON abastece
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual - OLD.qtdd_recebida,
        qtdd_entrada = qtdd_entrada - OLD.qtdd_recebida
    WHERE id_estoque = OLD.id_estoque;
    UPDATE estoque
    SET qtdd_atual = qtdd_atual + NEW.qtdd_recebida,
        qtdd_entrada = qtdd_entrada + NEW.qtdd_recebida
    WHERE id_estoque = NEW.id_estoque;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_abastecimento_delete
AFTER DELETE ON abastece
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual - OLD.qtdd_recebida,
        qtdd_entrada = qtdd_entrada - OLD.qtdd_recebida
    WHERE id_estoque = OLD.id_estoque;
END$$


DELIMITER ;
