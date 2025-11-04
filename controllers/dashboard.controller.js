// controllers/dashboard.controller.js

const LeituraModel = require('../models/leitura.model');
const UsuarioModel = require('../models/usuario.model');

/**
 * Obtém todos os dados necessários para carregar o dashboard do usuário.
 */
exports.getDashboardData = async (req, res) => {
    // O ID do usuário logado é obtido do middleware de autenticação
    const idUsuario = req.userId; 

    try {
        // 1. Obter dados do Usuário
        const usuarioData = await UsuarioModel.findById(idUsuario);
        if (!usuarioData) {
            // Se o ID vier do token/header, mas o usuário não existir
            return res.status(404).json({ message: 'Usuário não encontrado.' }); 
        }

        // 2. Obter estatísticas
        const estatisticas = await LeituraModel.getStats(idUsuario);

        // 3. Obter lista inicial de leituras
        const minhasLeituras = await LeituraModel.getFiltered(idUsuario);

        res.json({
            usuario: usuarioData,
            estatisticas: estatisticas,
            leituras: minhasLeituras
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ message: 'Erro interno ao carregar o dashboard.' });
    }
};