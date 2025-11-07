// models/livro.model.js

const db = require('../config/db.config');

const Livro = {
    /**
     * Busca um livro pelo título e autor para evitar duplicidade.
     * Retorna o objeto do livro ou undefined.
     */
    findByTitleAndAuthor: async (titulo, autor) => {
        const [rows] = await db.query(
            'SELECT id_livro FROM Livro WHERE titulo = ? AND autor = ?',
            [titulo, autor]
        );
        return rows[0]; 
    },

    /**
     * Insere um novo livro no catálogo.
     * @param {Object} data - Dados do livro (titulo, autor, genero, total_paginas, capa_url)
     * Retorna o ID do livro recém-inserido.
     */
    create: async (data) => {
        // Query para INSERT (CREATE)
        const [result] = await db.query(
            'INSERT INTO Livro (titulo, autor, genero, total_paginas, capa_url) VALUES (?, ?, ?, ?, ?)',
            [data.titulo, data.autor, data.genero, data.total_paginas, data.capa_url]
        );
        
        // Retorna o ID para ser usado na tabela 'Leitura' (Foreign Key)
        return result.insertId; 
    }
    
    // As funções de update/delete deste modelo não são estritamente necessárias, 
    // pois a edição/exclusão se concentra primariamente nos registros da tabela 'Leitura'.
};

module.exports = Livro;