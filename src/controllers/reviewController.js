// src/controllers/reviewController.js

import prisma from '../config/prismaClient.cjs';
// Note que o UserRole não é necessário aqui, mas sim na Rota

// --- 1. GET /api/reviews: Obter Resenhas Aprovadas (PÚBLICA) ---
export const getApprovedReviews = async (req, res) => {
    const bookId = req.query.bookId; 

    try {
        const reviews = await prisma.review.findMany({
            where: {
                isApproved: true, // Apenas aprovadas
                ...(bookId && { bookId: parseInt(bookId) }),
            },
            // Inclui o autor e o livro para contexto
            include: { 
                author: { select: { name: true } }, 
                book: { select: { title: true } }
            }, 
            orderBy: { createdAt: 'desc' }, 
        });
        
        res.json(reviews);
    } catch (error) {
        console.error("Erro ao obter resenhas:", error);
        res.status(500).json({ error: "Erro interno ao buscar resenhas." });
    }
};


// --- 2. GET /api/reviews/:id: Obter Detalhe de uma Resenha (PÚBLICA) ---
export const getReviewById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const review = await prisma.review.findUnique({
            where: { id: parseInt(id) },
            include: { 
                author: { select: { name: true } },
                // Inclui todos os comentários (e respostas) associados
                comments: { orderBy: { createdAt: 'asc' } }
            }
        });

        // Garante que só mostramos a resenha se ela for APROVADA
        if (!review || !review.isApproved) {
            return res.status(404).json({ error: "Resenha não encontrada ou pendente de aprovação." });
        }
        
        res.json(review);
    } catch (error) {
        console.error("Erro ao obter detalhe da resenha:", error);
        res.status(500).json({ error: "Erro interno ao buscar detalhe da resenha." });
    }
};


// --- 3. POST /api/reviews: Submeter Nova Resenha (REQUER LOGIN) ---
export const submitNewReview = async (req, res) => {
    const authorId = req.user.userId; 
    const { content, rating, bookId } = req.body;

    if (!content || !rating || !bookId) {
        return res.status(400).json({ error: "Conteúdo, nota (rating) e o ID do livro são obrigatórios." });
    }

    try {
        const newReview = await prisma.review.create({
            data: {
                content, 
                rating: parseInt(rating), 
                bookId: parseInt(bookId),
                authorId,
                isApproved: false, // 🚨 CRÍTICO: Inicia como NÃO APROVADA
            },
            include: { book: { select: { title: true } } }
        });

        res.status(201).json({ 
            message: `Resenha submetida para moderação sobre o item "${newReview.book.title}".`, 
            review: newReview 
        });
        
    } catch (error) {
        console.error("Erro na submissão da resenha:", error);
        // P2003 geralmente significa que o bookId não existe (Foreign Key Constraint)
        res.status(500).json({ error: "Erro interno ao submeter resenha. Verifique se o ID do livro é válido." });
    }
};


// --- 4. PUT /api/reviews/:id/approve: Aprovar Resenha (REQUER ADMIN) ---
export const approveReview = async (req, res) => {
    const { id } = req.params; 
    
    try {
        const approvedReview = await prisma.review.update({
            where: { id: parseInt(id) },
            data: { isApproved: true }, 
        });

        res.json({ 
            message: `Resenha ID ${id} aprovada com sucesso.`, 
            review: approvedReview 
        });

    } catch (error) {
        if (error.code === 'P2025') { 
             return res.status(404).json({ error: "Resenha não encontrada para aprovação." });
        }
        console.error("Erro ao aprovar resenha:", error);
        res.status(500).json({ error: "Erro interno ao aprovar resenha." });
    }
};

// --- 5. GET /api/reviews/pending: Obter Resenhas Pendentes (REQUER ADMIN) ---
export const getPendingReviews = async (req, res) => {
    
    try {
        const pendingReviews = await prisma.review.findMany({
            where: {
                isApproved: false, // Busca apenas resenhas pendentes
            },
            include: { 
                author: { select: { name: true, email: true } },
                book: { select: { title: true } }
            },
            orderBy: { createdAt: 'asc' }, 
        });
        
        res.json(pendingReviews);
    } catch (error) {
        console.error("Erro ao obter resenhas pendentes:", error);
        res.status(500).json({ error: "Erro interno ao buscar resenhas pendentes." });
    }
};