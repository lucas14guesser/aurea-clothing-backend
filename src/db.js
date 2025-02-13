const mysql = require('mysql2');

// Criação de um pool de conexões (ao invés de uma única conexão)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Exposição do pool com suporte a promessas
module.exports = pool.promise();