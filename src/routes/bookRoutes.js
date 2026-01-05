// src/routes/bookRoutes.js

import express from 'express'; 
import * as bookController from '../controllers/bookController.js'; 
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import { UserRole } from '@prisma/client'; 

const router = express.Router();

router.post(
    '/', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    bookController.submitNewBook
);

router.get('/', bookController.getApprovedBooks); 


router.get(
    '/pending', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    bookController.getPendingBooks
);

router.put(
    '/:id/approve', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    bookController.approveBook
);

router.get('/:id', bookController.getBookById);       

export default router;