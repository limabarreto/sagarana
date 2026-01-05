// src/routes/reviewRoutes.js

import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import { UserRole } from '@prisma/client';

const router = express.Router();

// 1. Rotas PÚBLICAS
router.get('/', reviewController.getApprovedReviews);     
router.get('/:id', reviewController.getReviewById);       

// 2. Rotas PROTEGIDAS
// Requer apenas que o usuário esteja logado
router.post('/', authenticateToken, reviewController.submitNewReview); 

// 3. Rotas ADMINISTRATIVAS
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