import datetime

from flask import request, jsonify, Blueprint
from app.models import db, Produto, Categoria, Estoque, Fornecedor, Abastece

from flask_jwt_extended import jwt_required

estoque_bp = Blueprint('estoque', __name__)

# ROTAS DE CATEGORIA
@estoque_bp.route('/categorias', methods=['GET'])
@jwt_required()
def listar_categorias():
    categorias = Categoria.query.all()
    lista_json = [{"id_categoria": cat.id_categoria, "nome": cat.nome, "descricao": cat.descricao}
                  for cat in categorias]
    return jsonify(categorias=lista_json), 200

@estoque_bp.route('/categorias', methods=['POST'])
@jwt_required()
def criar_categoria():
    dados = request.get_json()
    nome = dados.get('nome')
    if not nome:
        return jsonify({"erro": "O campo 'nome' é obrigatório"}), 400
    if Categoria.query.filter_by(nome=nome).first():
        return jsonify({"erro": "Categoria com este nome já existe"}), 409
    nova_categoria = Categoria(nome=nome, descricao=dados.get('descricao'))
    try:
        db.session.add(nova_categoria)
        db.session.commit()
        return jsonify({
            "mensagem": "Categoria criada com sucesso!",
            "id_categoria": nova_categoria.id_categoria
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao criar categoria", "detalhes": str(e)}), 500

# ROTAS DE PRODUTO
@estoque_bp.route('/produtos', methods=['GET'])
@jwt_required()
def listar_produtos():
    """
    Lista todos os produtos e suas quantidades de estoque (JOIN).
    """
    produtos_com_estoque = db.session.query(Produto, Estoque).join(Estoque).all()

    lista_json = []
    for p, e in produtos_com_estoque:
        
        # Buscar o último abastecimento deste estoque
        ultimo_abastecimento = (
            Abastece.query
            .filter_by(id_estoque=e.id_estoque)
            .order_by(Abastece.id_abastecimento.desc())
            .first()
        )

        if ultimo_abastecimento:
            fornecedor = Fornecedor.query.get(ultimo_abastecimento.id_fornecedor)
            nome_fornecedor = fornecedor.razao_social if fornecedor else None
            id_fornecedor = fornecedor.id_fornecedor if fornecedor else None
        else:
            nome_fornecedor = None
            id_fornecedor = None
            
        lista_json.append({
            "id_produto": p.id_produto,
            "id_estoque": e.id_estoque,
            "nome_produto": p.nome_produto,
            "sabor": p.sabor,
            "marca": p.marca,
            "preco_unitario": str(p.preco_unitario),

            "data_vencimento": (
                p.data_vencimento.isoformat() 
                if p.data_vencimento else None
            ),

            "id_categoria": p.id_categoria,
            "nome": p.categoria.nome if p.categoria else None,
            "qtdd_atual": e.qtdd_atual,
            "id_fornecedor": id_fornecedor,
            "nome_fornecedor": nome_fornecedor
        })
    return jsonify(produtos=lista_json), 200

@estoque_bp.route('/produtos', methods=['POST'])
@jwt_required()
def criar_produto():
    """
    Cria um novo PRODUTO e sua entrada no ESTOQUE.
    """
    dados = request.get_json()
    if not dados.get('nome_produto') or not dados.get('preco_unitario'):
        return jsonify({"erro": "Nome e Preço Unitário são obrigatórios"}), 400

    if dados.get('id_categoria'):
        if not Categoria.query.get(dados.get('id_categoria')):
            return jsonify({"erro": "Categoria não encontrada"}), 404
    
    # Extrair fornecedor
    id_fornecedor = dados.get("id_fornecedor")
    
    # Validar fornecedor
    if id_fornecedor:
        fornecedor = Fornecedor.query.get(id_fornecedor)
        if not fornecedor:
            return jsonify({"erro": "Fornecedor inválido"}), 404

    novo_produto = Produto(
        nome_produto=dados.get('nome_produto'),
        sabor=dados.get('sabor'),
        marca=dados.get('marca'),
        data_vencimento=dados.get('data_vencimento'),
        preco_unitario=dados.get('preco_unitario'),
        id_categoria=dados.get('id_categoria')
    )

    # Criar a entrada de Estoque para o produto
    qtdd_inicial = dados.get('qtdd_entrada', 0)

    novo_estoque = Estoque(
        qtdd_atual=qtdd_inicial,
        qtdd_entrada=qtdd_inicial,
        produto=novo_produto
    )

    try:
        db.session.add(novo_produto)
        db.session.add(novo_estoque)
        db.session.flush()
        
        # Criar abastecimento inicial (se houver fornecedor)
        if id_fornecedor:
            abastecimento_inicial = Abastece(
                id_fornecedor=id_fornecedor,
                id_estoque=novo_estoque.id_estoque,
                qtdd_recebida=qtdd_inicial,
                valor_unitario=dados.get("preco_unitario")
            )
            db.session.add(abastecimento_inicial)

        db.session.commit()

        return jsonify({
            "mensagem": "Produto e entrada de estoque criados com sucesso!",
            "id_produto": novo_produto.id_produto,
            "id_estoque": novo_estoque.id_estoque,
            "qtdd_atual": novo_estoque.qtdd_atual
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao criar produto", "detalhes": str(e)}), 500


@estoque_bp.route('/produtos/<int:id_produto>', methods=['GET'])
@jwt_required()
def detalhar_produto(id_produto):
    """
    Detalha um produto e seu estoque.
    """

    resultado = db.session.query(Produto, Estoque).join(Estoque).filter(Produto.id_produto == id_produto).first()

    if not resultado:
        return jsonify({"erro": "Produto não encontrado ou sem entrada de estoque"}), 404

    p, e = resultado

    return jsonify({
        "id_produto": p.id_produto,
        "id_estoque": e.id_estoque,
        "nome_produto": p.nome_produto,
        "sabor": p.sabor,
        "marca": p.marca,
        "data_vencimento": p.data_vencimento.isoformat() if p.data_vencimento else None,
        "preco_unitario": str(p.preco_unitario),
        "dt_cadastro": p.dt_cadastro.isoformat() if p.dt_cadastro else None,
        "id_categoria": p.id_categoria,
        "nome_categoria": p.categoria.nome if p.categoria else None,
        # Dados do Estoque:
        "qtdd_atual": e.qtdd_atual,
        "qtdd_entrada_total": e.qtdd_entrada,
        "qtdd_saida_total": e.qtdd_saida,
        "ultima_atualizacao": e.ultima_atualizacao.isoformat()
    }), 200


@estoque_bp.route('/produtos/<int:id_produto>', methods=['PUT'])
@jwt_required()
def atualizar_produto(id_produto):
    """
    Atualiza o dados do PRODUTO,
    NÃO atualiza a quantidade de estoque.
    """
    p = Produto.query.get_or_404(id_produto)
    dados = request.get_json()

    p.nome_produto = dados.get('nome_produto', p.nome_produto)
    p.sabor = dados.get('sabor', p.sabor)
    p.marca = dados.get('marca', p.marca)
    p.data_vencimento = dados.get('data_vencimento', p.data_vencimento)
    p.preco_unitario = dados.get('preco_unitario', p.preco_unitario)

    if dados.get('id_categoria'):
        if not Categoria.query.get(dados.get('id_categoria')):
            return jsonify({"erro": "Categoria não encontrada"}), 404
        p.id_categoria = dados.get('id_categoria')

    # ATUALIZAR ESTOQUE deve ser em outra rota
    if 'qtdd_atual' in dados:
        return jsonify({
            "erro": "Não é permitido atualizar a quantidade por esta rota."
        }), 400

    try:
        db.session.commit()
        return jsonify({"mensagem": f"Produto (Catálogo) {id_produto} atualizado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar produto", "detalhes": str(e)}), 500


@estoque_bp.route('/produtos/<int:id_produto>', methods=['DELETE'])
@jwt_required()
def deletar_produto(id_produto):
    """
    Deleta o Produto e sua entrada de Estoque,
    Falha se houver vendas registradas.
    """
    p = Produto.query.get_or_404(id_produto)
    e = Estoque.query.filter_by(id_produto=id_produto).first()

    try:
        # Deletar o estoque
        if e:
            db.session.delete(e)
        # Deletar o produto
        db.session.delete(p)
        db.session.commit()
        return jsonify({"mensagem": f"Produto {id_produto} e seu estoque foram deletados!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar. Produto pode estar associado a vendas.", "detalhes": str(e)}), 500


# ROTAS DE MOVIMENTAÇÃO DE ESTOQUE
@estoque_bp.route('/abastecer', methods=['POST'])
@jwt_required()
def abastecer_estoque():
    """
    Regista entrada de produtos de um fornecedor, atualizando o estoque
    """
    dados = request.get_json()
    id_produto = dados.get('id_produto')
    id_fornecedor = dados.get('id_fornecedor')
    qtdd_recebida = dados.get('qtdd_recebida')

    if not id_produto or not id_fornecedor or not qtdd_recebida:
        return jsonify({"erro": "id_produto, id_fornecedor e qtdd_recebida são obrigatórios"}), 400

    try:
        qtdd_recebida = int(qtdd_recebida)
        if qtdd_recebida <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"erro": "Quantidade recebida deve ser um número inteiro positivo"}), 400

    fornecedor = Fornecedor.query.get(id_fornecedor)
    if not fornecedor:
        return jsonify({"erro": f"Fornecedor com ID {id_fornecedor} não encontrado"}), 404

    estoque = Estoque.query.filter_by(id_produto=id_produto).first()
    if not estoque:
        return jsonify({"erro": f"Produto com ID {id_produto} não possui entrada de estoque"}), 404

    try:
        novo_abastecimento = Abastece(
            id_fornecedor=id_fornecedor,
            id_estoque=estoque.id_estoque,
            qtdd_recebida=qtdd_recebida,
            valor_unitario=dados.get('valor_unitario')
        )

        estoque.qtdd_atual = Estoque.qtdd_atual + qtdd_recebida
        estoque.qtdd_entrada = Estoque.qtdd_entrada + qtdd_recebida

        db.session.add(novo_abastecimento)
        db.session.commit()

        return jsonify({
            "mensagem": "Estoque abastecido com sucesso!",
            "id_estoque": estoque.id_estoque,
            "produto": estoque.produto.nome_produto,
            "nova_quantidade_atual": estoque.qtdd_atual
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao abastecer estoque", "detalhes": str(e)}), 500


@estoque_bp.route('/ajuste/<int:id_estoque>', methods=['PUT'])
@jwt_required()
def ajustar_estoque(id_estoque):
    """
    Ajusta a quantidade de um item no estoque
    """
    dados = request.get_json()

    if 'nova_quantidade' not in dados:
        return jsonify({"erro": "'nova_quantidade' é obrigatória"}), 400

    try:
        nova_quantidade = int(dados.get('nova_quantidade'))
        if nova_quantidade < 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"erro": "Nova quantidade deve ser um número inteiro não-negativo"}), 400

    estoque = Estoque.query.get_or_404(id_estoque)

    try:
        estoque.qtdd_atual = nova_quantidade
        db.session.commit()

        return jsonify({
            "mensagem": "Estoque ajustado com sucesso!",
            "id_estoque": estoque.id_estoque,
            "produto": estoque.produto.nome_produto,
            "nova_quantidade_atual": estoque.qtdd_atual
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao ajustar estoque", "detalhes": str(e)}), 500