// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
// Importa o enum UserRole para usar no checkRole
// import { UserRole } from '@prisma/client'; 

// 🚨 Chave Secreta: Lida do .env via server.js ou dotenv
const JWT_SECRET = process.env.JWT_SECRET; 

// 1. Função: authenticateToken (Verifica o Login)
// Injeta req.user = { userId, typeUser }
export const authenticateToken = (req, res, next) => {
    // Tenta obter o token do cabeçalho 'Authorization: Bearer <token>'
    const authHeader = req.headers['authorization'];
    // Opcional: Tratar o caso de o cabeçalho não ser uma string (pode acontecer em ambientes de teste)
    const token = (typeof authHeader === 'string') ? authHeader.split(' ')[1] : null;

    if (token == null) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    // 💡 Alteramos o nome do parâmetro para 'payload' para refletir o conteúdo do token
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            // 403: Proibido (Token inválido, expirado, modificado, etc.)
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        
        // 🚨 CRÍTICO: Anexa os dados do token (userId, typeUser) ao request
        req.user = payload; 
        next(); 
    });
};


// 2. Função: checkRole (Verifica o Papel do Usuário)
// Requer que o authenticateToken tenha rodado antes.
export const checkRole = (requiredRole) => {
    return (req, res, next) => {
        // 💡 Correção: Seu JWT usa a chave 'typeUser', não 'role'.
        if (!req.user || req.user.typeUser !== requiredRole) {
            // 403: Proibido (Usuário logado, mas sem permissão)
            return res.status(403).json({ message: `Acesso Proibido. Requer papel de ${requiredRole}.` });
        }

        next();
    };
};