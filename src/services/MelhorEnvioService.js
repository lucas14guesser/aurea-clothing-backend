// Importa o módulo axios para realizar requisições HTTP
const axios = require('axios');

// Variáveis de configuração que vêm das variáveis de ambiente
const MELHORENVIO_BASE_URL = process.env.MELHORENVIO_BASE_URL;  // URL base da API do Melhor Envio
const MELHORENVIO_API_KEY = process.env.MELHORENVIO_API_KEY;    // Chave de autenticação da API do Melhor Envio
const USER_AGENT = process.env.USER_AGENT; // User-Agent personalizado para as requisições HTTP

// Função para calcular o frete
const calcularFrete = async ({ from, to, products }) => {
  try {
    // Realiza uma requisição POST para a API do Melhor Envio para calcular o frete
    const response = await axios.post(
      `${MELHORENVIO_BASE_URL}/me/shipment/calculate`, // Endpoint da API para calcular o frete
      {
        from,    // CEP de origem
        to,      // CEP de destino
        products, // Array com os produtos (peso, dimensões, etc.)
      },
      {
        headers: {  // Cabeçalhos da requisição
          Accept: 'application/json',    // Define o formato da resposta esperada
          'Content-Type': 'application/json', // Define o tipo de conteúdo enviado (JSON)
          Authorization: `Bearer ${MELHORENVIO_API_KEY}`, // Inclui a chave de autenticação no cabeçalho
          'User-Agent': `${USER_AGENT}`  // Identificação do cliente nas requisições
        },
      }
    );
    
    // Retorna os dados da resposta da API do Melhor Envio (preço do frete, prazos, etc.)
    return response.data;
  } catch (error) {
    // Caso ocorra um erro, exibe o erro no console
    console.error('Erro ao calcular frete:', error.response?.data || error.message);

    // Lança uma exceção com uma mensagem de erro customizada
    throw new Error('Erro ao calcular frete no Melhor Envio.');
  }
};

// Função para obter o endereço completo a partir de um CEP
const obterEnderecoPorCep = async (cep) => {
  try {
    // Faz uma requisição GET para a API ViaCEP, que fornece informações de endereço pelo CEP
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    
    // Retorna os dados do endereço obtido (logradouro, bairro, cidade, estado, etc.)
    return response.data;
  } catch (error) {
    // Caso ocorra um erro, exibe o erro no console
    console.error('Erro ao obter endereço:', error);

    // Lança uma exceção com uma mensagem de erro customizada
    throw new Error('Erro ao obter endereço');
  }
};

// Exporta as funções para que possam ser usadas em outros módulos (como controladores de rota)
module.exports = { calcularFrete, obterEnderecoPorCep };
