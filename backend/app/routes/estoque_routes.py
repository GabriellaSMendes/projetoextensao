from flask import request, jsonify, Blueprint
from app.models import db, Produto, Categoria, Fornecedor, Abastece, MovimentacaoEstoque, TipoMovimentacao, Usuario
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from datetime import date

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
    Lista todos os produtos, incluindo o fornecedor do último abastecimento.
    """
    produtos = Produto.query.all()
    lista_json = []
    
    for p in produtos:
        # Buscar o último abastecimento para descobrir o fornecedor recente
        ultimo_abastecimento = (
            Abastece.query
            .filter_by(id_produto=p.id_produto)
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
            "nome_produto": p.nome_produto,
            "sabor": p.sabor,
            "marca": p.marca,
            "qtdd_atual": p.qtdd_atual, # v2: direto da tabela produto
            "data_vencimento": p.data_vencimento.isoformat() if p.data_vencimento else None,
            "preco_unitario": str(p.preco_unitario),
            "id_categoria": p.id_categoria,
            "nome_categoria": p.categoria.nome if p.categoria else None,
            "id_fornecedor": id_fornecedor,
            "nome_fornecedor": nome_fornecedor
        })
    return jsonify(produtos=lista_json), 200

@estoque_bp.route('/produtos/<int:id_produto>', methods=['GET'])
@jwt_required()
def detalhar_produto(id_produto):
    """
    Retorna os dados de um único produto
    """
    p = Produto.query.get_or_404(id_produto)

    produto_json = {
        "id_produto": p.id_produto,
        "nome_produto": p.nome_produto,
        "sabor": p.sabor,
        "marca": p.marca,
        "qtdd_atual": p.qtdd_atual,
        "data_vencimento": p.data_vencimento.isoformat() if p.data_vencimento else None,
        "preco_unitario": str(p.preco_unitario),
        "id_categoria": p.id_categoria,
        "nome_categoria": p.categoria.nome if p.categoria else None
    }

    return jsonify(produto=produto_json), 200

@estoque_bp.route('/produtos/<int:id_produto>/movimentacoes', methods=['GET'])
@jwt_required()
def listar_movimentacoes_produto(id_produto):
    """
    Lista o histórico de movimentações de estoque de um produto.
    """
    produto = Produto.query.get_or_404(id_produto)

    movimentacoes = (
        db.session.query(MovimentacaoEstoque, TipoMovimentacao, Usuario)
        .join(
            TipoMovimentacao,
            MovimentacaoEstoque.id_tipo_movimentacao == TipoMovimentacao.id_tipo_movimentacao
        )
        .join(
            Usuario,
            MovimentacaoEstoque.id_usuario == Usuario.id_usuario
        )
        .filter(MovimentacaoEstoque.id_produto == id_produto)
        .order_by(MovimentacaoEstoque.ultima_atualizacao.desc())
        .all()
    )

    lista_json = []

    for mov, tipo, usuario in movimentacoes:
        lista_json.append({
            "id_movimentacao": mov.id_estoque,
            "id_produto": mov.id_produto,
            "nome_produto": produto.nome_produto,
            "tipo_movimentacao": tipo.tipo_movimentacao,
            "qtdd_movimentacao": mov.qtdd_movimentacao,
            "usuario": usuario.nome_usuario,
            "ultima_atualizacao": mov.ultima_atualizacao.isoformat() if mov.ultima_atualizacao else None
        })

    return jsonify(movimentacoes=lista_json), 200

@estoque_bp.route('/produtos', methods=['POST'])
@jwt_required()
def criar_produto():
    """
    Cria um novo PRODUTO e (opcionalmente) regista o seu abastecimento inicial.
    """
    dados = request.get_json()

    if not dados.get('nome_produto') or not dados.get('preco_unitario') or not dados.get('id_categoria'):
        return jsonify({"erro": "Nome, Preço Unitário e Categoria são obrigatórios"}), 400

    if not Categoria.query.get(dados.get('id_categoria')):
        return jsonify({"erro": "Categoria não encontrada"}), 404
    
    # Extrair fornecedor e quantidade inicial
    id_fornecedor = dados.get("id_fornecedor")
    qtdd_inicial = dados.get('qtdd_entrada', dados.get('qtdd_atual', 0))
    
    if id_fornecedor:
        fornecedor = Fornecedor.query.get(id_fornecedor)
        if not fornecedor:
            return jsonify({"erro": "Fornecedor inválido"}), 404

    nova_qtdd_atual = 0 if id_fornecedor else qtdd_inicial

    novo_produto = Produto(
        nome_produto=dados.get('nome_produto'),
        sabor=dados.get('sabor'),
        marca=dados.get('marca'),
        qtdd_atual=nova_qtdd_atual,
        data_vencimento=dados.get('data_vencimento'),
        preco_unitario=dados.get('preco_unitario'),
        id_categoria=dados.get('id_categoria')
    )

    try:
        db.session.add(novo_produto)
        db.session.flush()
        
        # Criar abastecimento inicial (se houver fornecedor)
        if id_fornecedor and qtdd_inicial > 0:
            abastecimento_inicial = Abastece(
                id_fornecedor=id_fornecedor,
                id_produto=novo_produto.id_produto,
                qtdd_recebida=qtdd_inicial,
                valor_unitario=dados.get("preco_unitario")
            )
            db.session.add(abastecimento_inicial)

        db.session.commit()
        
        # Atualiza a variável com o valor real após os triggers do banco de dados rodarem
        db.session.refresh(novo_produto)

        return jsonify({
            "mensagem": "Produto criado com sucesso!",
            "id_produto": novo_produto.id_produto,
            "qtdd_atual": novo_produto.qtdd_atual
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao criar produto", "detalhes": str(e)}), 500

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

    if 'qtdd_atual' in dados:
        return jsonify({
            "erro": "Não é permitido atualizar a quantidade do estoque por esta rota. Realize um abastecimento."
        }), 400

    try:
        db.session.commit()
        return jsonify({"mensagem": f"Catálogo do produto {id_produto} atualizado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar produto", "detalhes": str(e)}), 500


@estoque_bp.route('/produtos/<int:id_produto>', methods=['DELETE'])
@jwt_required()
def deletar_produto(id_produto):
    """
    Deleta o Produto e sua entrada de Estoque,
    Falha se houver histórico.
    """
    p = Produto.query.get_or_404(id_produto)

    try:
        db.session.delete(p)
        db.session.commit()
        return jsonify({"mensagem": f"Produto {id_produto} deletado com sucesso!"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar. O produto possui histórico de movimentação ou pedidos."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar produto", "detalhes": str(e)}), 500


# ROTAS DE MOVIMENTAÇÃO DE ESTOQUE
@estoque_bp.route('/abastecer', methods=['POST'])
@jwt_required()
def abastecer_estoque():
    """
    Regista entrada de produtos de um fornecedor, atualizando o estoque por triggers
    """
    dados = request.get_json()
    id_produto = dados.get('id_produto')
    id_fornecedor = dados.get('id_fornecedor')
    qtdd_recebida = dados.get('qtdd_recebida')
    id_usuario_logado = int(get_jwt_identity())

    if not id_produto or not id_fornecedor or not qtdd_recebida:
        return jsonify({"erro": "id_produto, id_fornecedor e qtdd_recebida são obrigatórios"}), 400

    if not Fornecedor.query.get(id_fornecedor):
        return jsonify({"erro": f"Fornecedor não encontrado"}), 404

    produto = Produto.query.get(id_produto)
    if not produto:
        return jsonify({"erro": f"Produto não encontrado"}), 404

    # Validação de Vencimento
    if produto.data_vencimento and produto.data_vencimento < date.today():
        return jsonify({
            "erro": f"Abastecimento bloqueado: O produto '{produto.nome_produto}' está vencido desde {produto.data_vencimento.strftime('%d/%m/%Y')}."
        }), 400

    try:
        novo_abastecimento = Abastece(
            id_fornecedor=id_fornecedor,
            id_produto=id_produto,
            numero_lote=dados.get('numero_lote'),
            id_usuario=id_usuario_logado,
            qtdd_recebida=qtdd_recebida,
            qtdd_disponivel=qtdd_recebida,
            valor_unitario=dados.get('valor_unitario'),
            data_vencimento=dados.get('data_vencimento')
        )
        db.session.add(novo_abastecimento)
        db.session.commit()

        return jsonify({
            "mensagem": "Abastecimento registrado com sucesso! Estoque atualizado automaticamente.",
            "id_abastecimento": novo_abastecimento.id_abastecimento
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao abastecer estoque", "detalhes": str(e)}), 500
    
@estoque_bp.route('/produtos/<int:id_produto>/abastecimentos', methods=['GET'])
@jwt_required()
def listar_abastecimentos_produto(id_produto):
    """
    Lista as entradas/abastecimentos de um produto,
    incluindo fornecedores relacionados.
    """
    produto = Produto.query.get_or_404(id_produto)

    abastecimentos = (
        db.session.query(Abastece, Fornecedor, Usuario)
        .join(
            Fornecedor,
            Abastece.id_fornecedor == Fornecedor.id_fornecedor
        )
        .join(
            Usuario,
            Abastece.id_usuario == Usuario.id_usuario
        )
        .filter(Abastece.id_produto == id_produto)
        .order_by(Abastece.data_vencimento.asc(), Abastece.dt_abastecimento.desc())
        .all()
    )

    lista_json = []

    for abastecimento, fornecedor, usuario in abastecimentos:
        lista_json.append({
            "id_abastecimento": abastecimento.id_abastecimento,
            "id_produto": produto.id_produto,
            "nome_produto": produto.nome_produto,
            "numero_lote": abastecimento.numero_lote,
            "id_fornecedor": fornecedor.id_fornecedor,
            "fornecedor": fornecedor.razao_social,
            "qtdd_recebida": abastecimento.qtdd_recebida,
            "valor_unitario": str(abastecimento.valor_unitario) if abastecimento.valor_unitario else None,
            "dt_abastecimento": abastecimento.dt_abastecimento.isoformat() if abastecimento.dt_abastecimento else None,
            "usuario": usuario.nome_usuario,
            "qtdd_disponivel": abastecimento.qtdd_disponivel,
            "data_vencimento": abastecimento.data_vencimento.isoformat() if abastecimento.data_vencimento else None
        })

    return jsonify(abastecimentos=lista_json), 200

# @estoque_bp.route('/ajuste/<int:id_estoque>', methods=['PUT'])
# @jwt_required()
# def ajustar_estoque(id_estoque):
#     """
#     Ajusta a quantidade de um item no estoque
#     """
#     dados = request.get_json()
#
#     if 'nova_quantidade' not in dados:
#         return jsonify({"erro": "'nova_quantidade' é obrigatória"}), 400
#
#     try:
#         nova_quantidade = int(dados.get('nova_quantidade'))
#         if nova_quantidade < 0:
#             raise ValueError
#     except (ValueError, TypeError):
#         return jsonify({"erro": "Nova quantidade deve ser um número inteiro não-negativo"}), 400
#
#     estoque = Estoque.query.get_or_404(id_estoque)
#
#     try:
#         estoque.qtdd_atual = nova_quantidade
#         db.session.commit()
#
#         return jsonify({
#             "mensagem": "Estoque ajustado com sucesso!",
#             "id_estoque": estoque.id_estoque,
#             "produto": estoque.produto.nome_produto,
#             "nova_quantidade_atual": estoque.qtdd_atual
#         }), 200
#
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"erro": "Erro ao ajustar estoque", "detalhes": str(e)}), 500