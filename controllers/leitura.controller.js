// controllers/leitura.controller.js

const LivroModel = require('../models/livro.model');
const LeituraModel = require('../models/leitura.model');

// Função para Registrar Leitura
exports.registrarLeitura = async (req, res) => {
    // O ID do usuário logado é injetado no req.userId pelo auth.middleware.js
    const id_usuario_logado = req.userId; 
    
    // Desestrutura os dados do formulário
    const { titulo, autor, genero, total_paginas, tempo_leitura_horas, nota, resenha } = req.body;

    // Simulação de URL da Capa
    const capa_url = `/imagens/capas/${titulo ? titulo.replace(/\s/g, '_').toLowerCase() : 'default'}.jpg`; 

    if (!titulo || !autor || !nota) {
        return res.status(400).json({ message: 'Título, Autor e Nota são campos obrigatórios.' });
    }

    try {
        let id_livro;

        // 1. Verificar/Inserir Livro na tabela Livro
        const livroExistente = await LivroModel.findByTitleAndAuthor(titulo, autor);

        if (livroExistente) {
            id_livro = livroExistente.id_livro;
        } else {
            id_livro = await LivroModel.create({
                titulo, 
                autor, 
                genero, 
                total_paginas, 
                capa_url
            });
        }

        // 2. Registrar a Leitura na tabela Leitura
        const leituraData = {
            id_usuario: id_usuario_logado,
            id_livro: id_livro,
            tempo_leitura_horas: tempo_leitura_horas || 0,
            nota: nota,
            resenha: resenha,
            data_fim: new Date().toISOString().slice(0, 10) // Data de hoje
        };

        const leituraId = await LeituraModel.create(leituraData);

        res.status(201).json({ 
            message: 'Leitura registrada com sucesso!', 
            id: leituraId 
        });

    } catch (error) {
        console.error('Erro ao registrar leitura:', error);
        res.status(500).json({ message: 'Erro interno ao processar a leitura.' });
    }
};

// Função para Filtrar Leituras
exports.filtrarLeituras = async (req, res) => {
    // O ID do usuário logado é injetado no req.userId pelo auth.middleware.js
    const id_usuario_logado = req.userId; 
    const { genero, nota } = req.query;

    try {
        const leituras = await LeituraModel.getFiltered(id_usuario_logado, genero, nota);
        res.json(leituras);
    } catch (error) {
        console.error('Erro ao filtrar leituras:', error);
        res.status(500).json({ message: 'Erro interno ao buscar leituras filtradas.' });
    }
};