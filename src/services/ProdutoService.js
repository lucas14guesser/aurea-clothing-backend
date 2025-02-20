const db = require('../db');

module.exports = {
    cadastrarProduto: async (nome_produto, categoria_produto, preco_produto, parcela_produto, img_produto, public_id, qtd_produto, cor_produto, tamanho_produto, subcategoria_produto) => {
        try {
            const [results] = await db.query('INSERT INTO produtos (nome_produto, categoria_produto, preco_produto, parcela_produto, img_produto, public_id,  qtd_produto, cor_produto, tamanho_produto, subcategoria_produto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [nome_produto, categoria_produto, preco_produto, parcela_produto, img_produto, public_id, qtd_produto, cor_produto, tamanho_produto, subcategoria_produto]);
            return results.insertId;
        } catch (error) {
            throw error;
        }
    },
    verificarTodosProdutos: async () => {
        try {
            const [results] = await db.query('SELECT * FROM produtos');
            return results;
        } catch (error) {
            throw error;
        }
    },

    verificarProdutoPorId: async (id_produto) => {
        try {
            const [results] = await db.query('SELECT * FROM produtos WHERE id_produto = ?', [id_produto]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarProdutoPorCategoria: async (categoria_produto) => {
        try {
            const [results] = await db.query('SELECT * FROM produtos WHERE categoria_produto = ?', [categoria_produto]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarProdutoPorSubcategoria: async (subcategoria_produto) => {
        try {
            const [results] = await db.query('SELECT * FROM produtos WHERE subcategoria_produto = ?', [subcategoria_produto]);
            return results
        } catch (error) {
            throw error;
        }
    },

    listarProdutoPorNome: async (nome_produto) => {
        try {
            const [results] = await db.query('SELECT * FROM produtos WHERE nome_produto = ? ', [nome_produto]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    editarProduto: async (id_produto, camposValores) => {
        try {
            const campos = Object.keys(camposValores);
            const valores = Object.values(camposValores); // Use Object.values para pegar os valores reais

            const camposFiltrados = campos.filter(campo => valores[campos.indexOf(campo)] !== undefined && valores[campos.indexOf(campo)] !== null);
            const valoresFiltrados = camposFiltrados.map(campo => camposValores[campo]);

            if (camposFiltrados.length === 0) {
                throw new Error('Nenhum campo válido para atualizar');
            }

            const sets = camposFiltrados.map(campo => `${campo} = ?`).join(', ');

            const [results] = await db.query(`UPDATE produtos SET ${sets} WHERE id_produto = ?`, [...valoresFiltrados, id_produto]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    excluirProduto: async (id_produto) => {
        try {
            const [results] = await db.query('DELETE FROM produtos WHERE id_produto = ?', [id_produto]);
            if (results.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    },

    cadastrarProdutoListaAmei: async (id_user, id_produto) => {
        try {
            if (!id_user || !id_produto) {
                throw new Error('ID do usuário e ID do produto são obrigatórios.');
            }
            const [results] = await db.query(`INSERT INTO lista_amei (id_user, id_produto) VALUES (?, ?)`, [id_user, id_produto]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    buscarListaAmei: async (id_user) => {
        try {
            if (!id_user) {
                throw new Error('ID do usuário é obrigatório.');
            }

            const [results] = await db.query(`SELECT p.id_produto, p.nome_produto, p.categoria_produto, p.img_produto, p.preco_produto, p.preco_promocional_produto, p.parcela_produto, p.qtd_produto FROM lista_amei l JOIN produtos p ON l.id_produto = p.id_produto WHERE l.id_user = ? `, [id_user]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    removerProdutoListaAmei: async (id_user, id_produto) => {
        try {
            const [results] = await db.query(`DELETE FROM lista_amei WHERE id_user = ? AND id_produto = ?`, [id_user, id_produto]);

            return results.affectedRows > 0; // Retorna true se o produto foi removido
        } catch (error) {
            throw error;
        }
    },

    cadastrarProdutoCarrinho: async (id_user, id_produto, qtd_produto_carrinho) => {
        try {
            if (!id_user || !id_produto) {
                throw new Error('ID do usuário e ID do produto são obrigatórios.');
            }
            const [results] = await db.query(`INSERT INTO carrinho (id_user, id_produto, qtd_produto_carrinho) VALUES (?, ?, ?)`, [id_user, id_produto, qtd_produto_carrinho]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    buscarCarrinho: async (id_user) => {
        try {
            if (!id_user) {
                throw new Error('ID do usuário é obrigatório.');
            }

            const [results] = await db.query(`SELECT * from carrinho where id_user = ?`, [id_user]);
            return Array.isArray(results) ? results : [];
        } catch (error) {
            throw error;
        }
    },

    atualizarQuantidadeProdutoCarrinho: async (id_carrinho, qtd_produto_carrinho) => {
        try {
            // Verifica se o produto com esse id_carrinho existe no banco
            const [result] = await db.query('SELECT * FROM Carrinho WHERE id_carrinho = ?', [id_carrinho]);

            if (result.length === 0) {
                throw new Error('Produto não encontrado no carrinho');
            }

            const produtoCarrinho = result[0];

            // Verifica se a quantidade foi alterada
            if (produtoCarrinho.qtd_produto_carrinho === qtd_produto_carrinho) {
                throw new Error('A quantidade não foi alterada.');
            }

            // Atualiza a quantidade no banco
            await db.query(
                'UPDATE Carrinho SET qtd_produto_carrinho = ? WHERE id_carrinho = ?',
                [qtd_produto_carrinho, id_carrinho]
            );

            // Retorna a quantidade atualizada
            return { message: 'Quantidade atualizada com sucesso' };

        } catch (error) {
            throw new Error('Erro ao atualizar a quantidade no carrinho: ' + error.message);
        }
    },

    calcularEAtualizarSubtotal: async (id_user, frete = 0, desconto = 0) => {
        try {
            // Busca todos os produtos no carrinho do usuário
            const [produtosCarrinho] = await db.query(`
                SELECT c.qtd_produto_carrinho, 
                       IFNULL(p.preco_promocional_produto, p.preco_produto) AS preco_produto
                FROM carrinho c
                JOIN produtos p ON c.id_produto = p.id_produto
                WHERE c.id_user = ?
            `, [id_user]);

            if (produtosCarrinho.length === 0) {
                throw new Error('Carrinho vazio ou usuário não encontrado.');
            }

            // Calcula o subtotal
            const subtotal = produtosCarrinho.reduce((acc, item) => {
                return acc + item.qtd_produto_carrinho * item.preco_produto;
            }, 0);

            // Calcula o total incluindo o frete e desconto
            const total = subtotal + frete - desconto;

            // Atualiza o valor total no banco
            await db.query(
                'UPDATE carrinho SET valor_total = ? WHERE id_user = ?',
                [total, id_user]
            );

            return { message: 'Valor total atualizado com sucesso', total };
        } catch (error) {
            throw new Error('Erro ao calcular e atualizar o total: ' + error.message);
        }
    },

    removerProdutoCarrinho: async (id_user, id_produto) => {
        try {
            const [results] = await db.query(`DELETE FROM carrinho WHERE id_user = ? AND id_produto = ?`, [id_user, id_produto]);

            return results.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    removerTodosProdutosCarrinho: async (id_user) => {
        if (isNaN(id_user)) {
            throw new Error("ID de usuário inválido.");
        }
        try {
            const [results] = await db.query(`DELETE FROM carrinho WHERE id_user = ?`, [id_user]);
            return results.affectedRows > 0;
        } catch (error) {
            console.error("Erro no serviço ao remover todos os produtos:", error);
            throw error;
        }
    },

    buscarProdutoPorNome: async (nome_produto) => {
        try {
            const [results] = await db.query(
                'SELECT * FROM produtos WHERE nome_produto LIKE ?',
                [`%${nome_produto}%`]
            );
            return results;
        } catch (error) {
            throw new Error('Erro ao buscar produtos por nome: ' + error.message);
        }
    },

    buscarProdutoPorCategoria: async (categoria_produto) => {
        try {
            const [results] = await db.query(
                'SELECT * FROM produtos WHERE categoria_produto LIKE ?',
                [`%${categoria_produto}%`]
            );
            return results;
        } catch (error) {
            throw new Error('Erro ao buscar produtos por categoria: ' + error.message);
        }
    },

    verificarProdutosPorIdPedido: async (id_pedido) => {
        try {
            // Buscar todos os produtos associados ao id_pedido
            const [resultPedido] = await db.query(
                `SELECT ip.id_produto
                 FROM itens_pedido ip
                 WHERE ip.id_pedido = ?`, [id_pedido]
            );

            if (resultPedido.length > 0) {
                const idsProdutos = resultPedido.map(item => item.id_produto); // Obtendo todos os ids dos produtos

                // Buscar todos os produtos com os ids encontrados
                const [resultProdutos] = await db.query(
                    `SELECT * FROM produtos WHERE id_produto IN (?)`, [idsProdutos]
                );

                if (resultProdutos.length > 0) {
                    return resultProdutos; // Retorna todos os produtos encontrados
                } else {
                    throw new Error('Produtos não encontrados');
                }
            } else {
                throw new Error('Pedido não encontrado na tabela itens_pedido');
            }
        } catch (error) {
            console.error('Erro ao verificar produtos por ID do pedido:', error); // Log de erro para diagnóstico
            throw error; // Re-lançando o erro para o controller tratar
        }
    },

    buscarProdutoPorId: async (id_produto) => {
        try {
            const [results] = await db.query('SELECT qtd_produto FROM produtos WHERE id_produto = ?', [id_produto]);
            if (results.length === 0) {
                throw new Error(`Produto com ID ${id_produto} não encontrado.`);
            }
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    atualizarQuantidadeProduto: async (id_produto, novaQuantidade) => {
        try {
            const [result] = await db.query('UPDATE produtos SET qtd_produto = ? WHERE id_produto = ?', [novaQuantidade, id_produto]);
            if (result.affectedRows === 0) {
                throw new Error(`Falha ao atualizar o estoque do produto com ID ${id_produto}.`);
            }
        } catch (error) {
            throw error;
        }
    },

}