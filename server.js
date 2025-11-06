// server.js

// Importa o aplicativo Express já configurado no app.js
const app = require('./app'); 

// Define a porta diretamente (sem .env)
const PORT = 3000; 

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});