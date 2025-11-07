// models/leitura.model.js

const db = require('../config/db.config');

const Leitura = {
    /**
     * Insere um novo registro de leitura.
     */
    create: async (data) => {
        const [result] = await db.query(
            'INSERT INTO Leitura (id_usuario, id_livro, tempo_leitura_horas, nota, resenha, data_fim) VALUES (?, ?, ?, ?, ?, ?)',
            [data.id_usuario, data.id_livro, data.tempo_leitura_horas, data.nota, data.resenha, data.data_fim]
        );
        return result.insertId;
    },

    /**
     * Obtém estatísticas do usuário (total de livros e média de notas).
     */
    getStats: async (id_usuario) => {
        const [rows] = await db.query(
            `SELECT 
                COUNT(id_leitura) AS total_livros_lidos, 
                IFNULL(AVG(nota), 0) AS media_notas 
            FROM Leitura 
            WHERE id_usuario = ?`,
            [id_usuario]
        );
        // Formata a média para uma casa decimal
        rows[0].media_notas = parseFloat(rows[0].media_notas).toFixed(1);
        return rows[0];
    },

    /**
     * Obtém lista de leituras com ou sem filtros.
     * Utiliza JOIN para trazer os dados do Livro.
     */
    getFiltered: async (id_usuario, genero, nota) => {
        let query = `
            SELECT R.id_leitura, L.titulo, L.autor, L.genero, L.total_paginas, L.capa_url, R.nota, R.resenha, R.tempo_leitura_horas
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
    },

    /**
     * Atualiza um registro de leitura existente. (UPDATE)
     * A atualização é baseada no ID da leitura E no ID do usuário para segurança.
     */
    update: async (id_leitura, id_usuario, data) => {
        const [result] = await db.query(
            `UPDATE Leitura 
             SET nota = ?, 
                 resenha = ?, 
                 tempo_leitura_horas = ?,
                 data_fim = ?
             WHERE id_leitura = ? AND id_usuario = ?`,
            [data.nota, data.resenha, data.tempo_leitura_horas, data.data_fim, id_leitura, id_usuario]
        );
        return result.affectedRows;
    },

    /**
     * Remove um registro de leitura. (DELETE)
     * A exclusão é baseada no ID da leitura E no ID do usuário para segurança.
     */
    remove: async (id_leitura, id_usuario) => {
        const [result] = await db.query(
            'DELETE FROM Leitura WHERE id_leitura = ? AND id_usuario = ?',
            [id_leitura, id_usuario]
        );
        return result.affectedRows;
    }
};

module.exports = Leitura;