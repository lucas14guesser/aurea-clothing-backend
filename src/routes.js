const express = require('express');
const router = express.Router();
const upload = require('./config/multerConfig');
const bannerUpload = require('./config/bannerMulterConfig');

const db = require('./db');

const UsuarioController = require('./controllers/UsuarioController');
const ProdutoController = require('./controllers/ProdutoController');
const { validarContaUsuario } = require('./config/tokenConfig');
const autenticarToken = require('./config/jwtConfig');
const PedidoController = require('./controllers/PedidoController');
const nodemailerConfig = require('./config/nodemailerConfig');
const BannerController = require('./controllers/BannerController');
const MelhorEnvioController = require('./controllers/MelhorEnvioController');
const ReservaController = require('./controllers/ReservaController');

router.get('/usuarios', UsuarioController.verificarTodosUsuarios);
router.get('/usuario/:id_user', UsuarioController.verificarUsuarioPorId);
router.get('/usuario/mail/:email_user', UsuarioController.verificarUsuarioPorEmail);
router.put('/usuario/:id_user', UsuarioController.editarUsuario);
router.delete('/usuario/:id_user', UsuarioController.excluirUsuario);
router.post('/usuario/:id_user/solicitar-redefinicao-mail', UsuarioController.solicitarRedefinicaoEmail);
router.post('/usuario/:id_user/solicitar-redefinicao-senha', UsuarioController.solicitarRedefinicaoSenha);
router.put('/usuario/mail/redefinir-mail', UsuarioController.redefinirEmail);
router.put('/usuario/senha/redefinir-senha', UsuarioController.redefinirSenha);
router.post('/usuario/senha/esqueci-senha', UsuarioController.esqueciMinhaSenha);


router.post('/produto', upload.single('img_produto'), ProdutoController.cadastrarProduto);
router.get('/produtos', ProdutoController.verificarTodosProdutos);
router.get('/produto/:id_produto', ProdutoController.verificarProdutoPorId);
router.get('/produto/categoria/:categoria_produto', ProdutoController.listarProdutoPorCategoria);
router.get('/produto/subcategoria/:subcategoria_produto', ProdutoController.listarProdutoPorSubcategoria);
router.get('/produto/nome/:nome_produto', ProdutoController.listarProdutoPorNome);
router.put('/produto/:id_produto', ProdutoController.editarProduto);
router.delete('/produto/:id_produto', ProdutoController.excluirProduto);
router.get('/produto/pedido/:id_pedido', ProdutoController.verificarProdutosPorIdPedido);

router.post('/pedido', PedidoController.fazerPedido);
router.get('/pedidos', PedidoController.listarTodosPedidos);
router.get('/pedido/:id_pedido', PedidoController.listarPedidoPorId);
router.put('/pedido/:id_pedido', PedidoController.AlterarStatusPedido);
router.put('/pedido/cd-rastreio/:id_pedido', PedidoController.adicionarCdRastreio);
router.get('/pedido/user/:id_user', PedidoController.listarPedidoPorIdUser);
router.post('/pedido/avaliar', PedidoController.avaliarPedido);
router.get('/pedido/avaliacao-produto/:id_produto', PedidoController.listarAvaliacaoPorIdProduto);
router.get('/itens-pedido', PedidoController.listarTodosItensPedidos);
router.get('/itens-pedido/:id_pedido', PedidoController.listarItensPedidoPorIdPedido);

router.post('/banner', bannerUpload.single('img_banner'), BannerController.inserirBanner);
router.get('/banners', BannerController.listarTodosBanners);
router.get('/banner/:id_banner', BannerController.listarBannerPorId);
router.delete('/banner/:id_banner', BannerController.excluirBanner);

router.get('/confirmar-email', validarContaUsuario);

router.post('/usuario', UsuarioController.cadastrarUsuario);
router.post('/login', UsuarioController.loginUsuario);

router.post('/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.status(200).json({ message: 'Logout realizado com sucesso!' });
});

router.post('/duvida', nodemailerConfig.enviarMailDuvida);
router.post('/solicitacao-troca', nodemailerConfig.enviarMailSolicitarTroca);
router.post('/solicitacao-devolucao', nodemailerConfig.enviarMailSolicitarDevolucao);
router.post('/aviso/:nome_produto', nodemailerConfig.enviarMailAviseQuandoChegar);

router.post('/lista-amei', ProdutoController.cadastrarProdutoListaAmei);
router.get('/lista-amei/:id_user', ProdutoController.buscarListaAmei);
router.delete('/lista-amei/:id_user/:id_produto', ProdutoController.removerListaAmei);

router.post('/carrinho', ProdutoController.cadastrarProdutoCarrinho);
router.get('/carrinho/:id_user', ProdutoController.buscarCarrinho);
router.put('/carrinho/put/:id_carrinho', ProdutoController.atualizarQuantidadeProdutoCarrinho);
router.put('/carrinho/valor-total/:id_user', ProdutoController.atualizarValorTotalCarrinho);
router.delete('/carrinho/:id_user/:id_produto', ProdutoController.removerCarrinho);
router.delete('/carrinho/:id_user', ProdutoController.esvaziarCarrinho);

router.get('/auth/check', autenticarToken, (req, res) => {
    res.json({ authenticated: true, email: req.user.email });
});


router.get('/busca/nome/:nome_produto', ProdutoController.buscarProdutoPorNome);
router.get('/busca/categoria/:categoria_produto', ProdutoController.buscarProdutoPorCategoria);

// Rota para calcular o frete
router.post('/calcular-frete', MelhorEnvioController.calcularFrete);
// Rota para obter o endereço a partir do CEP
router.get('/obter-endereco/:cep', MelhorEnvioController.obterEnderecoPorCep);

router.post('/gerar-cupom', PedidoController.gerarCupomDesconto);
router.get('/listar-todos-cupom', PedidoController.listarTodosCupom);
router.get('/listar-cupom/:nome_cupom', PedidoController.listarCupomPorNome);
router.delete('/deletar-cupom/:nome_cupom', PedidoController.deletarCupomPorNome);

router.delete('/reservas-expiradas', ReservaController.removerReservasExpiradas);

module.exports = router;