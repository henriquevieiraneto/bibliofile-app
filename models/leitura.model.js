// models/leitura.model.js

const db = require('../config/db.config');

const Leitura = {
    // Insere um novo registro de leitura
    create: async (data) => {
        const result = await db.query(
            'INSERT INTO Leitura (id_usuario, id_livro, tempo_leitura_horas, nota, resenha, data_fim) VALUES (?, ?, ?, ?, ?, ?)',
            [data.id_usuario, data.id_livro, data.tempo_leitura_horas, data.nota, data.resenha, data.data_fim]
        );
        return result[0].insertId;
    },

    // Obtém estatísticas do usuário
    getStats: async (id_usuario) => {
        const [rows] = await db.query(
            `SELECT 
                COUNT(id_leitura) AS total_livros_lidos, 
                IFNULL(AVG(nota), 0) AS media_notas 
            FROM Leitura 
            WHERE id_usuario = ?`,
            [id_usuario]
        );
        // Formata a média para ter uma casa decimal, como no exemplo (4.2)
        rows[0].media_notas = parseFloat(rows[0].media_notas).toFixed(1);
        return rows[0];
    },

    // Obtém lista de leituras com ou sem filtros
    getFiltered: async (id_usuario, genero, nota) => {
        let query = `
            SELECT L.titulo, L.autor, L.genero, L.total_paginas, L.capa_url, R.nota, R.resenha
            FROM Leitura R
            JOIN Livro L ON R.id_livro = L.id_livro
            WHERE R.id_usuario = ?
        `;
        const params = [id_usuario];

        if (genero && genero !== 'Todos os gêneros') {
            query += ' AND L.genero = ?';
            params.push(genero);
        }

        if (nota && nota !== 'Todas as notas') {
            query += ' AND R.nota >= ?';
            params.push(parseFloat(nota));
        }

        query += ' ORDER BY R.data_fim DESC';
        
        const [rows] = await db.query(query, params);
        return rows;
    }
};

module.exports = Leitura;