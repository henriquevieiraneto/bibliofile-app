// controllers/dashboard.controller.js (CORRIGIDO)

const LeituraModel = require('../models/leitura.model');
const UsuarioModel = require('../models/usuario.model');

/**
 * Obtém todos os dados necessários para carregar o dashboard do usuário.
 */
exports.getDashboardData = async (req, res) => {
    // CRÍTICO: Se req.userId for undefined (middleware desativado), usa o ID 1 para teste.
    const idUsuario = req.userId || 1; 

    try {
        // 1. Obter dados do Usuário
        const usuarioData = await UsuarioModel.findById(idUsuario);
        if (!usuarioData) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // 2. Obter estatísticas (AQUI ESTAVA O ERRO DE UNDEFINED)
        const estatisticas = await LeituraModel.getStats(idUsuario);

        // 3. Obter lista inicial de leituras (sem filtros)
        const minhasLeituras = await LeituraModel.getFiltered(idUsuario);

        // 4. Combina e envia a resposta
        res.json({
            usuario: usuarioData,
            estatisticas: estatisticas,
            leituras: minhasLeituras
        });

    } catch (error) {
        // Log detalhado para o terminal Node.js
        console.error('Erro ao buscar dados do dashboard (500):', error);
        res.status(500).json({ message: 'Erro interno ao carregar o dashboard.' });
    }
};