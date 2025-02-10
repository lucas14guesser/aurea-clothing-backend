const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
    if (!req.cookies) {
        return res.status(401).json({ message: 'Cookies não estão definidos.' });
    }

    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Por favor, faça login.' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = autenticarToken;
