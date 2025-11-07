// config/db.config.js

const mysql = require('mysql2');

// Configurações do MySQL (SUBSTITUA PELAS SUAS CREDENCIAIS REAIS)
const dbConfig = {
    host: 'localhost',      
    user: 'root',           // << Seu usuário
    password: 'senai',  // << Sua senha
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
        // MUITO IMPORTANTE: Se esta falha ocorrer, o servidor MySQL não está ativo
        console.error('ERRO CRÍTICO: Falha ao conectar ao banco de dados. Verifique suas credenciais e se o serviço MySQL está rodando.', err.stack);
        throw err; 
    } else {
        console.log('Conexão MySQL estabelecida com sucesso! ID:', connection.threadId);
        connection.release(); 
    }
});

// Exporta o pool com suporte a Promessas para async/await
module.exports = pool.promise();