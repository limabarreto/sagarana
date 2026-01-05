// src/controllers/commentController.js

import prisma from '../config/prismaClient.cjs';

export const createComment = async (req, res) => {
    const authorId = req.user.userId; 
  
    const { content, reviewId, parentId } = req.body;

    if (!content || !reviewId) {
        return res.status(400).json({ error: "Conteúdo e o ID da resenha são obrigatórios." });
    }

    try {
    
        const review = await prisma.review.findUnique({ where: { id: parseInt(reviewId) } });
        if (!review || !review.isApproved) {
            return res.status(404).json({ error: "Não é possível comentar. Resenha não encontrada ou não aprovada." });
        }

        const newComment = await prisma.comment.create({
            data: {
                content, 
                authorId,
                reviewId: parseInt(reviewId),
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


const nestComments = (comments, parentId = null) => {
    const filteredComments = comments.filter(comment => comment.parentId === parentId);

    return filteredComments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author, 
        createdAt: comment.createdAt,
        replies: nestComments(comments, comment.id)
    }));
};



export const getCommentsByReviewId = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const allComments = await prisma.comment.findMany({
            where: { reviewId: parseInt(reviewId) },
            // Inclui o nome do autor
            include: { author: { select: { name: true } } }, 
            orderBy: { createdAt: 'asc' }, 
        });


        const nestedComments = nestComments(allComments);
        
        res.json(nestedComments);
    } catch (error) {
        console.error("Erro ao obter comentários:", error);
        res.status(500).json({ error: "Erro interno ao buscar comentários." });
    }
};