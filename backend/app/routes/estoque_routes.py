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
        lote_recomendado = (
            Abastece.query
            .filter(
                Abastece.id_produto == p.id_produto,
                Abastece.qtdd_disponivel > 0
            )
            .order_by(
                Abastece.data_vencimento.asc(),
                Abastece.id_abastecimento.asc()
            )
            .first()
        )

        if lote_recomendado:
            fornecedor = Fornecedor.query.get(lote_recomendado.id_fornecedor)
            nome_fornecedor = fornecedor.razao_social if fornecedor else None
            id_fornecedor = fornecedor.id_fornecedor if fornecedor else None
            numero_lote = lote_recomendado.numero_lote
            validade_lote = lote_recomendado.data_vencimento
        else:
            nome_fornecedor = None
            id_fornecedor = None
            numero_lote = None
            validade_lote = None
            
        lista_json.append({
            "id_produto": p.id_produto,
            "nome_produto": p.nome_produto,
            "sabor": p.sabor,
            "marca": p.marca,
            "qtdd_atual": p.qtdd_atual, # v2: direto da tabela produto
            "data_vencimento": p.data_vencimento.isoformat() if p.data_vencimento else None,
            "preco_unitario": str(p.preco_unitario),
            "custo_unitario": str(p.custo_unitario) if p.custo_unitario is not None else None,
            "id_categoria": p.id_categoria,
            "nome_categoria": p.categoria.nome if p.categoria else None,
            "id_fornecedor": id_fornecedor,
            "nome_fornecedor": nome_fornecedor,
            "numero_lote": numero_lote,
            "validade_lote": validade_lote.isoformat() if validade_lote else None,
            "qtdd_disponivel_lote": lote_recomendado.qtdd_disponivel if lote_recomendado else 0,
            "ativo": bool(p.ativo),
        })
    return jsonify(produtos=lista_json), 200

@estoque_bp.route('/produtos/<int:id_produto>', methods=['GET'])
@jwt_required()
def detalhar_produto(id_produto):
    produto = Produto.query.get_or_404(id_produto)

    ultimo_abastecimento = (
        Abastece.query
        .filter_by(id_produto=produto.id_produto)
        .order_by(Abastece.id_abastecimento.desc())
        .first()
    )

    if ultimo_abastecimento:
        fornecedor = Fornecedor.query.get(ultimo_abastecimento.id_fornecedor)
        nome_fornecedor = fornecedor.razao_social if fornecedor else None
        id_fornecedor = fornecedor.id_fornecedor if fornecedor else None
        numero_lote = ultimo_abastecimento.numero_lote
        validade_lote = ultimo_abastecimento.data_vencimento
    else:
        nome_fornecedor = None
        id_fornecedor = None
        numero_lote = None
        validade_lote = None

    return jsonify({
        "produto": {
            "id_produto": produto.id_produto,
            "nome_produto": produto.nome_produto,
            "sabor": produto.sabor,
            "marca": produto.marca,
            "qtdd_atual": produto.qtdd_atual,
            "data_vencimento": produto.data_vencimento.isoformat() if produto.data_vencimento else None,
            "preco_unitario": str(produto.preco_unitario),
            "custo_unitario": str(produto.custo_unitario) if produto.custo_unitario is not None else None,
            "id_categoria": produto.id_categoria,
            "nome_categoria": produto.categoria.nome if produto.categoria else None,
            "id_fornecedor": id_fornecedor,
            "nome_fornecedor": nome_fornecedor,
            "numero_lote": numero_lote,
            "validade_lote": validade_lote.isoformat() if validade_lote else None,
            "ativo": bool(produto.ativo),
            "dt_cadastro": produto.dt_cadastro.isoformat() if produto.dt_cadastro else None
        }
    }), 200
    
@estoque_bp.route('/produtos/<int:id_produto>/abastecimentos', methods=['GET'])
@jwt_required()
def listar_abastecimentos_produto(id_produto):
    produto = Produto.query.get_or_404(id_produto)

    abastecimentos = (
        Abastece.query
        .filter_by(id_produto=produto.id_produto)
        .order_by(Abastece.dt_abastecimento.desc())
        .all()
    )

    lista_json = []

    for ab in abastecimentos:
        fornecedor = Fornecedor.query.get(ab.id_fornecedor)

        lista_json.append({
            "id_abastecimento": ab.id_abastecimento,
            "id_produto": ab.id_produto,
            "id_fornecedor": ab.id_fornecedor,
            "fornecedor": fornecedor.razao_social if fornecedor else "-",
            "numero_lote": ab.numero_lote,
            "data_vencimento": ab.data_vencimento.isoformat() if ab.data_vencimento else None,
            "qtdd_recebida": ab.qtdd_recebida,
            "qtdd_disponivel": ab.qtdd_disponivel if ab.qtdd_disponivel is not None else ab.qtdd_recebida,
            "valor_unitario": str(ab.valor_unitario) if ab.valor_unitario is not None else None,
            "dt_abastecimento": ab.dt_abastecimento.isoformat() if ab.dt_abastecimento else None
        })

    return jsonify({"abastecimentos": lista_json}), 200

@estoque_bp.route('/produtos/<int:id_produto>/movimentacoes', methods=['GET'])
@jwt_required()
def listar_movimentacoes_produto(id_produto):
    Produto.query.get_or_404(id_produto)

    movimentacoes = (
        MovimentacaoEstoque.query
        .filter_by(id_produto=id_produto)
        .order_by(MovimentacaoEstoque.ultima_atualizacao.desc())
        .all()
    )

    lista_json = []

    for mov in movimentacoes:
        tipo = TipoMovimentacao.query.get(mov.id_tipo_movimentacao)
        usuario = Usuario.query.get(mov.id_usuario)

        tipo_nome = tipo.tipo_movimentacao if tipo else "-"

        lista_json.append({
            "id_movimentacao": mov.id_estoque,

            # Campos esperados pela tela atual
            "tipo_movimentacao": tipo_nome,
            "ultima_atualizacao": mov.ultima_atualizacao.isoformat() if mov.ultima_atualizacao else None,

            # Campos extras para manter compatibilidade
            "tipo": tipo_nome,
            "data": mov.ultima_atualizacao.isoformat() if mov.ultima_atualizacao else None,

            "id_tipo_movimentacao": mov.id_tipo_movimentacao,
            "qtdd_movimentacao": mov.qtdd_movimentacao,
            "usuario": usuario.nome_usuario if usuario else "-"
        })

    return jsonify({"movimentacoes": lista_json}), 200

@estoque_bp.route('/produtos', methods=['POST'])
@jwt_required()
def criar_produto():
    """
    Cria um novo PRODUTO e (opcionalmente) regista o seu abastecimento inicial.
    """
    dados = request.get_json()
    identity = get_jwt_identity()
    id_usuario_logado = int(identity)

    if not dados.get('nome_produto') or not dados.get('preco_unitario') or not dados.get('id_categoria'):
        return jsonify({"erro": "Nome, Preço Unitário e Categoria são obrigatórios"}), 400

    if not Categoria.query.get(dados.get('id_categoria')):
        return jsonify({"erro": "Categoria não encontrada"}), 404
    
    # Extrair fornecedor e quantidade inicial
    id_fornecedor = dados.get("id_fornecedor")
    qtdd_inicial = dados.get('qtdd_entrada', dados.get('qtdd_atual', 0))
    data_vencimento = dados.get("data_vencimento")

    if data_vencimento:
        data_vencimento_obj = date.fromisoformat(data_vencimento)

        if data_vencimento_obj < date.today():
            return jsonify({
                "erro": "Não é permitido cadastrar produto com lote vencido."
            }), 400

    if id_fornecedor:
        fornecedor = Fornecedor.query.get(id_fornecedor)
        if not fornecedor:
            return jsonify({"erro": "Fornecedor inválido"}), 404

    nova_qtdd_atual = qtdd_inicial

    novo_produto = Produto(
        nome_produto=dados.get('nome_produto'),
        sabor=dados.get('sabor'),
        marca=dados.get('marca'),
        qtdd_atual=nova_qtdd_atual,
        data_vencimento=data_vencimento,
        preco_unitario=dados.get('preco_unitario'),
        custo_unitario=dados.get('custo_unitario'),
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
                id_usuario=id_usuario_logado,
                qtdd_recebida=qtdd_inicial,
                valor_unitario=dados.get("custo_unitario", dados.get("preco_unitario")),
                numero_lote=dados.get("numero_lote"),
                data_vencimento=data_vencimento
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
    p.custo_unitario = dados.get('custo_unitario', p.custo_unitario)

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
    
@estoque_bp.route('/produtos/<int:id_produto>/status', methods=['PATCH'])
@jwt_required()
def alterar_status_produto(id_produto):
    """
    Ativa ou desativa um produto no catálogo.
    """
    produto = Produto.query.get_or_404(id_produto)
    dados = request.get_json()

    if 'ativo' not in dados:
        return jsonify({"erro": "O campo 'ativo' é obrigatório"}), 400

    produto.ativo = bool(dados.get('ativo'))

    try:
        db.session.commit()

        status = "ativado" if produto.ativo else "desativado"

        return jsonify({
            "mensagem": f"Produto {status} com sucesso!",
            "id_produto": produto.id_produto,
            "ativo": produto.ativo
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "erro": "Erro ao alterar status do produto",
            "detalhes": str(e)
        }), 500


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
    identity = get_jwt_identity()
    id_usuario_logado = int(identity)
    id_produto = dados.get('id_produto')
    id_fornecedor = dados.get('id_fornecedor')
    qtdd_recebida = dados.get('qtdd_recebida')

    if not id_produto or not id_fornecedor or not qtdd_recebida:
        return jsonify({"erro": "id_produto, id_fornecedor e qtdd_recebida são obrigatórios"}), 400

    if not Fornecedor.query.get(id_fornecedor):
        return jsonify({"erro": f"Fornecedor não encontrado"}), 404

    produto = Produto.query.get(id_produto)
    if not produto:
        return jsonify({"erro": f"Produto não encontrado"}), 404

    # Validação de Vencimento
    data_vencimento = dados.get("data_vencimento")

    if data_vencimento:
        data_vencimento_obj = date.fromisoformat(data_vencimento)

        if data_vencimento_obj < date.today():
            return jsonify({
                "erro": f"Abastecimento bloqueado: não é permitido registrar lote vencido para o produto '{produto.nome_produto}'."
            }), 400
    try:
        novo_abastecimento = Abastece(
            id_fornecedor=id_fornecedor,
            id_produto=id_produto,
            id_usuario=id_usuario_logado,
            qtdd_recebida=qtdd_recebida,
            valor_unitario=dados.get('valor_unitario'),
            numero_lote=dados.get('numero_lote'),
            data_vencimento=data_vencimento
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