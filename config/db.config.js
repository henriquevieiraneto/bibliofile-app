// config/db.config.js

const mysql = require('mysql2');
require('dotenv').config();

// Criação do pool de conexões, que é mais eficiente para aplicações web
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão ao iniciar o servidor
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        // Em um projeto real, você poderia tentar reconectar aqui
    } else {
        console.log('Conexão MySQL estabelecida com sucesso! ID:', connection.threadId);
        connection.release(); // Libera a conexão
    }
});

// Exporta o pool com suporte a Promessas para uso com async/await
module.exports = pool.promise();