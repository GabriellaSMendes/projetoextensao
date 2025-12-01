-- Triggers para o preenchimento e funcionamento adequado das dinamicas das tabelas

-- Venda diminui a quantidade de itens do estoque, fazendo a validação para se certificar que não vai negativar o estoque
DELIMITER $$

CREATE TRIGGER trg_baixa_estoque_before_insert
BEFORE INSERT ON venda_estoque
FOR EACH ROW
BEGIN
    DECLARE qtd_atual INT;

    SELECT qtdd_atual INTO qtd_atual
    FROM estoque
    WHERE id_estoque = NEW.id_estoque;

    IF NEW.qtdd_venda > qtd_atual THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Estoque insuficiente para completar a venda.';
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_baixa_estoque_before_update
BEFORE UPDATE ON venda_estoque
FOR EACH ROW
BEGIN
    DECLARE qtd_atual INT;
    DECLARE diferenca INT;

    SELECT qtdd_atual INTO qtd_atual
    FROM estoque
    WHERE id_estoque = OLD.id_estoque;

    SET diferenca = NEW.qtdd_venda - OLD.qtdd_venda;

    IF diferenca > qtd_atual THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Estoque insuficiente para atualizar a venda.';
    END IF;
END$$

DELIMITER ; 

DELIMITER $$

CREATE TRIGGER trg_baixa_estoque_after_insert
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

CREATE TRIGGER trg_baixa_estoque_after_update
AFTER UPDATE ON venda_estoque
FOR EACH ROW
BEGIN
    -- devolve o valor antigo
    UPDATE estoque
    SET qtdd_atual = qtdd_atual + OLD.qtdd_venda,
        qtdd_saida = qtdd_saida - OLD.qtdd_venda
    WHERE id_estoque = OLD.id_estoque;

    -- aplica o novo valor
    UPDATE estoque
    SET qtdd_atual = qtdd_atual - NEW.qtdd_venda,
        qtdd_saida = qtdd_saida + NEW.qtdd_venda
    WHERE id_estoque = NEW.id_estoque;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_baixa_estoque_after_delete
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

CREATE TRIGGER trg_abastecimento_after_insert
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

CREATE TRIGGER trg_abastecimento_after_update
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

CREATE TRIGGER trg_abastecimento_after_delete
AFTER DELETE ON abastece
FOR EACH ROW
BEGIN
    UPDATE estoque
    SET qtdd_atual = qtdd_atual - OLD.qtdd_recebida,
        qtdd_entrada = qtdd_entrada - OLD.qtdd_recebida
    WHERE id_estoque = OLD.id_estoque;
END$$

DELIMITER ;
