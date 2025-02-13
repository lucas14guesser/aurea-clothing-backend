require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const pool = require('./db');
const cron = require('node-cron');

const axios = require('axios');
const PedidoService = require('./services/PedidoService');
const ProdutoService = require('./services/ProdutoService');
const ReservaService = require('./services/ReservaService');
const ReservaController = require('./controllers/ReservaController');

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'https://aurea-clothing-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/bannerUpload', express.static(path.join(__dirname, '..', 'bannerUpload')));

app.use('/aurea', routes);

cron.schedule("0 3 * * *", async () => {
    await ReservaController.removerReservasExpiradas({ json: () => { } }, {});
});

// Instanciando o cliente do Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.post("/aurea/create_preference", async (req, res) => {
    try {
        const { items, payer, metadata } = req.body;

        // Verificar se produtosCarrinho é um array
        if (!Array.isArray(metadata.produtosCarrinho)) {
            console.error('produtosCarrinho não é um array válido:', metadata.produtosCarrinho);
            return res.status(400).json({ error: "produtosCarrinho não é um array válido." });
        }

        // Criação da preferência no Mercado Pago
        const preference = new Preference(client);

        const body = {
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                currency_id: "BRL",
                unit_price: item.unit_price,
            })),
            payer: {
                email: payer.email,
            },
            back_urls: {
                success: "http://localhost:3001/aurea/pay-success",
                failure: "https://aurea-clothing-frontend.vercel.app/pay-fail",
                pending: "https://aurea-clothing-frontend.vercel.app/pay-load",
            },
            auto_return: "approved",
            payment_methods: {
                excluded_payment_types: [],
                installments: 12,
            },
            metadata: {
                id_user: metadata.id_user,
                produtosCarrinho: metadata.produtosCarrinho,
                endereco: metadata.endereco,
                num_endereco: metadata.num_endereco,
                opcao_frete: metadata.opcao_frete
            }
        };

        // Criar a preferência no Mercado Pago
        const response = await preference.create({ body });

        // Processo de reserva de produtos
        const produtoReservas = [];

        for (const item of metadata.produtosCarrinho) {
            const qtdProdutoReserva = item.qtd_produto;

            // Verifique a quantidade
            if (qtdProdutoReserva <= 0 || item.qtd_produto_carrinho <= 0) {
                console.error("Quantidade inválida", item);
                return res.status(400).json({ error: "Quantidade inválida", item });
            }

            // Atualiza o estoque
            await pool.query(`
                UPDATE produtos
                SET qtd_produto = qtd_produto - ?
                WHERE id_produto = ?
            `, [qtdProdutoReserva, item.id_produto]);

            // Registra a reserva no banco de dados
            const reservaData = {
                id_user: metadata.id_user,
                id_produto: item.id_produto,
                qtd_reserva: qtdProdutoReserva,
                data_reserva: new Date(),
                validade_reserva: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000) // Expira em 3 dias
            };

            produtoReservas.push(reservaData);
        }

        // Insere as reservas no banco de dados
        await Promise.all(produtoReservas.map(async (reserva) => {
            await pool.query(`
                INSERT INTO reservas (id_user, id_produto, qtd_reserva, data_reserva, validade_reserva)
                VALUES (?, ?, ?, ?, ?)
            `, [reserva.id_user, reserva.id_produto, reserva.qtd_reserva, reserva.data_reserva, reserva.validade_reserva]);
        }));

        res.json({ id: response.id });
    } catch (error) {
        console.error("Erro ao criar preferência:", error);
        res.status(500).json({ error: "Erro ao criar preferência" });
    }
});


app.get("/aurea/pay-success", async (req, res) => {
    try {
        const { payment_id } = req.query;

        if (!payment_id) {
            return res.status(400).json({ error: "ID de pagamento não encontrado." });
        }

        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            },
        });

        const payment = response.data;

        if (payment.status === "approved") {
            const { metadata } = payment;

            const { id_user, produtos_carrinho, endereco, num_endereco, opcao_frete } = metadata;

            // Verifica se produtos_carrinho é um array válido
            if (!Array.isArray(produtos_carrinho)) {
                console.error("produtos_carrinho não é um array válido:", produtos_carrinho);
                return res.status(400).json({ error: "produtos_carrinho não é um array válido." });
            }

            // Registra o pedido no banco de dados
            const resultado = await PedidoService.fazerPedido(
                produtos_carrinho, // Passa todos os itens do carrinho
                id_user,
                new Date(), // Data do pedido
                "aprovado", // Status do pagamento
                "em andamento", // Status do pedido
                endereco,
                num_endereco,
                opcao_frete
            );

            if (!resultado || !resultado.id_pedido) {
                console.error("Erro ao registrar o pedido.");
                return res.status(500).json({ error: "Erro ao registrar o pedido." });
            }

            // Verifica cada produto no carrinho
            for (const item of produtos_carrinho) {
                const { id_produto, qtd_produto } = item;

                // Busca o produto no estoque
                const produto = await ProdutoService.buscarProdutoPorId(id_produto);

                if (!produto) {
                    console.error(`Erro: Produto com ID ${id_produto} não encontrado.`);
                    return res.status(400).json({ error: `Produto com ID ${id_produto} não encontrado.` });
                }

                // Verifica se o usuário tem reserva suficiente
                const reserva = await ReservaService.buscarReservaPorUsuario(id_user, id_produto);

                if (!reserva) {
                    console.error(`Erro: Nenhuma reserva encontrada para o produto ID ${id_produto} do usuário ID ${id_user}.`);
                    return res.status(400).json({ error: `Nenhuma reserva encontrada para o produto ID ${id_produto}.` });
                }

                // Verifica se o usuário tem a quantidade reservada suficiente
                if (reserva.qtd_reserva >= qtd_produto) {

                    // Atualiza a reserva do usuário, subtraindo a quantidade comprada
                    const novaReserva = reserva.qtd_reserva - qtd_produto;
                    await ReservaService.atualizarReserva(id_user, id_produto, novaReserva);

                    if (novaReserva <= 0) {
                        await ReservaService.excluirReserva(id_user, id_produto);
                    }

                } else {
                    console.error(`Erro: Estoque insuficiente ou reserva insuficiente para o produto ID ${id_produto}.`);
                    return res.status(400).json({ error: `Estoque insuficiente ou reserva insuficiente para o produto ID ${id_produto}.` });
                }
            }

            // Limpa o carrinho do usuário após a compra
            try {
                await axios.delete(`http://localhost:3001/aurea/carrinho/${id_user}`);
            } catch (error) {
                console.error(`Erro ao limpar o carrinho do usuário ID ${id_user}:`, error);
                // Caso queira retornar uma resposta de erro
                return res.status(500).json({ error: "Erro ao limpar o carrinho." });
            }

            // Redireciona o usuário para a página de sucesso
            res.redirect("https://aurea-clothing-frontend.vercel.app/order-success");
        } else {
            // Se o pagamento não for aprovado, redireciona para a página de falha
            res.redirect("https://aurea-clothing-frontend.vercel.app/pay-fail");
        }
    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        res.status(500).json({ error: "Erro ao processar pagamento" });
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${process.env.PORT}`);
});
