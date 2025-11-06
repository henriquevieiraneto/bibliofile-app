// models/livro.model.js

const db = require('../config/db.config');

const Livro = {
    /**
     * Busca um livro pelo título e autor para evitar duplicidade.
     */
    findByTitleAndAuthor: async (titulo, autor) => {
        const [rows] = await db.query(
            'SELECT id_livro FROM Livro WHERE titulo = ? AND autor = ?',
            [titulo, autor]
        );
        return rows[0]; // Retorna o objeto do livro ou undefined
    },

    /**
     * Insere um novo livro no catálogo.
     */
    create: async (data) => {
        const [result] = await db.query(
            'INSERT INTO Livro (titulo, autor, genero, total_paginas, capa_url) VALUES (?, ?, ?, ?, ?)',
            [data.titulo, data.autor, data.genero, data.total_paginas, data.capa_url]
        );
        // Retorna o ID da nova linha inserida
        return result.insertId; 
    }
    
    // Nenhuma função de update/delete é necessária aqui, pois o livro só é gerenciado pelo LeituraController
};

module.exports = Livro;