// middlewares/auth.middleware.js

// Vamos simular uma verificação simples por enquanto. 
// Em produção, você verificaria um token JWT no cabeçalho da requisição.

exports.protect = (req, res, next) => {
    // Simulando que o ID do usuário é passado no header para rotas protegidas
    const idUsuario = req.headers['x-user-id']; 

    if (!idUsuario || isNaN(parseInt(idUsuario))) {
        // 401 Unauthorized
        return res.status(401).json({ 
            message: 'Acesso negado. Usuário não autenticado. Por favor, faça login.' 
        });
    }

    // Adiciona o ID do usuário à requisição para uso posterior nos controladores
    req.userId = parseInt(idUsuario); 
    next(); // Continua para o controlador
};