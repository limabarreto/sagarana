// src/controllers/userController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// 🚨 Nota: Certifique-se de que o caminho para o prismaClient.cjs está correto
import prisma from '../config/prismaClient.cjs'; 
import { UserRole } from '@prisma/client';     

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; 

// --- 1. FUNÇÃO DE REGISTRO (POST /api/users/register) ---
export const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { 
                email, name, password: hashedPassword,
                role: UserRole.CLIENTE 
            },
            select: { id: true, email: true, name: true, role: true },
        });
        res.status(201).json({ message: "Usuário registrado com sucesso.", user });
    } catch (error) {
        if (error.code === 'P2002') { 
            return res.status(409).json({ error: "Este email já está em uso." });
        }
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

// --- 2. FUNÇÃO DE LOGIN (POST /api/users/login) ---
export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, role: user.role, name: user.name });
};

// --- 3. FUNÇÃO DE PERFIL (GET /api/users/profile) ---
export const getProfile = async (req, res) => {
    // req.user é injetado pelo authenticateToken
    const userId = req.user.userId; 

    const user = await prisma.user.findUnique({
        where: { id: userId }, 
        select: { id: true, email: true, name: true, createdAt: true, role: true }, 
    });
    
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(user);
};

// --- 4. FUNÇÃO ADMINISTRATIVA (PUT /api/users/promote/:id) ---
export const promoteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role: UserRole.ADMIN },
        });
        res.json({ 
            message: `Usuário ${updatedUser.name} promovido para ADMIN.`, 
            user: updatedUser 
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        res.status(500).json({ error: "Erro interno ao promover usuário." });
    }
};