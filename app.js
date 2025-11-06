// app.js

const express = require('express');
const path = require('path');

// Importa as configurações necessárias
require('./config/db.config'); 
const UsuarioModel = require('./models/usuario.model'); 

// Importa as rotas
// CRÍTICO: Garante que a importação funcione.
const apiRoutes = require('./routes/api.routes'); 
const viewRoutes = require('./routes/views.routes'); 

const app = express();

// --- Middlewares ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Servir arquivos estáticos (CSS, JS, Imagens, etc. da pasta 'public')
app.use(express.static(path.join(__dirname, 'public')));

// --- Roteamento Principal ---

// CRÍTICO: Monta o roteador API no prefixo '/api'
app.use('/api', apiRoutes); 

// Monta o roteador de Views na raiz '/'
app.use('/', viewRoutes); 

module.exports = app;