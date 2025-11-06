// config/db.config.js (Substitua as credenciais de exemplo pelas suas)

const mysql = require('mysql2');

// Configurações do MySQL (AQUI VOCÊ DEVE TER SEUS VALORES REAIS)
const dbConfig = {
    host: 'localhost',      
    user: 'root',           // << Insira seu usuário real
    password: 'senai',  // << Insira sua senha real
    database: 'bibliofile_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Criação do pool de conexões
const pool = mysql.createPool(dbConfig);

// Testa a conexão ao iniciar o servidor
pool.getConnection((err, connection) => {
    if (err) {
        // MUITO IMPORTANTE: Garanta que o serviço MySQL (xampp, wamp, etc.) está rodando.
        console.error('ERRO CRÍTICO: Falha ao conectar ao banco de dados. Verifique suas credenciais e se o MySQL está ativo.', err.stack);
        throw err; // Força a interrupção para evitar mais erros 500
    } else {
        console.log('Conexão MySQL estabelecida com sucesso! ID:', connection.threadId);
        connection.release(); 
    }
});

module.exports = pool.promise();