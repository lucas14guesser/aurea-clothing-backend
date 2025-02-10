// Importa o serviço responsável pela lógica de comunicação com o Melhor Envio
const MelhorEnvioService = require('../services/MelhorEnvioService');

// Função para calcular o frete
const calcularFrete = async (req, res) => {
  try {
    // Extrai os dados do corpo da requisição (CEP de origem e destino, e produtos)
    const { from, to, products } = req.body;

    // Chama o serviço para calcular o frete usando os dados recebidos
    const freteCalculado = await MelhorEnvioService.calcularFrete({
      from, // Objeto com o CEP de origem
      to,   // Objeto com o CEP de destino
      products, // Array com informações dos produtos
    });

    // Retorna o resultado do cálculo do frete com status 200 (sucesso)
    return res.status(200).json(freteCalculado);
  } catch (error) {
    // Em caso de erro, exibe o erro no console para debug
    console.error('Erro no Controller:', error.message);

    // Retorna uma mensagem de erro para o cliente com status 500 (erro interno do servidor)
    return res.status(500).json({ message: 'Erro ao calcular frete' });
  }
};

// Função para obter o endereço completo a partir do CEP
const obterEnderecoPorCep = async (req, res) => {
  try {
    // Extrai o CEP da URL (parâmetro dinâmico)
    const { cep } = req.params;

    // Chama o serviço para obter o endereço correspondente ao CEP
    const endereco = await MelhorEnvioService.obterEnderecoPorCep(cep);

    // Retorna o endereço obtido no formato JSON
    return res.json(endereco);
  } catch (error) {
    // Em caso de erro, exibe o erro no console para debug
    console.error('Erro no Controller:', error);

    // Retorna uma mensagem de erro para o cliente com status 500 (erro interno do servidor)
    return res.status(500).json({ message: 'Erro ao obter endereço.' });
  }
};

// Exporta as funções para que possam ser usadas nas rotas
module.exports = { calcularFrete, obterEnderecoPorCep };
