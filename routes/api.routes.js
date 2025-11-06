// routes/api.routes.js (Corrigido: Garante a importação do Express)

const express = require('express'); // <--- ESSA LINHA É CRÍTICA!
const router = express.Router();

// Importa Controladores
const leituraController = require('../controllers/leitura.controller');
const dashboardController = require('../controllers/dashboard.controller');
const authController = require('../controllers/auth.controller'); 

// Importa Middleware (Mantido, mas desativado)
const authMiddleware = require('../middlewares/auth.middleware'); 

// --- Rotas de Autenticação ---
router.post('/cadastro', authController.register);
router.post('/login', authController.login);

// --- Rotas de DADOS (TODAS ABERTAS PARA DIAGNÓSTICO) ---

// Rotas de Dashboard
router.get('/dashboard', dashboardController.getDashboardData);

// Rotas de Leitura
router.post('/leituras', leituraController.registrarLeitura);

// Rotas CRUD (Edição e Exclusão)
router.put('/leituras/:id', leituraController.editarLeitura);
router.delete('/leituras/:id', leituraController.excluirLeitura);

router.get('/leituras/filtro', leituraController.filtrarLeituras); 

module.exports = router;