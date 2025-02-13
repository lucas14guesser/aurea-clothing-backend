const db = require('../db');

const validarContaUsuario = async (req, res) => {
    const { token_confirmacao_cadastro } = req.query;

    if (!token_confirmacao_cadastro) {
        return res.status(400).json({ message: 'Token de confirmação de cadastro não fornecido.' });
    }

    try {
        const [result] = await db.query('SELECT * FROM usuarios WHERE token_confirmacao_cadastro = ?', [token_confirmacao_cadastro]);

        if (!result || result.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou usuário não encontrado.' });
        }

        await db.query('UPDATE usuarios SET email_confirmado = 1, token_confirmacao_cadastro = NULL WHERE token_confirmacao_cadastro = ?', [token_confirmacao_cadastro]);

        return res.redirect('https://aurea-clothing-frontend.vercel.app/login');

    } catch (error) {
        console.error('Erro ao confirmar a conta:', error);
        return res.status(500).json({ message: 'Erro ao confirmar a conta.', error });
    }
};

module.exports = { validarContaUsuario };