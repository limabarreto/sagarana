// src/controllers/commentController.js

import prisma from '../config/prismaClient.cjs';

// --- 1. POST /api/comments: Criar Novo Comentário ou Resposta (REQUER LOGIN) ---
export const createComment = async (req, res) => {
    // ID do autor injetado pelo authenticateToken
    const authorId = req.user.userId; 
    
    // reviewId: A resenha à qual o comentário pertence (OBRIGATÓRIO).
    // parentId: O ID do comentário pai (OPCIONAL, se for uma resposta).
    const { content, reviewId, parentId } = req.body;

    if (!content || !reviewId) {
        return res.status(400).json({ error: "Conteúdo e o ID da resenha são obrigatórios." });
    }

    try {
        // Opcional: Verificar se a Review existe e está APROVADA antes de comentar
        const review = await prisma.review.findUnique({ where: { id: parseInt(reviewId) } });
        if (!review || !review.isApproved) {
            return res.status(404).json({ error: "Não é possível comentar. Resenha não encontrada ou não aprovada." });
        }

        const newComment = await prisma.comment.create({
            data: {
                content, 
                authorId,
                reviewId: parseInt(reviewId),
                // LÓGICA ANINHADA: parentId será null se for um comentário principal
                parentId: parentId ? parseInt(parentId) : null, 
            },
            include: { author: { select: { name: true } } }
        });

        res.status(201).json({ 
            message: parentId ? "Resposta criada com sucesso." : "Comentário criado com sucesso.", 
            comment: newComment 
        });
        
    } catch (error) {
        console.error("Erro ao criar comentário/resposta:", error);
        res.status(500).json({ error: "Erro interno ao criar comentário." });
    }
};

// src/controllers/commentController.js (Trecho Adicional/Final)

// [...] (Código anterior: Imports, createComment)

// --- Função Auxiliar: Reconstroi a Árvore de Comentários (Recursão) ---
const nestComments = (comments, parentId = null) => {
    // 1. Filtra os comentários que pertencem ao parentId atual (incluindo null para o topo)
    const filteredComments = comments.filter(comment => comment.parentId === parentId);

    // 2. Mapeia e constrói o objeto recursivamente
    return filteredComments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author, // Incluído na busca do Prisma
        createdAt: comment.createdAt,
        // Chama a função novamente, usando o ID do comentário atual como parentId para buscar as respostas
        replies: nestComments(comments, comment.id)
    }));
};


// --- 2. GET /api/comments/:reviewId: Listar Comentários por Resenha (PÚBLICA) ---
export const getCommentsByReviewId = async (req, res) => {
    const { reviewId } = req.params;

    try {
        // Busca TODOS os comentários de uma Review
        const allComments = await prisma.comment.findMany({
            where: { reviewId: parseInt(reviewId) },
            // Inclui o nome do autor
            include: { author: { select: { name: true } } }, 
            orderBy: { createdAt: 'asc' }, 
        });

        // Organiza a lista plana em hierarquia usando a função auxiliar
        const nestedComments = nestComments(allComments);
        
        res.json(nestedComments);
    } catch (error) {
        console.error("Erro ao obter comentários:", error);
        res.status(500).json({ error: "Erro interno ao buscar comentários." });
    }
};