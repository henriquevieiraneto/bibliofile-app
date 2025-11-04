// models/usuario.model.js

const db = require('../config/db.config');
const bcrypt = require('bcrypt'); // ADICIONADO

const Usuario = {
    // Busca dados básicos do usuário por ID para o dashboard
    findById: async (id_usuario) => {
        const [rows] = await db.query(
            'SELECT id_usuario, nome, email, foto_perfil FROM Usuario WHERE id_usuario = ?',
            [id_usuario]
        );
        return rows[0];
    },

    // Novo: Busca um usuário pelo email (usado no login e cadastro)
    findByEmail: async (email) => {
        const [rows] = await db.query(
            'SELECT id_usuario, nome, email, senha_hash FROM Usuario WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Novo: Cadastra um novo usuário (hashing da senha)
    create: async (nome, email, senha) => {
        const saltRounds = 10;
        const senha_hash = await bcrypt.hash(senha, saltRounds);

        const [result] = await db.query(
            'INSERT INTO Usuario (nome, email, senha_hash) VALUES (?, ?, ?)',
            [nome, email, senha_hash]
        );
        return result[0].insertId;
    },

    // A função de teste para inicialização deve ser mantida APENAS se você precisar
    // garantir que o usuário 1 exista para testar o dashboard sem passar pelo cadastro.
    createIfNotExist: async (id_usuario, nome, email, senha_hash) => {
        const existing = await Usuario.findById(id_usuario);
        if (!existing) {
            const [result] = await db.query(
                'INSERT INTO Usuario (id_usuario, nome, email, senha_hash) VALUES (?, ?, ?, ?)',
                [id_usuario, nome, email, senha_hash]
            );
            return result.insertId;
        }
        return id_usuario;
    }
};

module.exports = Usuario;