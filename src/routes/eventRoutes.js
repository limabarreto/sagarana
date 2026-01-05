// src/routes/eventRoutes.js

import express from 'express';
import * as eventController from '../controllers/eventController.js'; 
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import { UserRole } from '@prisma/client'; 

const router = express.Router();

// Rotas PÚBLICAS, ualquer um pode ver o que já foi aprovado
// GET /api/events: Lista todos os eventos aprovados
router.get('/', eventController.getApprovedEvents); 
// GET /api/events/:id: Detalhe do evento, somente se aprovado
router.get('/:id', eventController.getEventById);

// Rotas ADMINISTRATIVAS, exigem token e o papel ADMIN

// POST /api/events: cria um novo evento APENAS ADMIN
router.post(
    '/', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    eventController.createEvent
);

// GET /api/events/pending: lista eventos pendentes APENAS ADMIN
router.get(
    '/pending', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    eventController.getPendingEvents
);

// PUT /api/events/:id/approve: aprova o evento APENAS ADMIN
router.put(
    '/:id/approve', 
    authenticateToken, 
    checkRole(UserRole.ADMIN), 
    eventController.approveEvent
);

export default router;