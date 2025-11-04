// server.js (ATUALIZADO)

const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config(); 

// Importa as rotas
const apiRoutes = require('./routes/api.routes'); 
const viewRoutes = require('./routes/views.routes'); 

// Importa a configuração do DB (apenas para iniciar a conexão)
require('./config/db.config'); 

const PORT = process.env.PORT || 3000;

// O código de inicialização do Usuário (initializeUser()) foi removido, 
// pois agora o usuário deve se cadastrar via frontend.

// --- Middlewares ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Servir arquivos estáticos (CSS, JS, Imagens, index.html)
app.use(express.static(path.join(__dirname, 'public')));

// --- Rotas ---
app.use('/api', apiRoutes);
app.use('/', viewRoutes); 

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});