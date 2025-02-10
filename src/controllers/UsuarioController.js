const UsuarioService = require('../services/UsuarioService');
const db = require('../db');
const nodemailerConfig = require('../config/nodemailerConfig');

module.exports = {
    cadastrarUsuario: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_user, sobrenome_user, telefone_user, email_user, senha_user } = req.body;

        if (nome_user && sobrenome_user && telefone_user && email_user && senha_user) {
            try {
                let usuario = await UsuarioService.verificarUsuarioPorMail(email_user);

                if (usuario) {
                    json.error = 'Usuário já possui cadastro.';
                    return res.status(400).json(json);
                } else {
                    let idUser = await UsuarioService.cadastrarUsuario(nome_user, sobrenome_user, telefone_user, email_user, senha_user);

                    json.result = {
                        id_user: idUser,
                        nome_user,
                        sobrenome_user,
                        telefone_user,
                        email_user,
                        senha_user
                    };

                    return res.status(201).json(json);
                }
            } catch (error) {
                json.error = 'Erro ao cadastrar usuário: ';
                return res.status(500).json(json);
            }
        } else {
            json.error = 'Todos os campos são obrigatórios';
            return res.status(400).json(json);
        }
    },

    loginUsuario: async (req, res) => {
        try {
            const { email_user, senha_user } = req.body;
            const resultado = await UsuarioService.loginUsuario(email_user, senha_user);

            if (resultado.success) {
                const token = resultado.token;

                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });

                return res.status(200).json({
                    success: true,
                    user: resultado.user
                });
            } else {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
        } catch (error) {

            if (error.message === 'Usuário não encontrado' || error.message === 'Senha incorreta') {
                return res.status(400).json({ message: error.message })
            }
            return res.status(500).json({ message: error.message });
        }
    },

    verificarTodosUsuarios: async (req, res) => {
        let json = { error: '', result: [] };

        let usuarios = await UsuarioService.verificarTodosUsuarios();

        for (let i in usuarios) {
            json.result.push({
                id_user: usuarios[i].id_user,
                nome_user: usuarios[i].nome_user,
                sobrenome_user: usuarios[i].sobrenome_user,
                nasc_user: usuarios[i].nasc_user,
                telefone_user: usuarios[i].telefone_user,
                email_user: usuarios[i].email_user,
                cpf_user: usuarios[i].cpf_user,
            });
        }
        res.json(json);
    },
    verificarUsuarioPorId: async (req, res) => {
        let json = { error: '', result: [] };

        let id_user = req.params.id_user;

        try {
            let usuario = await UsuarioService.verificarUsuarioPorId(id_user);

            if (usuario) {
                json.result = usuario;
            } else {
                json.error = 'Usuário não encontrado.';
            }
        } catch (error) {
            json.error = 'Erro ao buscar usuário', error.message;
        }
        res.json(json);
    },

    verificarUsuarioPorEmail: async (req, res) => {
        let json = { error: '', result: [] };

        let email_user = req.params.email_user;

        try {
            let usuario = await UsuarioService.verificarUsuarioPorMail(email_user);

            if (usuario) {
                json.result = usuario;
            } else {
                json.error = 'Usuário não encontrado.';
            }
        } catch (error) {
            json.error = 'Erro ao buscar usuário' + error.message;
        }
        res.json(json);
    },

    editarUsuario: async (req, res) => {
        let json = { error: '', result: {} };

        let id_user = req.params.id_user;
        let { nome_user, sobrenome_user, nasc_user, telefone_user, cpf_user } = req.body;

        if (id_user) {
            let campoValores = {};

            if (nome_user) campoValores.nome_user = nome_user;
            if (sobrenome_user) campoValores.sobrenome_user = sobrenome_user;
            if (nasc_user) campoValores.nasc_user = nasc_user;
            if (telefone_user) campoValores.telefone_user = telefone_user;
            if (cpf_user) campoValores.cpf_user = cpf_user;

            if (Object.keys(campoValores).length > 0) {
                await UsuarioService.editarUsuario(id_user, campoValores)
                json.result = 'Usuário atualizado.'
            } else {
                json.error = 'Nenhum campo atualizado.'
            }
        } else {
            json.error = 'Usuário não existe.';
        }
        res.json(json);
    },
    excluirUsuario: async (req, res) => {
        let json = { error: '', result: {} };

        let id_user = req.params.id_user

        if (id_user) {
            try {
                await UsuarioService.excluirUsuario(id_user);
                json.result = 'Usuário excluído';
            } catch (error) {
                json.error = 'Erro ao excluir Usuário';
            }
        } else {
            json.error = 'Usuário não encontrado';
        }
        res.json(json);
    },

    solicitarRedefinicaoEmail: async (req, res) => {
        let json = { error: '', result: {} };

        try {
            const { id_user } = req.params;

            const [usuario] = await db.query(
                'SELECT email_user, nome_user FROM usuarios WHERE id_user = ?',
                [id_user]
            );
            if (!usuario || usuario.length === 0) {
                json.error = 'Usuário não encontrado.';
                return res.json(json);
            }

            const { email_user, nome_user } = usuario[0];

            const { tokenRedefinicaoMail } = await UsuarioService.solicitarRedefinicaoEmail(
                id_user,
                email_user
            );

            const linkRedefinicao = `http://localhost:5173/redefinir-mail?token=${tokenRedefinicaoMail}`;

            await nodemailerConfig.redefinicaoEmail(email_user, nome_user, linkRedefinicao);

            json.result = 'E-mail de redefinição enviado com sucesso.';
        } catch (error) {
            json.error = 'Erro ao solicitar redefinição de e-mail.';
            console.error(error);
        }

        res.json(json);
    },

    redefinirEmail: async (req, res) => {
        let json = { error: '', result: {} }; // Inicializa o objeto json
    
        const { token, email_user } = req.body;
    
        if (!token || !email_user) {
            json.error = 'Token e e-mail são obrigatórios.';
            return res.json(json); // Retorna o erro
        }
    
        try {
            const [rows] = await db.query(
                'SELECT id_user, nome_user FROM usuarios WHERE token_redefinicao_email = ? AND token_redefinicao_email_expiracao > NOW()',
                [token]
            );
    
            if (rows.length === 0) {
                json.error = 'Token inválido ou expirado.';
                return res.json(json); // Retorna o erro
            }
    
            const { id_user, nome_user } = rows[0];
    
            if (isNaN(id_user)) {
                json.error = 'ID de usuário inválido.';
                return res.json(json); // Retorna o erro
            }
    
            const [emailExists] = await db.query('SELECT id_user FROM usuarios WHERE email_user = ?', [email_user]);
    
            if (emailExists.length > 0) {
                json.error = 'Já existe um usuário com esse e-mail.';
                return res.json(json);
            }
    
            await UsuarioService.redefinirMail(id_user, email_user, nome_user);
    
            await db.query(
                'UPDATE usuarios SET token_redefinicao_email = NULL, token_redefinicao_email_expiracao = NULL WHERE id_user = ?',
                [id_user]
            );
    
            json.result = 'E-mail redefinido com sucesso.';
            return res.json(json);
        } catch (error) {
            console.error(error);
            json.error = 'Erro ao redefinir e-mail.';
            return res.json(json);
        }
    },

    esqueciMinhaSenha: async (req, res) => {
        let json = { error: '', result: {} };

        try {
            const { email_user } = req.body;
    
            // Verifica se o usuário existe no banco de dados
            const [usuario] = await db.query(
                'SELECT * FROM usuarios WHERE email_user = ?',
                [email_user]
            );
            if (!usuario || usuario.length === 0) {
                json.error = 'Usuário não encontrado.';
                return res.json(json); // Retorna erro se o usuário não existir
            }
    
    
            // Chama o serviço para gerar o token de redefinição de senha
            const { tokenRedefinicaoSenha } = await UsuarioService.esqueciMinhaSenha(
                email_user
            );
    
            // Cria o link de redefinição
            const linkRedefinicao = `http://localhost:5173/esqueci-minha-senha?token=${tokenRedefinicaoSenha}`;
    
            // Envia o e-mail para o usuário
            await nodemailerConfig.recuperarSenha(email_user, linkRedefinicao);
    
            // Retorna a resposta de sucesso
            json.result = 'E-mail de redefinição de senha enviado com sucesso.';
        } catch (error) {
            json.error = 'Erro ao solicitar redefinição de senha.';
            console.error(error);
        }
    
        res.json(json); // Retorna a resposta para o cliente
    },

    solicitarRedefinicaoSenha: async (req, res) => {
        let json = { error: '', result: {} };
    
        try {
            const { id_user } = req.params;
    
            // Verifica se o usuário existe no banco de dados
            const [usuario] = await db.query(
                'SELECT email_user, nome_user FROM usuarios WHERE id_user = ?',
                [id_user]
            );
            if (!usuario || usuario.length === 0) {
                json.error = 'Usuário não encontrado.';
                return res.json(json); // Retorna erro se o usuário não existir
            }
    
            const { email_user, nome_user } = usuario[0];
    
            // Chama o serviço para gerar o token de redefinição de senha
            const { tokenRedefinicaoSenha } = await UsuarioService.solicitarRedefinicaoSenha(
                id_user,
                email_user
            );
    
            // Cria o link de redefinição
            const linkRedefinicao = `http://localhost:5173/redefinir-senha?token=${tokenRedefinicaoSenha}`;
    
            // Envia o e-mail para o usuário
            await nodemailerConfig.redefinicaoSenha(email_user, nome_user, linkRedefinicao);
    
            // Retorna a resposta de sucesso
            json.result = 'E-mail de redefinição de senha enviado com sucesso.';
        } catch (error) {
            json.error = 'Erro ao solicitar redefinição de senha.';
            console.error(error);
        }
    
        res.json(json); // Retorna a resposta para o cliente
    },

    redefinirSenha: async (req, res) => {
        let json = { error: '', result: {} }; // Inicializa o objeto json
    
        const { token, senha_user } = req.body;
    
        if (!token || !senha_user) {
            json.error = 'Token e senha são obrigatórios.';
            return res.json(json); // Retorna o erro
        }
    
        try {
            const [rows] = await db.query(
                'SELECT id_user, nome_user, email_user FROM usuarios WHERE token_redefinicao_senha = ? AND token_redefinicao_senha_expiracao > NOW()',
                [token]
            );
    
            if (rows.length === 0) {
                json.error = 'Token inválido ou expirado.';
                return res.json(json); // Retorna o erro
            }
    
            const { id_user, nome_user, email_user } = rows[0];
    
            if (isNaN(id_user)) {
                json.error = 'ID de usuário inválido.';
                return res.json(json); // Retorna o erro
            }
    
            // Aqui você pode validar a senha (exemplo: verificar força da senha)
            // Lembre-se de fazer a validação de segurança para garantir a segurança da senha!
    
            await UsuarioService.redefinirSenha(id_user, senha_user, email_user, nome_user);
    
            // Limpa os tokens de redefinição após a conclusão
            await db.query(
                'UPDATE usuarios SET token_redefinicao_senha = NULL, token_redefinicao_senha_expiracao = NULL WHERE id_user = ?',
                [id_user]
            );
    
            json.result = 'Senha redefinida com sucesso.';
            return res.json(json);
        } catch (error) {
            console.error(error);
            json.error = 'Erro ao redefinir senha.';
            return res.json(json);
        }
    },
}
