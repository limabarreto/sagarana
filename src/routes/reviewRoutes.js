// src/routes/reviewRoutes.js

import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

// 1. Rotas PÚBLICAS
router.get('/', reviewController.getApprovedReviews);     // Lista todas ou filtra por bookId
router.get('/:id', reviewController.getReviewById);       // Detalhe da resenha

// 2. Rotas PROTEGIDAS (Submissão)
// Requer apenas que o usuário esteja logado
router.post('/', authenticateToken, reviewController.submitNewReview); 

// 3. Rotas ADMINISTRATIVAS (Moderação)
// Apenas usuários com role: ADMIN
router.get(
    '/pending', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    reviewController.getPendingReviews
);
router.put(
    '/:id/approve', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    reviewController.approveReview
);

export default router;