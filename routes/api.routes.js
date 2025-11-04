// routes/api.routes.js

const express = require('express');
const router = express.Router();

// Importa Controladores
const leituraController = require('../controllers/leitura.controller');
const dashboardController = require('../controllers/dashboard.controller');
const authController = require('../controllers/auth.controller'); 

// Importa Middleware
const authMiddleware = require('../middlewares/auth.middleware'); 

// --- Rotas de Autenticação (ABERTAS) ---
// Estes endpoints NÃO usam o middleware de proteção
router.post('/cadastro', authController.register);
router.post('/login', authController.login);

// --- Rotas Protegidas (Exigem Login) ---
// Aplica o middleware 'protect' a todas as rotas abaixo
// router.use() aplica o middleware em todas as rotas definidas a partir daqui.
router.use(authMiddleware.protect); 

// Rotas de Dashboard
router.get('/dashboard', dashboardController.getDashboardData);

// Rotas de Leitura
router.post('/leituras', leituraController.registrarLeitura);
router.get('/leituras/filtro', leituraController.filtrarLeituras); 

module.exports = router;