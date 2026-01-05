// src/routes/bookRoutes.js

import express from 'express'; // ⬅️ IMPORTAÇÃO CORRIGIDA
import * as bookController from '../controllers/bookController.js'; 
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js'; // ⬅️ IMPORTAÇÃO NECESSÁRIA PARA O AUTH
import { UserRole } from '@prisma/client'; 

const router = express.Router();

// 1. Rota de Submissão (POST)
// POST /api/books: Submeter um novo item para aprovação. Requer login.
router.post(
    '/', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), // 🚨 MUDANÇA: ADICIONE ESTA LINHA!
    bookController.submitNewBook
);


// 2. Rotas PÚBLICAS (GET)
// GET /api/books: Lista todos os itens aprovados
router.get('/', bookController.getApprovedBooks); 


// 3. Rotas ADMINISTRATIVAS (Moderação - Prioridade alta para rotas fixas)

// GET /api/books/pending: Lista de itens pendentes (Apenas ADMIN)
router.get(
    '/pending', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    bookController.getPendingBooks
);

// PUT /api/books/:id/approve: Aprova o item (Apenas ADMIN)
router.put(
    '/:id/approve', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    bookController.approveBook
);


// 4. Rotas PÚBLICAS com PARÂMETRO (GET /:id)
// GET /api/books/:id: Detalhe do item. DEVE FICAR POR ÚLTIMO para não confundir com /pending
router.get('/:id', bookController.getBookById);       

export default router;