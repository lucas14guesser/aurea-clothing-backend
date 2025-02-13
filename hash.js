const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashed = async () => {
    try {
        const hashedPass = await bcrypt.hash('Aurea379102@', saltRounds);
        console.log('Senha hasheada:', hashedPass);
        return hashedPass;
    } catch (error) {
        console.error('Erro ao hashear a senha:', error);
    }
};

hashed();
