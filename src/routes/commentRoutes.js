// src/routes/commentRoutes.js

import express from 'express';
import * as commentController from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Rotas PÚBLICAS
// GET /api/comments/:reviewId: Lista todos os comentários de uma resenha
router.get('/:reviewId', commentController.getCommentsByReviewId); 

// Rotas PROTEGIDAS (Criação/Submissão)
// POST /api/comments: Cria um novo comentário ou resposta
// Apenas usuários logados podem postar
router.post('/', authenticateToken, commentController.createComment); 

export default router;