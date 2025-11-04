// models/livro.model.js

const db = require('../config/db.config');

const Livro = {
    // Busca um livro pelo título e autor
    findByTitleAndAuthor: async (titulo, autor) => {
        const [rows] = await db.query(
            'SELECT id_livro FROM Livro WHERE titulo = ? AND autor = ?',
            [titulo, autor]
        );
        return rows[0];
    },

    // Insere um novo livro
    create: async (data) => {
        const result = await db.query(
            'INSERT INTO Livro (titulo, autor, genero, total_paginas, capa_url) VALUES (?, ?, ?, ?, ?)',
            [data.titulo, data.autor, data.genero, data.total_paginas, data.capa_url]
        );
        return result[0].insertId;
    }
};

module.exports = Livro;