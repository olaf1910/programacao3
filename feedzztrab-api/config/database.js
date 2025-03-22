const mysql = require('mysql2/promise');
require('dotenv').config();

const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: 'utf8mb4' // Suporte para caracteres portugueses
});

module.exports = conexao;