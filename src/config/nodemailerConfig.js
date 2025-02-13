require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_GMAIL_USER,
        pass: process.env.SMTP_GMAIL_PASS,
    },
});


async function cadastrarMail(email_user, nome_user, tokenConfirmacao) {
    try {
        const linkConfirmacao = `https://test-aureaclothing-backend-466bc65ebfec.herokuapp.com/aurea/confirmar-email?token_confirmacao_cadastro=${tokenConfirmacao}`;

        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: `${email_user}`,
            subject: 'Confirmação de E-mail - Aurea Clothing',
            text: `Olá ${nome_user}, Obrigado por se cadastrar no Aurea Clothing! Confirme seu e-mail clicando este link: ${linkConfirmacao}`,
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                        <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Confirme seu e-mail</h1>
                        <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá ${nome_user},</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Obrigado por se cadastrar na Aurea Clothing!</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Confirme seu e-mail clicando neste botão:</p>
                        <p style="text-align: center;">
                            <a href="${linkConfirmacao}" 
                            style="display: inline-block; background-color: #A87826; color: #FFF; padding: 10px 20px; text-decoration: none; font-size: 1.2rem; border-radius: 5px;">
                            CONFIRMAR E-MAIL
                            </a>
                        </p>
                    </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function recuperarSenha(email_user, linkRedefinicao) {

    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: `${email_user}`,
            subject: 'Esqueceu sua senha.',
            text: 'Olá, Você fez um pedido de recuperação de senha, inicie o processo para recuperar sua senha clicando neste link: LINK. Caso não tenha feito o pedido, pode ignorar esta mensagem.',
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                        <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Recuperar senha</h1>
                        <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Você fez um pedido de recuperação de senha,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">inicie o processo para recuperar sua senha clicando neste link: <a href='${linkRedefinicao}'>LINK</a></p>
                        <p style="color: #A87826; font-size: .7rem; margin-left: 2rem; text-align: center;">Caso não tenha feito o pedido, pode ignorar esta mensagem.</p>
                    </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function pedidoRealizado() {
    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: 'lucas14sguesser@gmail.com',
            subject: 'Seu pedido foi realizado com sucesso.',
            text: 'Olá NOME, Seu pedido do produto NOME_PRODUTO foi realizado com sucesso, aguarde até o pagamento ser aprovado para conseguir rastrear o seu pedido.',
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                        <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Pedido realizado</h1>
                        <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá NOME,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Seu pedido do produto NOME_PRODUTO foi realizado com sucesso,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">aguarde até o pagamento ser aprovado para conseguir rastrear o seu pedido.</p>
                    </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function pedidoAprovado() {
    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: 'lucas14sguesser@gmail.com',
            subject: 'Seu pedido foi aprovado.',
            text: 'Olá NOME, Seu pedido do produto NOME_PRODUTO foi aprovado, para realizar o rastreio do seu pedido clique neste link: LINK',
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                        <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Pedido aprovado</h1>
                        <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá NOME,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Seu pedido do produto NOME_PRODUTO foi aprovado,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">para realizar o rastreio do seu pedido clique neste link: <a href='#'>LINK</a></p>
                    </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function redefinicaoEmail(email_user, nome_user, linkRedefinicao) {
    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: email_user,
            subject: 'Você solicitou uma redefinição de e-mail.',
            text: `Olá ${nome_user}, Sua solicitação para redefinir seu e-mail foi efetuada. Clique no link para redefinir: ${linkRedefinicao}`,
            html: `
                <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                    <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Redefinir e-mail</h1>
                    <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá ${nome_user},</p>
                    <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Para redefinir seu e-mail, clique no link abaixo:</p>
                    <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;"><a href='${linkRedefinicao}'>Redefinir E-mail</a></p>
                </body>
            `,
        });

        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function redefinicaoSenha(email_user, nome_user, linkRedefinicao) {
    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: email_user,
            subject: 'Você solicitou uma redefinição de senha.',
            text: `Olá ${nome_user}, Sua solicitação para redefinir sua senha foi efetuada. Clique no link para redefinir: ${linkRedefinicao}`,
            html: `
                <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                    <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Redefinir Senha</h1>
                    <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá ${nome_user},</p>
                    <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Para redefinir sua senha, clique no link abaixo:</p>
                    <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;"><a href='${linkRedefinicao}'>Redefinir Senha</a></p>
                </body>
            `,
        });

        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function emailRedefinido(email_user, nome_user) {
    const linkLogin = 'https://aurea-clothing-frontend.vercel.app/login';

    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: email_user,
            subject: 'Você redefiniu seu e-mail com sucesso.',
            text: `Olá ${nome_user}, Sua redefinição de e-mail foi efetuada com sucesso, para realizar o login com seu novo email clique neste link: LINK`,
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                        <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">E-mail redefinido</h1>
                        <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá ${nome_user},</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Sua redefinição de e-mail foi efetuada com sucesso,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">para realizar o login com seu novo email clique neste link: <a href='${linkLogin}'>LOGIN</a></p>
                    </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function senhaRedefinida(email_user, nome_user) {
    const linkLogin = 'https://aurea-clothing-frontend.vercel.app/login';

    try {
        const info = await transporter.sendMail({
            from: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            to: email_user,
            subject: 'Você redefiniu sua senha com sucesso.',
            text: `Olá ${nome_user}, Sua redefinição de senha foi efetuada com sucesso, para realizar o login com sua nova senha clique neste link: LINK`,
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 50%;">
                        <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Senha redefinida</h1>
                        <p style="color: #A87826; font-size: 1.5rem; margin-left: 2rem; text-align: center;">Olá ${nome_user},</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">Sua redefinição de senha foi efetuada com sucesso,</p>
                        <p style="color: #A87826; font-size: 1.3rem; margin-left: 2rem; text-align: center;">para realizar o login com sua nova senha clique neste link: <a href='${linkLogin}'>LOGIN</a></p>
                    </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function enviarMailDuvida(req, res) {
    const { email_user, duvida_user } = req.body;

    if (email_user && duvida_user) {
        try {
            const info = await transporter.sendMail({
                from: email_user,
                to: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
                subject: `${email_user} enviou um e-mail de dúvida.`,
                text: `${duvida_user}`,
                html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 70%;">
                            <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Dúvida recebida</h1>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem; text-align: center;">${email_user} enviou uma dúvida...</p>
                            <br><br>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem;">${duvida_user}</p>
                        </body>`,
            });
            console.log('Mensagem enviada: %s', info.messageId);
            res.status(200).send({ message: 'Dúvida enviada com sucesso!' });
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            res.status(500).send({ message: 'Erro ao enviar a dúvida.' });
        }
    } else {
        res.status(500).send({ message: 'Preencha todos os campos.' });
    }
}

async function enviarMailSolicitarTroca(req, res) {
    const { email_user, solicitacao_troca, id_pedido } = req.body;

    if (email_user && solicitacao_troca && id_pedido) {
        try {
            const info = await transporter.sendMail({
                from: email_user,
                to: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
                subject: `${email_user} enviou um e-mail solicitando uma troca do pedido #${id_pedido}.`,
                text: `${solicitacao_troca}`,
                html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 70%;">
                            <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Solicitação de troca</h1>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem; text-align: center;">${email_user} enviou uma solicitação de troca...</p>
                            <br><br>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem;">${solicitacao_troca}</p>
                        </body>`,
            });
            console.log('Mensagem enviada: %s', info.messageId);
            res.status(200).send({ message: 'Dúvida enviada com sucesso!' });
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            res.status(500).send({ message: 'Erro ao enviar a dúvida.' });
        }
    } else {
        res.status(500).send({ message: 'Preencha todos os campos.' });
    }
}

async function enviarMailSolicitarDevolucao(req, res) {
    const { email_user, solicitacao_devolucao, id_pedido } = req.body;

    if (email_user && solicitacao_devolucao && id_pedido) {
        try {
            const info = await transporter.sendMail({
                from: email_user,
                to: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
                subject: `${email_user} enviou um e-mail solicitando uma devolução do pedido #${id_pedido}.`,
                text: `${solicitacao_devolucao}`,
                html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 70%;">
                            <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Solicitação de devolução</h1>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem; text-align: center;">${email_user} enviou uma solicitação de devolução...</p>
                            <br><br>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem;">${solicitacao_devolucao}</p>
                        </body>`,
            });
            console.log('Mensagem enviada: %s', info.messageId);
            res.status(200).send({ message: 'Dúvida enviada com sucesso!' });
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            res.status(500).send({ message: 'Erro ao enviar a dúvida.' });
        }
    } else {
        res.status(500).send({ message: 'Preencha todos os campos.' });
    }
}

async function enviarMailAviseQuandoChegar(req, res) {
    const { nome_produto } = req.params;
    const { email_user } = req.body;

    if (!email_user || !nome_produto) {
        return res.status(400).send({ message: 'Preencha todos os campos.' });
    }

    try {
        const info = await transporter.sendMail({
            from: email_user,
            to: `'Aurea Clothing' <${process.env.SMTP_GMAIL_USER}>`,
            subject: `${email_user} necessita de um aviso quando o produto ${nome_produto} estiver disponível.`,
            text: `${email_user} necessita de um aviso quando o produto ${nome_produto} estiver disponível.`,
            html: ` <body style="margin: 7rem; padding: 0; box-sizing: border-box; border: 1px solid #A87826; width: 70%;">
                            <h1 style="font-size: 2rem; color: #FFF; background-color: #A87826; padding: .5rem; margin: 0; text-align: center;">Aviso de disponibilidade de produto</h1>
                            <p style="color: #A87826; font-size: 1.3rem; margin-left: 1rem; text-align: center;">${email_user} necessita de um aviso quando o produto ${nome_produto} estiver disponível.</p>
                        </body>`,
        });
        console.log('Mensagem enviada: %s', info.messageId);
        res.status(200).send({ message: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        res.status(500).send({ message: 'Erro ao enviar o e-mail.' });
    }

}

module.exports = { cadastrarMail, recuperarSenha, pedidoRealizado, pedidoAprovado, redefinicaoEmail, redefinicaoSenha, emailRedefinido, senhaRedefinida, enviarMailDuvida, enviarMailSolicitarTroca, enviarMailSolicitarDevolucao, enviarMailAviseQuandoChegar }