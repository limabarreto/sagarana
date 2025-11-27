// userRoutes.js — responsável por organizar todas as rotas relacionadas aos usuários
// aqui conectamos cada rota a uma função do controller correspondente

import { Router } from 'express';
import { getAllUsers } from '../controllers/userController.js';

const router = Router();

// quando o cliente acessar /users, chamaremos a função getAllUsers do controller
router.get('/', getAllUsers);

export default router;
