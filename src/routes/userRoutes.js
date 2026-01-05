// src/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js'; 
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import { UserRole } from '@prisma/client'; 

const router = express.Router();

// 1. Rotas PÚBLICAS
router.post('/register', userController.register); 
router.post('/login', userController.login); 

// 2. Rotas PROTEGIDAS 
router.get('/profile', authenticateToken, userController.getProfile); 

// 3. Rotas ADMINISTRATIVAS
router.put(
    '/promote/:id', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    userController.promoteUser
);

export default router;