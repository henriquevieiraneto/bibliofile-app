// routes/views.routes.js

const express = require('express');
const router = express.Router();
const path = require('path');

// Rota principal (homepage)
router.get('/', (req, res) => {
    // Envia o arquivo index.html que está na pasta 'public'
    // O __dirname aponta para a pasta 'routes', então subimos um nível (..) e entramos em 'public'
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Outras rotas de visualização (ex: /login, /sobre) iriam aqui.

module.exports = router;