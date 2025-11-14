INSERT INTO categoria (nome, descricao) VALUES
('Açai', 'Produtos de açaí'),
('Bebida Láctea', 'Bebidas lácteas UHT e em pó'),
('Casquinhas, Cascão e Biju', 'Cascões e bijus para sorvetes'),
('Coberturas de Garrafa', 'Coberturas em garrafa para sobremesas'),
('Coberturas Premium', 'Coberturas premium da marca Brigatta'),
('Confeitaria', 'Ingredientes e complementos para confeitaria'),
('Descartáveis', 'Copos, tampas e outros produtos descartáveis'),
('Pós Saborizantes', 'Pós para saborização de produtos'),
('Utensílios Diversos', 'Itens diversos de apoio e utensílios'),
('Churros', 'Produtos prontos ou pré-fritos de churros');

-- AÇAI
INSERT INTO produto (nome_produto, marca, preco_unitario, id_categoria)
VALUES
('Açai de 10L', NULL, 120.00, 1),
('Açai de 5L', NULL, 60.00, 1);
-- BEBIDA LÁCTEA
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Bebida Láctea UHT', 'Baunilha', 'Brigatta', 159.00, 2),
('Bebida Láctea UHT', 'Chocolate', 'Brigatta', 169.00, 2),
('Pó para preparo de Bebida Láctea', 'Baunilha', 'Brigatta', 54.10, 2),
('Pó para preparo de Bebida Láctea', 'Chocolate', 'Brigatta', 54.10, 2);
-- Casquinhas, Cascão e Biju
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Cascão', NULL, 'Marvi', 55.00, 3),
('Biju', NULL, 'Marvi', 33.00, 3),
('Casquinha', NULL, 'Marvi', 85.00, 3),
('Casquinha', NULL, 'Dupon', 75.00, 3),
('Cascão G Pró Cascão', NULL, 'Pró Cascão', 55.00, 3),
('Casquinha', NULL, 'Pró Cascão', 80.00, 3),
('Biju Tub-hool', NULL, 'Pró Cascão', 33.00, 3),
('Cascão Kid', NULL, 'Marvi', 55.00, 3);
-- COBERTURAS DE GARRAFA
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Cobertura', 'Groselha Azul', 'Du Porto', 17.00, 4),
('Cobertura', 'Limão', 'Du Porto', 17.00, 4),
('Cobertura', 'Tutti Frutti', 'Du Porto', 17.00, 4),
('Cobertura', 'Caramelo', 'Du Porto', 17.00, 4),
('Cobertura', 'Abacaxi', 'Du Porto', 17.00, 4),
('Cobertura', 'Milho Verde', 'Du Porto', 17.00, 4),
('Cobertura', 'Maracujá', 'Du Porto', 17.00, 4),
('Cobertura', 'Maçã Verde', 'Du Porto', 17.00, 4),
('Cobertura', 'Leite Condensado', 'Du Porto', 17.00, 4),
('Cobertura', 'Menta', 'Du Porto', 17.00, 4),
('Cobertura', 'Morango', 'Du Porto', 17.00, 4),
('Cobertura', 'Chocolate', 'Du Porto', 17.00, 4),
('Cobertura', 'Caramelo', 'Marvi', 18.00, 4),
('Cobertura', 'Morango', 'Marvi', 17.00, 4),
('Cobertura', 'Chocolate', 'Marvi', 20.00, 4),
('Cobertura', 'Doce de Leite', 'Marvi', 17.00, 4),
('Cobertura', 'Chocolate', 'Du Porto', 83.00, 4),
('Cobertura', 'Morango', 'Du Porto', 70.00, 4);
-- Coberturas Premium
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Cobertura Premium', 'Morango com Pedaços', 'Brigatta', 24.42, 5),
('Cobertura Premium', 'Chocolate com Pedaços', 'Brigatta', 24.47, 5),
('Cobertura Premium', 'Maracujá com Sementes', 'Brigatta', 25.34, 5),
('Cobertura Premium', 'Abacaxi com Pedaços', 'Brigatta', 22.50, 5),
('Cobertura Premium', 'Menta', 'Brigatta', 17.04, 5),
('Cobertura Premium', 'Framboesa', 'Brigatta', 29.83, 5),
('Cobertura Premium', 'Doce de Leite', 'Brigatta', 32.94, 5),
('Cobertura Premium', 'Abacaxi ao Vinho', 'Brigatta', 22.50, 5),
('Cobertura Premium', 'Limão', 'Brigatta', 20.75, 5),
('Cobertura Premium', 'Chocolate Meio Amargo', 'Brigatta', 70.60, 5),
('Cobertura Premium', 'Cupuaçu', 'Brigatta', 24.17, 5),
('Cobertura Premium', 'Chocolate', 'Brigatta', 38.53, 5),
('Cobertura Premium', 'Caramelo', 'Brigatta', 20.69, 5),
('Cobertura Premium', 'Amora', 'Brigatta', 23.81, 5),
('Cobertura Premium', 'Ameixa', 'Brigatta', 24.55, 5);
-- CONFEITARIA
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Coco Ralado Médio 500g', 'Coco', 'FrutCoco', 28.00, 6),
('Ovomaltine Flocos Extra Crocantes 750g', 'Chocolate', 'Ovomaltine', 35.00, 6),
('Leite Composto em Pó 1kg', 'Leite', 'LeiteSol', 28.00, 6),
('Topping Negresco 1kg', 'Chocolate', 'Nestlé', 54.00, 6),
('Amendoim Torrado Granulado 1kg', 'Amendoim', 'Nut', 19.00, 6),
('Chococandy Pastilha de Chocolate 500g', 'Chocolate', 'Dori', 17.00, 6),
('Creme de Avelã com Cacau 1kg', 'Avelã com Cacau', 'Vabene', 40.00, 6),
('Farofa Crocante de Amendoim 1kg', 'Amendoim', 'Vabene', 22.00, 6),
('Cereal Crocante Choco Micro 500g', 'Chocolate', 'Mavalério', 20.00, 6),
('Recheio Doce de Leite Toque Lácteo 1kg', 'Doce de Leite', NULL, 19.80, 6),
('Cobertura e Recheio Chocolate 1,01kg', 'Chocolate', NULL, 21.00, 6),
('Recheio Creme de Avelã com Cacau 1,01kg', 'Avelã com Cacau', 'Alispec', 40.00, 6),
('Doce de Leite Brasileiro Profissional 9,8kg', 'Doce de Leite', 'Alispec', 93.00, 6),
('Ovomaltine Flocos Crocantes 300g', 'Chocolate', 'Ovomaltine', 17.00, 6),
('Ovomaltine Flocos Crocantes 600g', 'Chocolate', 'Ovomaltine', 28.00, 6),
('Creme de Avelã com Cacau 3kg', 'Avelã com Cacau', 'Vabene', 143.00, 6),
('Preparado de Morango 4,3kg', 'Morango', 'Pró Polpa', 85.00, 6),
('Preparado de Abacaxi ao Vinho 4,3kg', 'Abacaxi ao Vinho', 'Pró Polpa', 98.00, 6),
('Recheio de Amarena 2kg', 'Amarena', 'Doremus', 100.00, 6),
('Nutella 3kg', 'Avelã com Cacau', 'Ferrero', 205.00, 6),
('Crocante de Amendoim 1,05kg', 'Amendoim', 'Vabene', 25.00, 6),
('Pasta de Limão 2,02kg', 'Limão', 'Specialita', 87.00, 6),
('Recheio de Chocolate ao Leite com Avelã 4kg', 'Chocolate com Avelã', 'Vabene', 155.00, 6),
('Recheio Chocolate ao Leite com Avelã 1kg', 'Chocolate com Avelã', 'Vabene', 45.00, 6),
('Pasta de Amendoim 1,05kg', 'Amendoim', 'Vabene', 26.00, 6),
('Frutas Vermelhas 1,1kg', 'Frutas Vermelhas', 'Jeb', 50.00, 6),
('Variegato de Frutas do Bosque 1,2kg', 'Frutas Vermelhas', 'Siber', 125.00, 6),
('Cereal Crocante Choco Mini 500g', 'Chocolate', 'Mavalério', 20.00, 6),
('Granulado Macio 1,01kg', 'Chocolate', 'Mavalério', 25.00, 6),
('Granulado Crocante Colorido 500g', 'Colorido', 'Mavalério', 11.00, 6),
('Flocos Macios 500g', 'Chocolate', 'Mavalério', 14.00, 6),
('Granola 800g', 'Tradicional', 'Granolevis', 20.00, 6),
('Flocos de Milho Açucarado 400g', 'Milho', 'Granolevis', 15.00, 6);
-- DESCARTÁVEIS
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Canudo 10mm 120und', NULL, 'Jacaré', 12.00, 7),
('Copo Milk Shake 400ml c/50und', NULL, 'Rioplastic', 21.00, 7),
('Copo Milk Shake 250ml c/50und', NULL, 'Rioplastic', 18.00, 7),
('Tampa reta c/furo p/copo 400/500ml', NULL, 'Altacoppo', 11.00, 7),
('Tampa reta c/furo p/copo 250/300ml', NULL, 'Altacoppo', 11.00, 7),
('Lubrificante 100g', NULL, 'Mundolce', 30.00, 7),
('Copo Milk Shake 500ml c/50und', NULL, 'Rioplastic', 28.00, 7),
('Tampa Bolha p/copo 400/500ml', NULL, 'Altacoppo', 18.00, 7),
('Pote Sundae 180ml c/50und', NULL, 'Copaza', 11.00, 7),
('Hamburgueira Média TH-02 c/100und', NULL, 'Totalplast', 22.50, 7),
('Pazinha c/500und', NULL, 'Strawplast', 24.00, 7),
('Tampa Bolha p/copo 300ml', NULL, 'Galvanotek', 15.00, 7),
('Tampa reta c/furo p/copo 770ml', NULL, 'Altacoppo', 14.00, 7),
('Tampa p/pote térmico 240/360/480 c/50und', NULL, 'Copobras', 20.00, 7),
('Copo Transparente 770ml c/25und', NULL, 'Rioplastic', 18.00, 7),
('Copo Milk Shake 300ml c/50und', NULL, 'Rioplastic', 19.00, 7),
('Copo Milk Shake 275ml c/50und', NULL, 'Kopu´s', 18.00, 7),
('Copo Transparente 330ml c/50und', NULL, 'Altacoppo', 15.00, 7),
('Copo Transparente 300ml c/50und', NULL, 'Rioplastic', 15.00, 7),
('Copo Transparente 250ml c/50und', NULL, 'Rioplastic', 14.00, 7),
('Copo 200ml c/100und', NULL, 'Altacoppo', 7.50, 7),
('Bandeja de EPS TRL-03 c/100und', NULL, 'Totalplast', 20.00, 7),
('Bandeja de EPS TRL-02 c/100und', NULL, 'Totalplast', 11.00, 7),
('Bandeja de EPS TRL-01 c/100und', NULL, 'Totalplast', 9.50, 7),
('Hot Dog c/100und', NULL, 'Totalplast', 28.00, 7),
('Hamburgueira Grande TH-03', NULL, 'Totalplast', 27.60, 7),
('Hamburgueira Pequena TH-01 c/100und', NULL, 'Totalplast', 17.00, 7),
('Pote Térmico 480ml c/25und', NULL, 'Copobras', 18.00, 7),
('Pote Térmico 360ml c/25und', NULL, 'Copobras', 16.00, 7),
('Pote Térmico 240ml c/50und', NULL, 'Copobras', 22.00, 7),
('Guardanapo TV Pin Luxo 2000und', NULL, NULL, 20.00, 7),
('Pano Multiuso Mini', NULL, 'MbFlex', 25.00, 7),
('Colher c/1000und', NULL, 'Strawplast', 75.00, 7);
-- PÓS SABORIZANTES
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Pó Sabor Leite Condensado 500g', 'Leite Condensado', 'Thechnoflavor', 19.50, 8),
('Pó Sabor Cereja 500g', 'Cereja', 'Thechnoflavor', 18.50, 8),
('Pó Sabor Morangurt 1kg', 'Morangurt', 'Thechnoflavor', 33.00, 8),
('Pó Sabor Morango 1kg', 'Morango', 'Thechnoflavor', 27.00, 8),
('Pó Sabor Milho Verde 1kg', 'Milho Verde', 'Thechnoflavor', 25.50, 8),
('Pó Sabor Maracujá 1kg', 'Maracujá', 'Thechnoflavor', 25.00, 8),
('Pó Sabor Manga 500g', 'Manga', 'Thechnoflavor', 15.00, 8),
('Pó Sabor Limão 500g', 'Limão', 'Thechnoflavor', 21.00, 8),
('Pó Sabor Flocos 1kg', 'Flocos', 'Thechnoflavor', 25.00, 8),
('Pó Sabor Creme Holandês 500g', 'Creme Holandês', 'Thechnoflavor', 14.00, 8),
('Pó Sabor Coco Branco 1kg', 'Coco Branco', 'Thechnoflavor', 26.00, 8),
('Pó Sabor Chocolate com Avelã 400g', 'Chocolate com Avelã', 'Thechnoflavor', 25.50, 8),
('Pó Sabor Chocolate Branco 1kg', 'Chocolate Branco', 'Thechnoflavor', 26.00, 8),
('Pó Sabor Chiclete 1kg', 'Chiclete', 'Thechnoflavor', 27.00, 8),
('Pó Sabor Brigadeiro 400g', 'Brigadeiro', 'Thechnoflavor', 32.00, 8),
('Pó Sabor Blue Ice 1kg', 'Blue Ice', 'Thechnoflavor', 26.00, 8),
('Pó Sabor Beijinho 500g', 'Beijinho', 'Thechnoflavor', 18.00, 8),
('Pó Sabor Menta 500g', 'Menta', 'Thechnoflavor', 19.50, 8),
('Pó Sabor Banana 500g', 'Banana', 'Thechnoflavor', 18.00, 8),
('Pó Sabor Abacaxi com Hortelã 500g', 'Abacaxi com Hortelã', 'Thechnoflavor', 18.00, 8),
('Pó Sabor Morangurte 1kg', 'Morangurte', 'Du Porto', 22.00, 8),
('Pó Sabor Leite Condensado 1kg', 'Leite Condensado', 'Du Porto', 22.00, 8),
('Pó Sabor Porto Blue 1kg', 'Blue Ice', 'Du Porto', 22.00, 8),
('Pó Sabor Milho Verde 1kg', 'Milho Verde', 'Du Porto', 22.00, 8),
('Pó Sabor Limão 1kg', 'Limão', 'Du Porto', 22.00, 8),
('Pó Sabor Kiwi 1kg', 'Kiwi', 'Du Porto', 22.00, 8),
('Pó Sabor Chocolate Branco 1kg', 'Chocolate Branco', 'Du Porto', 22.00, 8),
('Pó Sabor Coco 1kg', 'Coco', 'Du Porto', 22.00, 8),
('Pó Sabor Abacaxi 1kg', 'Abacaxi', 'Du Porto', 22.00, 8),
('Pó Sabor Amendoim 1kg', 'Amendoim', 'Du Porto', 22.00, 8),
('Pó Sabor Iogurte 1kg', 'Iogurte', 'Du Porto', 22.00, 8),
('Pó Sabor Menta 1kg', 'Menta', 'Du Porto', 22.00, 8),
('Pó Sabor Morango 1kg', 'Morango', 'Du Porto', 22.00, 8),
('Pó Sabor Chocolate 1,050kg', 'Chocolate', 'Du Porto', 77.00, 8);
-- PÓS SABORIZANTES
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Pó Sabor Leite Condensado 500g', 'Leite Condensado', 'Thechnoflavor', 19.50, 8),
('Pó Sabor Cereja 500g', 'Cereja', 'Thechnoflavor', 18.50, 8),
('Pó Sabor Morangurt 1kg', 'Morangurt', 'Thechnoflavor', 33.00, 8),
('Pó Sabor Morango 1kg', 'Morango', 'Thechnoflavor', 27.00, 8),
('Pó Sabor Milho Verde 1kg', 'Milho Verde', 'Thechnoflavor', 25.50, 8),
('Pó Sabor Maracujá 1kg', 'Maracujá', 'Thechnoflavor', 25.00, 8),
('Pó Sabor Manga 500g', 'Manga', 'Thechnoflavor', 15.00, 8),
('Pó Sabor Limão 500g', 'Limão', 'Thechnoflavor', 21.00, 8),
('Pó Sabor Flocos 1kg', 'Flocos', 'Thechnoflavor', 25.00, 8),
('Pó Sabor Creme Holandês 500g', 'Creme Holandês', 'Thechnoflavor', 14.00, 8),
('Pó Sabor Coco Branco 1kg', 'Coco Branco', 'Thechnoflavor', 26.00, 8),
('Pó Sabor Chocolate com Avelã 400g', 'Chocolate com Avelã', 'Thechnoflavor', 25.50, 8),
('Pó Sabor Chocolate Branco 1kg', 'Chocolate Branco', 'Thechnoflavor', 26.00, 8),
('Pó Sabor Chiclete 1kg', 'Chiclete', 'Thechnoflavor', 27.00, 8),
('Pó Sabor Brigadeiro 400g', 'Brigadeiro', 'Thechnoflavor', 32.00, 8),
('Pó Sabor Blue Ice 1kg', 'Blue Ice', 'Thechnoflavor', 26.00, 8),
('Pó Sabor Beijinho 500g', 'Beijinho', 'Thechnoflavor', 18.00, 8),
('Pó Sabor Menta 500g', 'Menta', 'Thechnoflavor', 19.50, 8),
('Pó Sabor Banana 500g', 'Banana', 'Thechnoflavor', 18.00, 8),
('Pó Sabor Abacaxi com Hortelã 500g', 'Abacaxi com Hortelã', 'Thechnoflavor', 18.00, 8),
('Pó Sabor Morangurte 1kg', 'Morangurte', 'Du Porto', 22.00, 8),
('Pó Sabor Leite Condensado 1kg', 'Leite Condensado', 'Du Porto', 22.00, 8),
('Pó Sabor Porto Blue 1kg', 'Blue Ice', 'Du Porto', 22.00, 8),
('Pó Sabor Milho Verde 1kg', 'Milho Verde', 'Du Porto', 22.00, 8),
('Pó Sabor Limão 1kg', 'Limão', 'Du Porto', 22.00, 8),
('Pó Sabor Kiwi 1kg', 'Kiwi', 'Du Porto', 22.00, 8),
('Pó Sabor Chocolate Branco 1kg', 'Chocolate Branco', 'Du Porto', 22.00, 8),
('Pó Sabor Coco 1kg', 'Coco', 'Du Porto', 22.00, 8),
('Pó Sabor Abacaxi 1kg', 'Abacaxi', 'Du Porto', 22.00, 8),
('Pó Sabor Amendoim 1kg', 'Amendoim', 'Du Porto', 22.00, 8),
('Pó Sabor Iogurte 1kg', 'Iogurte', 'Du Porto', 22.00, 8),
('Pó Sabor Menta 1kg', 'Menta', 'Du Porto', 22.00, 8),
('Pó Sabor Morango 1kg', 'Morango', 'Du Porto', 22.00, 8),
('Pó Sabor Chocolate 1,050kg', 'Chocolate', 'Du Porto', 77.00, 8);
-- UTENSÍLIOS DIVERSOS
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Lubrificante', NULL, 'Mundolce', 30.00, 9),
('Pano Multiuso Mini', NULL, 'MbFlex', 25.00, 9);
-- CHURROS
INSERT INTO produto (nome_produto, sabor, marca, preco_unitario, id_categoria)
VALUES
('Churros Tradicional Frito', 'Tradicional', NULL, 50.00, 10),
('Churros Tradicional Frito', 'Tradicional', NULL, 19.00, 10);