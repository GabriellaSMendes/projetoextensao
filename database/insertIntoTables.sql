USE tropicalmix_db_2;

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

INSERT INTO tipo_movimentacao (id_tipo_movimentacao, tipo_movimentacao)
VALUES
(1, 'entrada'),
(2, 'saida');

INSERT INTO produto
(nome_produto, sabor, marca, qtdd_atual, data_vencimento, preco_unitario, id_categoria)
VALUES

-- AÇAI
('Açai de 10L', 'Açai', 'Tropical Mix', 100, '2026-12-31', 120.00, 1),
('Açai de 5L', 'Açai', 'Tropical Mix', 100, '2026-12-31', 60.00, 1),

-- BEBIDA LÁCTEA
('Bebida Láctea UHT','Baunilha','Brigatta',100,'2026-12-31',159.00,2),
('Bebida Láctea UHT','Chocolate','Brigatta',100,'2026-12-31',169.00,2),
('Pó para preparo de Bebida Láctea','Baunilha','Brigatta',100,'2026-12-31',54.10,2),
('Pó para preparo de Bebida Láctea','Chocolate','Brigatta',100,'2026-12-31',54.10,2),

-- CASQUINHAS
('Cascão','Padrão','Marvi',100,'2026-12-31',55.00,3),
('Biju','Padrão','Marvi',100,'2026-12-31',33.00,3),
('Casquinha','Padrão','Marvi',100,'2026-12-31',85.00,3),
('Casquinha','Padrão','Dupon',100,'2026-12-31',75.00,3),
('Cascão G Pró Cascão','Padrão','Pró Cascão',100,'2026-12-31',55.00,3),
('Casquinha','Padrão','Pró Cascão',100,'2026-12-31',80.00,3),
('Biju Tub-hool','Padrão','Pró Cascão',100,'2026-12-31',33.00,3),
('Cascão Kid','Padrão','Marvi',100,'2026-12-31',55.00,3),

-- COBERTURAS GARRAFA
('Cobertura','Groselha Azul','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Limão','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Tutti Frutti','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Caramelo','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Abacaxi','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Milho Verde','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Maracujá','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Maçã Verde','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Leite Condensado','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Menta','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Morango','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Chocolate','Du Porto',100,'2026-12-31',17.00,4),
('Cobertura','Caramelo','Marvi',100,'2026-12-31',18.00,4),
('Cobertura','Morango','Marvi',100,'2026-12-31',17.00,4),
('Cobertura','Chocolate','Marvi',100,'2026-12-31',20.00,4),
('Cobertura','Doce de Leite','Marvi',100,'2026-12-31',17.00,4),
('Cobertura','Chocolate','Du Porto',100,'2026-12-31',83.00,4),
('Cobertura','Morango','Du Porto',100,'2026-12-31',70.00,4),

-- COBERTURAS PREMIUM
('Cobertura Premium','Morango com Pedaços','Brigatta',100,'2026-12-31',24.42,5),
('Cobertura Premium','Chocolate com Pedaços','Brigatta',100,'2026-12-31',24.47,5),
('Cobertura Premium','Maracujá com Sementes','Brigatta',100,'2026-12-31',25.34,5),
('Cobertura Premium','Abacaxi com Pedaços','Brigatta',100,'2026-12-31',22.50,5),
('Cobertura Premium','Menta','Brigatta',100,'2026-12-31',17.04,5),
('Cobertura Premium','Framboesa','Brigatta',100,'2026-12-31',29.83,5),
('Cobertura Premium','Doce de Leite','Brigatta',100,'2026-12-31',32.94,5),
('Cobertura Premium','Abacaxi ao Vinho','Brigatta',100,'2026-12-31',22.50,5),
('Cobertura Premium','Limão','Brigatta',100,'2026-12-31',20.75,5),
('Cobertura Premium','Chocolate Meio Amargo','Brigatta',100,'2026-12-31',70.60,5),
('Cobertura Premium','Cupuaçu','Brigatta',100,'2026-12-31',24.17,5),
('Cobertura Premium','Chocolate','Brigatta',100,'2026-12-31',38.53,5),
('Cobertura Premium','Caramelo','Brigatta',100,'2026-12-31',20.69,5),
('Cobertura Premium','Amora','Brigatta',100,'2026-12-31',23.81,5),
('Cobertura Premium','Ameixa','Brigatta',100,'2026-12-31',24.55,5),

-- CONFEITARIA
('Coco Ralado Médio 500g', 'Coco', 'FrutCoco', 100, '2026-12-31', 28.00, 6),
('Ovomaltine Flocos Extra Crocantes 750g', 'Chocolate', 'Ovomaltine', 100, '2026-12-31', 35.00, 6),
('Leite Composto em Pó 1kg', 'Leite', 'LeiteSol', 100, '2026-12-31', 28.00, 6),
('Topping Negresco 1kg', 'Chocolate', 'Nestlé', 100, '2026-12-31', 54.00, 6),
('Amendoim Torrado Granulado 1kg', 'Amendoim', 'Nut', 100, '2026-12-31', 19.00, 6),
('Chococandy Pastilha de Chocolate 500g', 'Chocolate', 'Dori', 100, '2026-12-31', 17.00, 6),
('Creme de Avelã com Cacau 1kg', 'Avelã com Cacau', 'Vabene', 100, '2026-12-31', 40.00, 6),
('Farofa Crocante de Amendoim 1kg', 'Amendoim', 'Vabene', 100, '2026-12-31', 22.00, 6),
('Cereal Crocante Choco Micro 500g', 'Chocolate', 'Mavalério', 100, '2026-12-31', 20.00, 6),
('Recheio Doce de Leite Toque Lácteo 1kg', 'Doce de Leite', NULL, 100, '2026-12-31', 19.80, 6),
('Cobertura e Recheio Chocolate 1,01kg', 'Chocolate', NULL, 100, '2026-12-31', 21.00, 6),
('Recheio Creme de Avelã com Cacau 1,01kg', 'Avelã com Cacau', 'Alispec', 100, '2026-12-31', 40.00, 6),
('Doce de Leite Brasileiro Profissional 9,8kg', 'Doce de Leite', 'Alispec', 100, '2026-12-31', 93.00, 6),
('Ovomaltine Flocos Crocantes 300g', 'Chocolate', 'Ovomaltine', 100, '2026-12-31', 17.00, 6),
('Ovomaltine Flocos Crocantes 600g', 'Chocolate', 'Ovomaltine', 100, '2026-12-31', 28.00, 6),
('Creme de Avelã com Cacau 3kg', 'Avelã com Cacau', 'Vabene', 100, '2026-12-31', 143.00, 6),
('Preparado de Morango 4,3kg', 'Morango', 'Pró Polpa', 100, '2026-12-31', 85.00, 6),
('Preparado de Abacaxi ao Vinho 4,3kg', 'Abacaxi ao Vinho', 'Pró Polpa', 100, '2026-12-31', 98.00, 6),
('Recheio de Amarena 2kg', 'Amarena', 'Doremus', 100, '2026-12-31', 100.00, 6),
('Nutella 3kg', 'Avelã com Cacau', 'Ferrero', 100, '2026-12-31', 205.00, 6),
('Crocante de Amendoim 1,05kg', 'Amendoim', 'Vabene', 100, '2026-12-31', 25.00, 6),
('Pasta de Limão 2,02kg', 'Limão', 'Specialita', 100, '2026-12-31', 87.00, 6),
('Recheio de Chocolate ao Leite com Avelã 4kg', 'Chocolate com Avelã', 'Vabene', 100, '2026-12-31', 155.00, 6),
('Recheio Chocolate ao Leite com Avelã 1kg', 'Chocolate com Avelã', 'Vabene', 100, '2026-12-31', 45.00, 6),
('Pasta de Amendoim 1,05kg', 'Amendoim', 'Vabene', 100, '2026-12-31', 26.00, 6),
('Frutas Vermelhas 1,1kg', 'Frutas Vermelhas', 'Jeb', 100, '2026-12-31', 50.00, 6),
('Variegato de Frutas do Bosque 1,2kg', 'Frutas Vermelhas', 'Siber', 100, '2026-12-31', 125.00, 6),
('Cereal Crocante Choco Mini 500g', 'Chocolate', 'Mavalério', 100, '2026-12-31', 20.00, 6),
('Granulado Macio 1,01kg', 'Chocolate', 'Mavalério', 100, '2026-12-31', 25.00, 6),
('Granulado Crocante Colorido 500g', 'Colorido', 'Mavalério', 100, '2026-12-31', 11.00, 6),
('Flocos Macios 500g', 'Chocolate', 'Mavalério', 100, '2026-12-31', 14.00, 6),
('Granola 800g', 'Tradicional', 'Granolevis', 100, '2026-12-31', 20.00, 6),
('Flocos de Milho Açucarado 400g', 'Milho', 'Granolevis', 100, '2026-12-31', 15.00, 6),

-- DESCARTÁVEIS
('Canudo 10mm 120und', NULL, 'Jacaré', 100, '2026-12-31', 12.00, 7),
('Copo Milk Shake 400ml c/50und', NULL, 'Rioplastic', 100, '2026-12-31', 21.00, 7),
('Copo Milk Shake 250ml c/50und', NULL, 'Rioplastic', 100, '2026-12-31', 18.00, 7),
('Tampa reta c/furo p/copo 400/500ml', NULL, 'Altacoppo', 100, '2026-12-31', 11.00, 7),
('Tampa reta c/furo p/copo 250/300ml', NULL, 'Altacoppo', 100, '2026-12-31', 11.00, 7),
('Lubrificante 100g', NULL, 'Mundolce', 100, '2026-12-31', 30.00, 7),
('Copo Milk Shake 500ml c/50und', NULL, 'Rioplastic', 100, '2026-12-31', 28.00, 7),
('Tampa Bolha p/copo 400/500ml', NULL, 'Altacoppo', 100, '2026-12-31', 18.00, 7),
('Pote Sundae 180ml c/50und', NULL, 'Copaza', 100, '2026-12-31', 11.00, 7),
('Hamburgueira Média TH-02 c/100und', NULL, 'Totalplast', 100, '2026-12-31', 22.50, 7),
('Pazinha c/500und', NULL, 'Strawplast', 100, '2026-12-31', 24.00, 7),
('Tampa Bolha p/copo 300ml', NULL, 'Galvanotek', 100, '2026-12-31', 15.00, 7),
('Tampa reta c/furo p/copo 770ml', NULL, 'Altacoppo', 100, '2026-12-31', 14.00, 7),
('Tampa p/pote térmico 240/360/480 c/50und', NULL, 'Copobras', 100, '2026-12-31', 20.00, 7),
('Copo Transparente 770ml c/25und', NULL, 'Rioplastic', 100, '2026-12-31', 18.00, 7),
('Copo Milk Shake 300ml c/50und', NULL, 'Rioplastic', 100, '2026-12-31', 19.00, 7),
('Copo Milk Shake 275ml c/50und', NULL, 'Kopu´s', 100, '2026-12-31', 18.00, 7),
('Copo Transparente 330ml c/50und', NULL, 'Altacoppo', 100, '2026-12-31', 15.00, 7),
('Copo Transparente 300ml c/50und', NULL, 'Rioplastic', 100, '2026-12-31', 15.00, 7),
('Copo Transparente 250ml c/50und', NULL, 'Rioplastic', 100, '2026-12-31', 14.00, 7),
('Copo 200ml c/100und', NULL, 'Altacoppo', 100, '2026-12-31', 7.50, 7),

-- UTENSÍLIOS DIVERSOS
('Lubrificante', NULL, 'Mundolce', 100, '2026-12-31', 30.00, 9),
('Pano Multiuso Mini', NULL, 'MbFlex', 100, '2026-12-31', 25.00, 9),

-- CHURROS
('Churros Tradicional Frito','Tradicional','BRAND',100,'2026-12-31',50.00,10),
('Churros Tradicional Frito','Tradicional','BRAND',100,'2026-12-31',19.00,10);


-- FORNECEDORRES
INSERT INTO fornecedor (razao_social, cnpj, telefone, email) VALUES
  ('Brigatta Indústria e Comércio de Alimentos Ltda', '08.069.249/0001-65', '+55 18 3701-3825', 'contato@brigatta.com.br'),
  ('Marvi - Indústria de Embalagens Ltda', '53.408.654/0001-15', '+55 14 3302-4411', NULL),
  ('Dupon Biscuits do Brasil Alimentos e Embalagens Ltda', '03.138.212/0001-28', NULL, NULL),
  ('Pro Cascão Indústria e Comércio Ltda', '04.716.732/0001-33', '+55 11 4587-2777', 'contecni@terra.com.br'),
  ('Du Porto Indústria Alimentícia Ltda', '72.845.068/0001-82', '+55 00 800 771 9244', 'sac@duporto.com.br'),
  ('Vabene Alimentos', NULL, '+55 14 2105-2108', 'sac@vabenealimentos.com.br'),
  ('Nut Indústria e Comércio Ltda', '66.095.670/0001-47', '+55 11 3384-4911', 'atendimento@nutbiscoitos.com.br'),
  ('Dr. Oetker Brasil Ltda', '61.193.496/0001-51', '+55 11 3783-9300', NULL),
  ('JEB Comércio de Alimentos Ltda', '05.761.350/0001-94', NULL, NULL),
  ('Kerry do Brasil Ltda', '02.332.686/0001-43', '+55 19 3765-5000', 'cuentas.porpagarbr@kerry.com'),
  ('Indústria e Comércio de Plásticos Rio Pardo Ltda (Rioplastic)', '60.348.695/0001-29', '+55 19 3682-8200', 'centralvendas@rioplastic.com.br'),
  ('Altacoppo Indústria e Comércio de Produtos Descartáveis Ltda', '07.711.478/0001-79', '+55 11 2526-4488', 'anderson@altacoppo.com.br'),
  ('Totalplast Indústria de Embalagens Plásticas Ltda', '38.386.879/0001-24', '+55 48 3046-5700', 'contato@totalplast.com.br'),
  ('Strawplast Indústria e Comércio Ltda', '02.591.442/0001-85', '+55 48 3657-8028', 'contato@strawplast.com.br'),
  ('Copobras Indústria e Comércio de Embalagens Ltda', '03.210.400/0001-10', '+55 11 4858-9620', 'dpo@copobras.com.br'),
  ('Indústria de Embalagens Plásticas Reolon Ltda (KOPU’S)', '00.065.596/0001-08', '+55 45 3262-1630', 'kopus@kopus.com.br'),
  ('Technoflavor Comércio e Distribuição de Aromas e Ingredientes Ltda', '11.244.095/0001-05', NULL, NULL),
  ('Alispec Indústria e Comércio de Produtos Alimentícios Ltda', '96.468.079/0001-59', '+55 11 94398-7259', 'sac@alispec.com.br'),
  ('Pro-Polpa Indústria & Comércio Ltda', '12.450.140/0001-40', '+55 43 3526-1600', 'atendimento@propolpa.com.br'),
  ('Leitesol Indústria e Comércio S.A.', '65.979.973/0001-60', NULL, NULL),
  ('Nestlé Brasil', NULL, '+55 00 800 770 2459', 'falecom@nestle.com.br'),
  ('Ferrero do Brasil Indústria Doceira e Alimentar Ltda', NULL, NULL, 'contato.fiscalbrasil@ferrero.com'),
  ('Xamego Bom – Fabrica de Laticínios Monte Azul Ltda', '28.811.123/0001-21', '+55 22 3833-9755', 'xamego@xamegobom.com.br'),
  ('Granolevis Produtos Naturais / Lifenaturis Produtos Naturais Ltda', '18.155.066/0001-16', '+55 11 96997-5352', NULL);

INSERT INTO tipo_movimentacao (id_tipo_movimentacao, tipo_movimentacao)
VALUES
(1, 'entrada'),
(2, 'saida');