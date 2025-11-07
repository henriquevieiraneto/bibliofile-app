// controllers/leitura.controller.js

const LivroModel = require('../models/livro.model');
const LeituraModel = require('../models/leitura.model');


// Função para Registrar Leitura
exports.registrarLeitura = async (req, res) => {
    // CRÍTICO: Garante que o ID do usuário seja 1 se o middleware não o definir (para teste)
    const id_usuario_logado = req.userId || 1; 
    
    const { titulo, autor, genero, total_paginas, tempo_leitura_horas, nota, resenha, capa_url } = req.body;

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
            const final_capa_url = capa_url || `/imagens/capas/default.jpg`;
            
            // Tratamento de tipos para Livro
            id_livro = await LivroModel.create({
                titulo, 
                autor, 
                genero: genero || null,
                total_paginas: parseInt(total_paginas) || null, 
                capa_url: final_capa_url 
            });
        }

        // 2. Registrar a Leitura
        const leituraData = {
            id_usuario: id_usuario_logado,
            id_livro: id_livro,
            // Tratamento de tipos para Leitura
            tempo_leitura_horas: parseFloat(tempo_leitura_horas) || null, 
            nota: parseFloat(nota), 
            resenha: resenha || null,
            data_fim: new Date().toISOString().slice(0, 10) 
        };

        const leituraId = await LeituraModel.create(leituraData);

        res.status(201).json({ 
            message: 'Leitura registrada com sucesso!', 
            id: leituraId 
        });

    } catch (error) {
        console.error('Erro detalhado ao registrar leitura (500):', error);
        res.status(500).json({ message: 'Erro interno ao processar a leitura.' });
    }
};


// Função para Editar Leitura (PUT /api/leituras/:id)
exports.editarLeitura = async (req, res) => {
    const id_leitura = req.params.id;
    const id_usuario_logado = req.userId || 1; // Fallback para ID de teste
    const data = req.body; 
    
    if (!id_leitura || !data) {
        return res.status(400).json({ message: 'Dados inválidos para edição.' });
    }
    
    try {
        const updateData = {
            tempo_leitura_horas: parseFloat(data.tempo_leitura_horas) || null,
            nota: parseFloat(data.nota),
            resenha: data.resenha || null,
            data_fim: new Date().toISOString().slice(0, 10) 
        };
        
        const affectedRows = await LeituraModel.update(id_leitura, id_usuario_logado, updateData);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Leitura não encontrada ou você não tem permissão para editá-la.' });
        }

        res.status(200).json({ message: `Leitura ${id_leitura} editada com sucesso.`, affectedRows });
        
    } catch (error) {
        console.error(`Erro ao editar leitura ID ${id_leitura}:`, error);
        res.status(500).json({ message: 'Erro interno ao tentar salvar a edição.' });
    }
};


// Função para Excluir Leitura (DELETE /api/leituras/:id)
exports.excluirLeitura = async (req, res) => {
    const id_leitura = req.params.id;
    const id_usuario_logado = req.userId || 1; // Fallback para ID de teste

    if (!id_leitura) {
        return res.status(400).json({ message: 'ID da leitura ausente.' });
    }

    try {
        const affectedRows = await LeituraModel.remove(id_leitura, id_usuario_logado);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Leitura não encontrada ou você não tem permissão para excluir.' });
        }

        res.status(204).send(); 

    } catch (error) {
        console.error(`Erro ao excluir leitura ID ${id_leitura}:`, error);
        res.status(500).json({ message: 'Erro interno ao tentar excluir a leitura.' });
    }
};

// Função para Filtrar Leituras
exports.filtrarLeituras = async (req, res) => {
    const id_usuario_logado = req.userId || 1; // Fallback para ID de teste
    const { genero, nota } = req.query;

    try {
        const leituras = await LeituraModel.getFiltered(id_usuario_logado, genero, nota);
        res.json(leituras);
    } catch (error) {
        console.error('Erro ao filtrar leituras:', error);
        res.status(500).json({ message: 'Erro interno ao buscar leituras filtradas.' });
    }
};