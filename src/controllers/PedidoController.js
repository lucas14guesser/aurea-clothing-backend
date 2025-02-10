const PedidoService = require('../services/PedidoService');

module.exports = {
    fazerPedido: async (req, res) => {
        let json = { error: '', result: {} };

        // Desestruturação dos dados do corpo da requisição
        const {
            produtos_carrinho,
            id_user,
            data_pedido,
            pagamento_pedido,
            status_pedido,
            endereco_pedido,
            num_endereco_pedido,
            opcao_frete_pedido
        } = req.body;

        // Validação dos campos
        if (
            produtos_carrinho && produtos_carrinho.length > 0 &&
            id_user && data_pedido && pagamento_pedido &&
            status_pedido && endereco_pedido && num_endereco_pedido && opcao_frete_pedido
        ) {
            try {
                const resultado = await PedidoService.fazerPedido(
                    produtos_carrinho,
                    id_user,
                    data_pedido,
                    pagamento_pedido,
                    status_pedido,
                    endereco_pedido,
                    num_endereco_pedido,
                    opcao_frete_pedido
                );

                json.result = resultado; // Retorna o resultado com o pedido e os itens inseridos
            } catch (error) {
                json.error = 'Erro ao fazer o pedido. ' + error.message;
            }
        } else {
            json.error = 'Campos não enviados ou inválidos.';
        }

        res.json(json);
    },

    listarTodosPedidos: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let pedidos = await PedidoService.listarTodosPedidos();

            if (pedidos.length > 0) {
                json.result = pedidos;
            } else {
                json.error = 'Não existem pedidos.';
            }
        } catch (error) {
            json.error = 'Erro ao listar pedidos.' + error.message;
        }
        res.json(json);
    },

    listarPedidoPorId: async (req, res) => {
        let json = { error: '', result: [] };

        let idPedido = req.params.id_pedido;

        if (idPedido) {
            try {
                let pedido = await PedidoService.listarPedidoPorId(idPedido);

                if (pedido.length > 0) {
                    json.result = pedido[0];
                } else {
                    json.error = 'Não existe pedido com este ID.';
                }
            } catch (error) {
                json.error = 'Erro ao listar produto por ID.' + error.message;
            }
        } else {
            json.error = 'ID do pedido inválido.';
        }
        res.json(json);
    },

    listarPedidoPorIdUser: async (req, res) => {
        let json = { error: '', result: [] };

        let idUser = req.params.id_user;

        if (idUser) {
            try {
                let pedidos = await PedidoService.listarPedidoPorIdUser(idUser);

                if (pedidos.length > 0) {
                    // Agrupar os pedidos com seus produtos
                    let pedidosAgrupados = [];

                    pedidos.forEach((pedido) => {
                        // Verifica se o pedido já existe na lista agrupada
                        const existingPedido = pedidosAgrupados.find(p => p.id_pedido === pedido.id_pedido);

                        if (existingPedido) {
                            // Se o pedido já existe, apenas adiciona o produto ao pedido
                            existingPedido.itens.push({
                                nome_produto: pedido.nome_produto,
                                cor_produto: pedido.cor_produto,
                                tamanho_produto: pedido.tamanho_produto,
                                preco_produto: pedido.preco_produto,
                                img_produto: pedido.img_produto,
                                qtd_produto: pedido.qtd_produto
                            });
                        } else {
                            // Se o pedido não existe, cria um novo pedido
                            pedidosAgrupados.push({
                                id_pedido: pedido.id_pedido,
                                data_pedido: pedido.data_pedido,
                                status_pedido: pedido.status_pedido,
                                endereco_pedido: pedido.endereco_pedido,
                                num_endereco_pedido: pedido.num_endereco_pedido,
                                opcao_frete_pedido: pedido.opcao_frete_pedido,
                                cd_rastreio_frete_pedido: pedido.cd_rastreio_frete_pedido,
                                itens: [{
                                    nome_produto: pedido.nome_produto,
                                    cor_produto: pedido.cor_produto,
                                    tamanho_produto: pedido.tamanho_produto,
                                    preco_produto: pedido.preco_produto,
                                    img_produto: pedido.img_produto,
                                    qtd_produto: pedido.qtd_produto
                                }]
                            });
                        }
                    });

                    json.result = pedidosAgrupados;
                } else {
                    json.error = 'Não existe pedido associado a este usuário.';
                }
            } catch (error) {
                json.error = 'Erro ao buscar pedido.' + error.message;
            }
        } else {
            json.error = 'ID do usuário inválido.';
        }

        res.json(json);
    },

    AlterarStatusPedido: async (req, res) => {
        let json = { error: '', result: {} };

        let idPedido = req.params.id_pedido;
        let statusPedido = req.body.status_pedido;

        if (idPedido && statusPedido) {
            try {
                await PedidoService.alterarStatusPedido(idPedido, statusPedido);
                json.result = 'Status atualizado.'
            } catch (error) {
                json.error = 'Não foi possível atualizar o status.'
            }
        } else {
            json.error = 'Campos não enviados.'
        }
        res.json(json);
    },

    avaliarPedido: async (req, res) => {
        let json = { error: '', result: {} };

        let { nivel_avaliacao, descricao_avaliacao, data_avaliacao, titulo_avaliacao, id_user, id_produto } = req.body;

        try {
            if (!id_user) {
                json.error = 'É preciso estar logado para avaliar o produto.';
            }

            if (!id_produto) {
                json.error = 'É preciso ter um produto para realizar a avaliação.';
            }

            if (id_user && id_produto && nivel_avaliacao && data_avaliacao && titulo_avaliacao || descricao_avaliacao) {
                const avaliacao = await PedidoService.avaliarPedido(nivel_avaliacao, descricao_avaliacao, data_avaliacao, titulo_avaliacao, id_user, id_produto);
                json.result = avaliacao;
            } else {
                json.error = 'Todos os campos precisam ser preenchidos.'
            }
        } catch (error) {
            json.error = 'Erro ao avaliar o produto.' + error;
        }
        res.json(json);
    },

    listarAvaliacaoPorIdProduto: async (req, res) => {
        let json = { error: '', result: [] };

        let { id_produto } = req.params;

        if (id_produto) {
            try {
                const avaliacao = await PedidoService.listarAvaliacaoPorIdProduto(id_produto);
                if (avaliacao.length > 0) {
                    json.result = avaliacao;
                } else {
                    json.error = 'Este produto não possui avaliação.'
                }
            } catch (error) {
                json.error = 'Erro ao listar avaliação do produto.'
                console.error('Erro' + error.message);
            }
        } else {
            json.error = 'O ID do produto não existe.';
        }
        res.json(json);
    },

    gerarCupomDesconto: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_cupom, validade_cupom, desconto_cupom } = req.body;

        if (nome_cupom && validade_cupom && desconto_cupom) {
            try {
                const gerarCupom = await PedidoService.gerarCupomDesconto(nome_cupom, validade_cupom, desconto_cupom);
                json.result = gerarCupom;
            } catch (error) {
                json.error = 'Erro ao gerar cupom de desconto' + error.message;
            }
        } else {
            json.error = 'Necessário preencher todos os campos.'
        }
        res.json(json);
    },

    listarTodosCupom: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let todosCupom = await PedidoService.listarTodosCupom();

            if (todosCupom.length > 0) {
                json.result = todosCupom;
            } else {
                json.error = 'Não existe cupom.';
            }
        } catch (error) {
            json.error = 'Erro ao listar todos os cupons.' + error.message;
        }
        res.json(json);
    },

    listarCupomPorNome: async (req, res) => {
        let json = { error: '', result: [] };

        let { nome_cupom } = req.params;

        if (nome_cupom) {
            try {
                const cupomPorNome = await PedidoService.listarCupomPorNome(nome_cupom);
                if (cupomPorNome.length > 0) {
                    json.result = cupomPorNome;
                } else {
                    json.error = 'Não existe cupom com este nome.'
                }
            } catch (error) {
                json.error = 'Erro ao listar cupom por nome.' + error.message;
            }
        } else {
            json.error = 'Cupom não está sendo passado.';
        }
        res.json(json);
    },

    deletarCupomPorNome: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_cupom } = req.params;

        if (nome_cupom) {
            try {
                const deletarCupom = await PedidoService.deletarCupomPorNome(nome_cupom);
                if (deletarCupom) {
                    json.result = deletarCupom;
                } else {
                    json.error = 'Erro ao deletar cupom.';
                }
            } catch (error) {
                json.error = 'Erro ao deletar cupom' + error.message;
            }
        } else {
            json.error = 'Não existe cupom com este nome.';
        }
        res.json(json);
    },

    adicionarCdRastreio: async (req, res) => {
        let json = { error: '', result: {} };

        let { id_pedido } = req.params;
        let { cd_rastreio_frete_pedido } = req.body;

        if (id_pedido && cd_rastreio_frete_pedido) {
            try {
                const adicionarCd = await PedidoService.adicionarCdRastreio(id_pedido, cd_rastreio_frete_pedido);
                if (adicionarCd) {
                    json.result = adicionarCd;
                } else {
                    json.error = 'Erro ao adicionar código de rastreio.' + error.message;
                }
            } catch (error) {
                json.error = 'Erro ao adicionar código de rastreio.' + error.message;
            }
        } else {
            json.error = 'Todos os campos precisam ser preenchidos.';
        }
        res.json(json);
    },

    listarTodosItensPedidos: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let pedidos = await PedidoService.listarTodosItensPedidos();

            if (pedidos.length > 0) {
                json.result = pedidos;
            } else {
                json.error = 'Não existem pedidos.';
            }
        } catch (error) {
            json.error = 'Erro ao listar pedidos.' + error.message;
        }
        res.json(json);
    },

    listarItensPedidoPorIdPedido: async (req, res) => {
        let json = { error: '', result: [] };
    
        let { id_pedido } = req.params;
    
        if (id_pedido) {
            try {
                let itensPedido = await PedidoService.listarItensPedidoPorIdPedido(id_pedido);
    
                if (itensPedido.length > 0) {
                    json.result = itensPedido; // Retorna os produtos distintos
                } else {
                    json.error = 'Não existe pedido com este ID.';
                }
            } catch (error) {
                json.error = 'Erro ao listar itens do pedido: ' + error.message;
            }
        } else {
            json.error = 'ID do pedido não foi informado.';
        }
    
        res.json(json);
    },
}