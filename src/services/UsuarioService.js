const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailerConfig = require('../config/nodemailerConfig');
const crypto = require('crypto');

const saltRounds = 10;

module.exports = {
    cadastrarUsuario: async (nome_user, sobrenome_user, telefone_user, email_user, senha_user) => {
        try {
            const [existingUser] = await db.query('SELECT * FROM usuarios WHERE email_user = ?', [email_user]);
            if (existingUser.length > 0) {
                console.log('Usuário já cadastrado');
                return;
            }

            if (!senha_user) {
                console.log('A senha não pode estar vazia');
                return;
            }

            const hashedPassword = await bcrypt.hash(senha_user, saltRounds);

            const tokenConfirmacao = crypto.randomBytes(32).toString('hex');

            const funcaoUser = 'user';

            const [results] = await db.query(
                'INSERT INTO usuarios (nome_user, sobrenome_user, telefone_user, email_user, senha_user, token_confirmacao_cadastro, email_confirmado, funcao_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nome_user, sobrenome_user, telefone_user, email_user, hashedPassword, tokenConfirmacao, 0, funcaoUser]
            );

            process.nextTick(async () => {
                try {
                    await nodemailerConfig.cadastrarMail(email_user, nome_user, tokenConfirmacao);
                } catch (error) {
                    console.error('Erro ao enviar Email de confirmação de cadastro', error);
                }
            });

            return results.insertId;
        } catch (error) {
            throw error;
        }
    },

    loginUsuario: async (email_user, senha_user) => {
        try {
            if (!email_user || !senha_user) {
                throw new Error('Parâmetros de login inválidos');
            }

            const query = 'SELECT * FROM usuarios WHERE email_user = ?';
            const [rows] = await db.execute(query, [email_user]);

            if (rows.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            const user = rows[0];

            const senhaCorreta = await bcrypt.compare(senha_user, user.senha_user);

            if (!senhaCorreta) {
                throw new Error('Senha incorreta');
            }

            const payLoad = {
                email_user: user.email_user,
            }

            const token = jwt.sign(payLoad, process.env.SECRET_KEY, { expiresIn: '7d' });

            return {
                success: true,
                message: 'Login bem-sucedido',
                token,
                user: {
                    email_user: user.email_user,
                },
            };
        } catch (error) {
            console.error('Erro na autenticação', error);
            throw error;
        }
    },

    verificarTodosUsuarios: async () => {
        try {
            const [results] = await db.query('SELECT * FROM usuarios');
            return results;
        } catch (error) {
            throw error;
        }
    },
    verificarUsuarioPorId: async (id_user) => {
        try {
            const [results] = await db.query('SELECT * FROM usuarios WHERE id_user = ?', [id_user]);
            if (results.length > 0) {
                return results[0];
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    },
    verificarUsuarioPorMail: async (email_user) => {
        try {
            const [results] = await db.query('SELECT * FROM usuarios WHERE email_user = ?', [email_user]);
            if (results.length > 0) {
                return results;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    },
    editarUsuario: async (id_user, camposValores) => {
        try {
            const campos = Object.keys(camposValores);
            const valores = Object.keys(camposValores);

            const camposFiltrados = campos.filter(campo => valores[campos.indexOf(campo)] !== undefined && valores[campos.indexOf(campo)] !== null);
            const valoresFiltrados = camposFiltrados.map(campo => camposValores[campo]);

            const sets = camposFiltrados.map(campo => `${campo} = ?`).join(', ');

            const [results] = await db.query(`UPDATE usuarios SET ${sets} WHERE id_user = ?`, [...valoresFiltrados, id_user]);
            return results;
        } catch (error) {
            throw error;
        }
    },
    excluirUsuario: async (id_user) => {
        try {
            const [results] = await db.query('DELETE FROM usuarios WHERE id_user = ?', [id_user]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    solicitarRedefinicaoEmail: async (id_user, email_user) => {
        try {
            const tokenRedefinicaoMail = crypto.randomBytes(32).toString('hex');
            const tokenExpiracaoRedefinicaoEmail = new Date(Date.now() + 60 * 60 * 1000);

            const [results] = await db.query(
                'UPDATE usuarios SET token_redefinicao_email = ?, token_redefinicao_email_expiracao = ? WHERE id_user = ?',
                [tokenRedefinicaoMail, tokenExpiracaoRedefinicaoEmail, id_user]
            );

            if (results.affectedRows > 0) {
                return { tokenRedefinicaoMail, tokenExpiracaoRedefinicaoEmail, email_user };
            } else {
                throw new Error('Usuário não encontrado ou erro ao atualizar dados.');
            }
        } catch (error) {
            throw error;
        }
    },

    redefinirMail: async (id_user, email_user, nome_user) => {
        try {
            // Certifique-se de que id_user é um número
            if (isNaN(id_user)) {
                throw new Error('ID de usuário inválido.');
            }

            const [results] = await db.query(
                'UPDATE usuarios SET email_user = ? WHERE id_user = ?',
                [email_user, id_user] // Verifique os tipos de dados aqui
            );

            process.nextTick(async () => {
                try {
                    await nodemailerConfig.emailRedefinido(email_user, nome_user);
                } catch (error) {
                    console.error('Erro ao enviar email de redefinição de e-mail', error);
                }
            });

            return results;
        } catch (error) {
            throw error;
        }
    },

    esqueciMinhaSenha: async (email_user) => {
        const [existingEmail] = ('SELECT * FROM usuarios WHERE email_user = ?', [email_user]);
        if (existingEmail) {
            try {
                // Gera o token de redefinição de senha
                const tokenRedefinicaoSenha = crypto.randomBytes(32).toString('hex');
                const tokenExpiracaoRedefinicaoSenha = new Date(Date.now() + 60 * 60 * 1000); // Token expira em 1 hora

                // Atualiza o banco de dados com o token e sua data de expiração
                const [results] = await db.query(
                    'UPDATE usuarios SET token_redefinicao_senha = ?, token_redefinicao_senha_expiracao = ? WHERE email_user = ?',
                    [tokenRedefinicaoSenha, tokenExpiracaoRedefinicaoSenha, email_user]
                );

                // Se a atualização for bem-sucedida, retorna os dados
                if (results.affectedRows > 0) {
                    return { tokenRedefinicaoSenha, tokenExpiracaoRedefinicaoSenha, email_user };
                } else {
                    throw new Error('Usuário não encontrado ou erro ao atualizar dados.');
                }
            } catch (error) {
                throw new Error('Usuário não encontrado ou erro ao atualizar dados.');
            }
        } else {
            throw new Error('Usuário não encontrado com este e-mail.');
        }
    },

    solicitarRedefinicaoSenha: async (id_user, email_user) => {
        try {
            // Gera o token de redefinição de senha
            const tokenRedefinicaoSenha = crypto.randomBytes(32).toString('hex');
            const tokenExpiracaoRedefinicaoSenha = new Date(Date.now() + 60 * 60 * 1000); // Token expira em 1 hora

            // Atualiza o banco de dados com o token e sua data de expiração
            const [results] = await db.query(
                'UPDATE usuarios SET token_redefinicao_senha = ?, token_redefinicao_senha_expiracao = ? WHERE id_user = ?',
                [tokenRedefinicaoSenha, tokenExpiracaoRedefinicaoSenha, id_user]
            );

            // Se a atualização for bem-sucedida, retorna os dados
            if (results.affectedRows > 0) {
                return { tokenRedefinicaoSenha, tokenExpiracaoRedefinicaoSenha, email_user };
            } else {
                throw new Error('Usuário não encontrado ou erro ao atualizar dados.');
            }
        } catch (error) {
            throw error;
        }
    },

    redefinirSenha: async (id_user, senha_user, email_user, nome_user) => {
        try {
            // Certifique-se de que id_user é um número
            if (isNaN(id_user)) {
                throw new Error('ID de usuário inválido.');
            }

            // Aqui, você deve aplicar um hash à senha antes de armazená-la no banco de dados
            const hashedSenha = await bcrypt.hash(senha_user, 10); // Usando bcrypt para fazer o hash da senha

            const [results] = await db.query(
                'UPDATE usuarios SET senha_user = ? WHERE id_user = ?',
                [hashedSenha, id_user] // Atualiza a senha no banco de dados
            );

            process.nextTick(async () => {
                try {
                    await nodemailerConfig.senhaRedefinida(email_user, nome_user);
                } catch (error) {
                    console.error('Erro ao enviar email de redefinição de senha', error);
                }
            });

            return results;
        } catch (error) {
            throw error;
        }
    },
}