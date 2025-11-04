// controllers/auth.controller.js

const UsuarioModel = require('../models/usuario.model');
const bcrypt = require('bcrypt');

// Função de Cadastro
exports.register = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Verifica se o email já existe
        const existingUser = await UsuarioModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
        }

        // Cria o usuário (o modelo faz o hashing com bcrypt)
        const userId = await UsuarioModel.create(nome, email, senha);
        
        // Sucesso
        res.status(201).json({ 
            message: 'Cadastro realizado com sucesso! Você pode fazer login.', 
            userId: userId
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno ao tentar cadastrar o usuário.' });
    }
};

// Função de Login
exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 1. Encontra o usuário
        const user = await UsuarioModel.findByEmail(email);
        if (!user) {
            // Mensagem genérica por segurança
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 2. Compara a senha (plaintext) com o hash armazenado
        const match = await bcrypt.compare(senha, user.senha_hash);

        if (!match) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 3. Login bem-sucedido: retorna o ID do usuário
        res.json({
            message: 'Login realizado com sucesso!',
            userId: user.id_usuario, // Este ID será armazenado no localStorage do cliente
            nome: user.nome
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno ao tentar fazer login.' });
    }
};