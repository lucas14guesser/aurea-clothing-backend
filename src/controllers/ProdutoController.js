const ProdutoService = require('../services/ProdutoService');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const uploadPrdToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'produtos' }, // Mude para a pasta desejada
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

module.exports = {
    cadastrarProduto: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_produto, categoria_produto, preco_produto, parcela_produto, qtd_produto, cor_produto, tamanho_produto, subcategoria_produto } = req.body;
        let img_produto = req.file;

        if (nome_produto && categoria_produto && preco_produto && parcela_produto && img_produto && qtd_produto && cor_produto && tamanho_produto) {
            try {
                // Upload da imagem para o Cloudinary usando a nova função
                const uploadResponse = await uploadPrdToCloudinary(img_produto.buffer);

                // Salva as informações do produto no banco de dados
                await ProdutoService.cadastrarProduto(
                    nome_produto,
                    categoria_produto,
                    preco_produto,
                    parcela_produto,
                    uploadResponse.secure_url, // URL da imagem
                    uploadResponse.public_id, // Public ID da imagem
                    qtd_produto,
                    cor_produto,
                    tamanho_produto,
                    subcategoria_produto || null
                );

                json.result = 'Produto cadastrado com sucesso!';
            } catch (error) {
                json.error = 'Erro ao cadastrar produto: ' + error.message;
            }
        } else {
            json.error = 'Campos não enviados';
        }
        res.json(json);
    },

    verificarTodosProdutos: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let produtos = await ProdutoService.verificarTodosProdutos();

            if (produtos.length > 0) {
                json.result = produtos;
            } else {
                json.error = 'Não existem produtos';
            }
        } catch (error) {
            json.error = 'Erro ao buscar produtos: ' + error.message;
        }
        res.json(json);
    },

    verificarProdutoPorId: async (req, res) => {
        let json = { error: '', result: [] };

        let idProduto = req.params.id_produto;

        if (idProduto) {
            try {
                let produto = await ProdutoService.verificarProdutoPorId(idProduto);

                if (produto.length > 0) {
                    json.result = produto[0];
                } else {
                    json.error = 'Produto não encontrado.';
                }
            } catch (error) {
                json.error = 'Erro ao buscar produto.' + error.message;
            }
        } else {
            json.error = 'Não existe produto com este ID.';
        }
        res.json(json);
    },

    listarProdutoPorCategoria: async (req, res) => {
        let json = { error: '', result: [] };

        let categoriaProduto = req.params.categoria_produto;

        if (categoriaProduto) {
            try {
                let produto = await ProdutoService.listarProdutoPorCategoria(categoriaProduto);

                if (produto.length > 0) {
                    json.result = produto;
                } else {
                    json.error = 'Produto não encontrado.'
                }
            } catch (error) {
                json.error = 'Erro ao encontrar produto.' + error.message;
            }
        }
        res.json(json);
    },

    listarProdutoPorSubcategoria: async (req, res) => {
        let json = { error: '', result: [] };

        let subcategoriaProduto = req.params.subcategoria_produto;

        if (subcategoriaProduto) {
            try {
                let produto = await ProdutoService.listarProdutoPorSubcategoria(subcategoriaProduto);

                if (produto.length > 0) {
                    json.result = produto;
                } else {
                    json.error = 'Produto não encontrado';
                }
            } catch (error) {
                json.error = 'Erro ao encontrar produto.' + error.message;
            }
        }
        res.json(json);
    },

    listarProdutoPorNome: async (req, res) => {
        let json = { error: '', result: [] };

        let nomeProduto = req.params.nome_produto;

        if (nomeProduto) {
            try {
                let produto = await ProdutoService.listarProdutoPorNome(nomeProduto);

                if (produto.length > 0) {
                    json.result = produto[0];
                } else {
                    json.error = 'Erro ao buscar produto por nome.';
                }
            } catch (error) {
                json.error = 'Erro ao buscar produto por nome.', error.message;
            }
        }
        res.json(json);
    },

    editarProduto: async (req, res) => {
        let json = { error: '', result: {} };

        let id_produto = req.params.id_produto;
        let { categoria_produto, preco_promocional_produto, parcela_produto, subcategoria_produto } = req.body;

        if (id_produto) {
            let campoValores = {};

            if (categoria_produto) campoValores.categoria_produto = categoria_produto;
            if (preco_promocional_produto !== undefined) campoValores.preco_promocional_produto = preco_promocional_produto;  // Aceitar null ou valores vazios
            if (parcela_produto) campoValores.parcela_produto = parcela_produto;
            if (subcategoria_produto !== undefined) campoValores.subcategoria_produto = subcategoria_produto;  // Aceitar null ou valores vazios

            if (Object.keys(campoValores).length > 0) {
                try {
                    const result = await ProdutoService.editarProduto(id_produto, campoValores);
                    if (result.affectedRows > 0) {
                        json.result = 'Produto atualizado.';
                    } else {
                        json.error = 'Produto não encontrado ou não foi alterado.';
                    }
                } catch (error) {
                    json.error = 'Erro ao atualizar o produto.';
                    console.error(error);
                }
            } else {
                json.error = 'Nenhum campo atualizado.';
            }
        } else {
            json.error = 'Produto não existe.';
        }

        res.json(json);
    },


    excluirProduto: async (req, res) => {
        let json = { error: '', result: {} };

        let id_produto = req.params.id_produto;

        if (id_produto) {
            try {
                const produto = await ProdutoService.verificarProdutoPorId(id_produto);

                if (produto && produto.length > 0) {
                    const produtoData = produto[0];

                    if (produtoData.img_produto) {
                        const imagePath = path.join(__dirname, '../..', 'uploads', produtoData.img_produto);
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
                    } else {
                        json.error = 'Produto não possui imagem associada.';
                    }

                    const excluido = await ProdutoService.excluirProduto(id_produto);

                    if (excluido) {
                        json.result = 'Produto excluído.';
                    } else {
                        json.error = 'Erro ao excluir produto no banco de dados.';
                    }
                } else {
                    json.error = 'Produto não encontrado.';
                }
            } catch (error) {
                console.error('Erro no controller:', error);
                json.error = 'Erro ao excluir produto';
            }
        } else {
            json.error = 'ID do produto não fornecido';
        }
        res.json(json);
    },


    cadastrarProdutoListaAmei: async (req, res) => {
        const { id_user, id_produto } = req.body;

        try {
            const [existingProduct] = await db.query(
                `SELECT * FROM lista_amei WHERE id_user = ? AND id_produto = ?`,
                [id_user, id_produto]
            );

            if (existingProduct.length > 0) {
                return res.status(400).json({ error: 'Este produto já está na lista "Amei".' });
            }

            // Adiciona o produto à lista "Amei"
            await db.query(
                `INSERT INTO lista_amei (id_user, id_produto) VALUES (?, ?)`,
                [id_user, id_produto]
            );

            res.status(200).json({ message: 'Produto adicionado à lista "Amei".' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    buscarListaAmei: async (req, res) => {
        const { id_user } = req.params;

        try {
            if (!id_user) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            const list = await ProdutoService.buscarListaAmei(id_user);
            res.status(200).json(list);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    removerListaAmei: async (req, res) => {
        const { id_user, id_produto } = req.params;

        try {
            const produtoRemovido = await ProdutoService.removerProdutoListaAmei(id_user, id_produto);

            if (!produtoRemovido) {
                return res.status(404).json({ error: 'Produto não encontrado na lista "Amei".' });
            }

            res.status(200).json({ message: 'Produto removido da lista "Amei".' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    cadastrarProdutoCarrinho: async (req, res) => {
        const { id_user, id_produto, qtd_produto_carrinho } = req.body;

        try {
            const [existingProduct] = await db.query(
                `SELECT * FROM carrinho WHERE id_user = ? AND id_produto = ?`,
                [id_user, id_produto]
            );

            if (existingProduct.length > 0) {
                return res.status(400).json({ error: 'Este produto já está no seu carrinho.' });
            }

            // Adiciona o produto à lista "Amei"
            await db.query(
                `INSERT INTO carrinho (id_user, id_produto, qtd_produto_carrinho) VALUES (?, ?, ?)`,
                [id_user, id_produto, qtd_produto_carrinho]
            );

            res.status(200).json({ message: 'Produto adicionado ao carrinho.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    buscarCarrinho: async (req, res) => {
        const { id_user } = req.params;

        try {
            if (!id_user) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            const list = await ProdutoService.buscarCarrinho(id_user);
            res.status(200).json(list);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    atualizarQuantidadeProdutoCarrinho: async (req, res) => {
        const { id_carrinho } = req.params
        const { qtd_produto_carrinho } = req.body;

        try {
            // Chama o serviço de atualização de quantidade
            const result = await ProdutoService.atualizarQuantidadeProdutoCarrinho(id_carrinho, qtd_produto_carrinho);

            return res.status(200).json(result);  // Retorna sucesso
        } catch (error) {
            console.error("Erro ao atualizar carrinho:", error);
            return res.status(500).json({ error: error.message });  // Erro no servidor
        }
    },

    atualizarValorTotalCarrinho: async (req, res) => {
        const { id_user } = req.params;
        const { frete, desconto } = req.body;  // Certifique-se de que o valor de frete está sendo enviado

        try {
            // Chama o serviço de atualização com o valor do frete
            const result = await ProdutoService.calcularEAtualizarSubtotal(id_user, frete, desconto);

            return res.status(200).json(result);  // Retorna sucesso
        } catch (error) {
            console.error("Erro ao atualizar valor total do carrinho:", error);
            return res.status(500).json({ error: error.message });  // Erro no servidor
        }
    },

    removerCarrinho: async (req, res) => {
        const { id_user, id_produto } = req.params;

        try {
            const produtoRemovido = await ProdutoService.removerProdutoCarrinho(id_user, id_produto);

            if (!produtoRemovido) {
                return res.status(404).json({ error: 'Produto não encontrado no carrinho.' });
            }

            res.status(200).json({ message: 'Produto removido do carrinho.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    esvaziarCarrinho: async (req, res) => {
        const { id_user } = req.params;

        try {
            const carrinhoEsvaziado = await ProdutoService.removerTodosProdutosCarrinho(id_user);

            if (!carrinhoEsvaziado) {
                return res.status(404).json({ error: 'Carrinho já está vazio ou usuário não encontrado.' });
            }

            res.status(200).json({ message: 'Carrinho esvaziado com sucesso.' });
        } catch (error) {
            console.error("Erro ao esvaziar o carrinho:", error);
            res.status(500).json({ error: "Erro interno ao esvaziar o carrinho." });
        }
    },


    buscarProdutoPorNome: async (req, res) => {
        let json = { error: '', result: [] };

        const { nome_produto } = req.params;

        try {
            const produtos = await ProdutoService.buscarProdutoPorNome(nome_produto);

            if (produtos && produtos.length > 0) {
                json.result = produtos;
            } else {
                json.error = 'Nenhum produto encontrado com o nome fornecido.';
            }
        } catch (error) {
            json.error = 'Erro ao buscar produtos por nome: ' + error.message;
        }

        res.json(json);
    },

    buscarProdutoPorCategoria: async (req, res) => {
        let json = { error: '', result: [] };

        const { categoria_produto } = req.params;

        try {
            const produtos = await ProdutoService.buscarProdutoPorCategoria(categoria_produto);

            if (produtos && produtos.length > 0) {
                json.result = produtos;
            } else {
                json.error = 'Nenhum produto encontrado para a categoria fornecida.';
            }
        } catch (error) {
            json.error = 'Erro ao buscar produtos por categoria: ' + error.message;
        }

        res.json(json);
    },

    verificarProdutosPorIdPedido: async (req, res) => {
        let json = { error: '', result: [] };

        let idPedido = req.params.id_pedido;

        if (idPedido) {
            try {
                // Busca todos os produtos associados ao id_pedido
                let produtos = await ProdutoService.verificarProdutosPorIdPedido(idPedido);

                if (produtos && produtos.length > 0) {
                    json.result = produtos;
                    return res.status(200).json(json); // Retorno com status 200
                } else {
                    json.error = 'Nenhum produto encontrado para este pedido.';
                    return res.status(404).json(json); // Retorno com status 404 se não encontrar produtos
                }
            } catch (error) {
                json.error = 'Erro ao buscar produtos: ' + error.message;
                console.error('Erro ao buscar produtos:', error); // Log de erro para diagnóstico
                return res.status(500).json(json); // Retorno com status 500 para erro no servidor
            }
        } else {
            json.error = 'ID do pedido não fornecido.';
            return res.status(400).json(json); // Retorno com status 400 se o ID do pedido não for fornecido
        }
    },
}
