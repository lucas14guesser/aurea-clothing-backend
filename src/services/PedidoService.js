const db = require('../db');

module.exports = {
    fazerPedido: async (produtosCarrinho, id_user, dataPedido, statusPagamento, statusPedido, endereco, numEndereco, opcaoFrete) => {
        try {
            // Inserção do pedido
            const [result] = await db.query(
                `INSERT INTO pedidos (id_user, data_pedido, pagamento_pedido, status_pedido, endereco_pedido, num_endereco_pedido, opcao_frete_pedido) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id_user, dataPedido, statusPagamento, statusPedido, endereco, numEndereco, opcaoFrete]
            );
    
            if (result.affectedRows === 0) {
                console.error("Falha ao registrar o pedido");
                throw new Error("Falha ao registrar o pedido");
            }
    
            // Log do ID do pedido gerado
            const id_pedido = result.insertId;
    
            // Agora insira os itens no pedido
            for (const item of produtosCarrinho) {
                const { id_produto, qtd_produto } = item;
                const [resultItem] = await db.query(
                    `INSERT INTO itens_pedido (id_pedido, id_produto, qtd_produto) 
                    VALUES (?, ?, ?)`,
                    [id_pedido, id_produto, qtd_produto]
                );
    
                if (resultItem.affectedRows === 0) {
                    console.error(`Falha ao registrar item do pedido: Produto ID ${id_produto}`);
                    throw new Error(`Falha ao registrar item do pedido: Produto ID ${id_produto}`);
                }
    
            }
    
            return { id_pedido };
        } catch (error) {
            console.error("Erro ao registrar o pedido:", error);
            throw error;
        }
    },

    listarTodosPedidos: async () => {
        try {
            const [results] = await db.query('SELECT * FROM pedidos');
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarPedidoPorId: async (id_pedido) => {
        try {
            const [results] = await db.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id_pedido]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarPedidoPorIdUser: async (id_user) => {
        try {
            const query = `
                SELECT p.id_pedido, p.data_pedido, p.status_pedido, p.endereco_pedido, p.num_endereco_pedido, p.opcao_frete_pedido, p.cd_rastreio_frete_pedido, 
                       pr.nome_produto, pr.cor_produto, pr.tamanho_produto, pr.preco_produto, pr.img_produto,
                       SUM(ip.qtd_produto) AS qtd_produto
                FROM pedidos p
                JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
                JOIN produtos pr ON ip.id_produto = pr.id_produto
                WHERE p.id_user = ?
                GROUP BY p.id_pedido, pr.id_produto, pr.nome_produto, pr.cor_produto, pr.tamanho_produto, pr.preco_produto, pr.img_produto
                ORDER BY p.data_pedido DESC;
            `;
            const [results] = await db.query(query, [id_user]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    alterarStatusPedido: async (id_pedido, status_pedido) => {
        try {
            const [results] = await db.query('UPDATE pedidos SET status_pedido = ? WHERE id_pedido = ?', [status_pedido, id_pedido]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    avaliarPedido: async (nivel_avaliacao, descricao_avaliacao, data_avaliacao, titulo_avaliacao, id_user, id_produto) => {
        try {
            const [results] = await db.query('INSERT INTO avaliacoes (nivel_avaliacao, descricao_avaliacao, data_avaliacao, titulo_avaliacao, id_user, id_produto) VALUES (?, ?, ?, ?, ?, ?)', [nivel_avaliacao, descricao_avaliacao, data_avaliacao, titulo_avaliacao, id_user, id_produto]);
            return results.insertId;
        } catch (error) {
            throw error;
        }
    },

    listarAvaliacaoPorIdProduto: async (id_produto) => {
        try {
            const [results] = await db.query('SELECT * FROM avaliacoes WHERE id_produto = ?', [id_produto]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    gerarCupomDesconto: async (nome_cupom, validade_cupom, desconto_cupom) => {
        try {
            const [results] = await db.query('INSERT INTO cupom (nome_cupom, validade_cupom, desconto_cupom) VALUES ( ?, ?, ?)', [nome_cupom, validade_cupom, desconto_cupom]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    excluirCuponsExpirados: async () => {
        try {
            const [results] = await db.query('DELETE FROM cupom WHERE validade_cupom < NOW()');
            if (results.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    },

    listarTodosCupom: async () => {
        try {
            await module.exports.excluirCuponsExpirados();
            const [results] = await db.query('SELECT * FROM cupom');
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarCupomPorNome: async (nome_cupom) => {
        try {
            await module.exports.excluirCuponsExpirados();
            const [results] = await db.query('SELECT * FROM cupom WHERE nome_cupom = ?', [nome_cupom]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    deletarCupomPorNome: async (nome_cupom) => {
        try {
            const [results] = await db.query('DELETE FROM cupom WHERE nome_cupom = ?', [nome_cupom]);
            if (results.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    },

    adicionarCdRastreio: async (id_pedido, cd_rastreio_frete_pedido) => {
        try {
            const [results] = await db.query('UPDATE pedidos SET cd_rastreio_frete_pedido = ? WHERE id_pedido = ?', [cd_rastreio_frete_pedido, id_pedido]);
            if (results.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    },

    listarTodosItensPedidos: async () => {
        try {
            const [results] = await db.query('SELECT * FROM itens_pedido');
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarItensPedidoPorIdPedido: async (id_pedido) => {
        try {
            const [results] = await db.query(
                'SELECT id_produto, qtd_produto FROM itens_pedido WHERE id_pedido = ?',
                [id_pedido]
            );
            return results; // Retorna todos os itens com id_produto e quantidade
        } catch (error) {
            throw error;
        }
    },
}