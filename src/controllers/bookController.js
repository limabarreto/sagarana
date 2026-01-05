
import prisma from '../config/prismaClient.cjs';
import { UserRole } from '@prisma/client'; 

export const getApprovedBooks = async (req, res) => {
    const itemType = req.query.type; 
    const search = req.query.search; 

    try {
        const books = await prisma.book.findMany({
            where: {
                isApproved: true, 
                ...(itemType && { itemType }), 
                ...(search && { 
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { author: { contains: search, mode: 'insensitive' } },
                        { synopsis: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: { submittedBy: { select: { name: true } } }, 
            orderBy: { createdAt: 'desc' }, 
        });
        
        res.json(books);
    } catch (error) {
        console.error("Erro ao obter catálogo:", error);
        res.status(500).json({ error: "Erro interno ao buscar livros." });
    }
};

export const getBookById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const book = await prisma.book.findUnique({
            where: { 
                id: parseInt(id) 
            },
            include: { 
                submittedBy: { 
                    select: { 
                        name: true 
                    } 
                },
                
                
                reviews: { 
                    where: { 
                        isApproved: true 
                    },
                    
                    include: {
                        author: {
                            select: {
                                name: true 
                            }
                        }
                    } 
                } 
            }
        });

        if (!book || !book.isApproved) {
            return res.status(404).json({ error: "Item de catálogo não encontrado ou pendente de aprovação." });
        }
        
        res.json(book);
    } catch (error) {
        console.error("Erro ao obter detalhe do item:", error);
        res.status(500).json({ error: "Erro interno ao buscar detalhe do item." });
    }
};


export const submitNewBook = async (req, res) => {
    const submittedById = req.user.userId; 
    const { title, author, isbn, publisher, pages, language, synopsis, itemType } = req.body;

    if (!title || !author || !synopsis) {
        return res.status(400).json({ error: "Título, autor e sinopse são obrigatórios para a submissão." });
    }

    try {
        const newBook = await prisma.book.create({
            data: {
                title, author, synopsis, 
                isbn: isbn || null, 
                publisher: publisher || null, 
                pages: pages ? parseInt(pages) : null, 
                language: language || 'Português', 
                itemType: itemType || "BOOK",
                submittedById, 
                isApproved: false, 
            },
        });

        res.status(201).json({ 
            message: "Item submetido para moderação. Será visível após aprovação.", 
            book: newBook 
        });
        
    } catch (error) {
        if (error.code === 'P2002') { 
            return res.status(409).json({ error: "O ISBN ou campo único informado já existe no catálogo." });
        }
        console.error("Erro na submissão do item:", error);
        res.status(500).json({ error: "Erro interno ao submeter item." });
    }
};


export const approveBook = async (req, res) => {
    const { id } = req.params; 
    
    try {
        const approvedBook = await prisma.book.update({
            where: { id: parseInt(id) },
            data: { isApproved: true }, 
        });

        res.json({ 
            message: `Item ID ${id} aprovado com sucesso.`, 
            book: approvedBook 
        });

    } catch (error) {
        if (error.code === 'P2025') { 
             return res.status(404).json({ error: "Item de catálogo não encontrado para aprovação." });
        }
        console.error("Erro ao aprovar item:", error);
        res.status(500).json({ error: "Erro interno ao aprovar item." });
    }
};

export const getPendingBooks = async (req, res) => {
    
    try {
        const pendingBooks = await prisma.book.findMany({
            where: {
                isApproved: false, 
            },
            include: { submittedBy: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'asc' }, 
        });
        
        res.json(pendingBooks);
    } catch (error) {
        console.error("Erro ao obter itens pendentes:", error);
        res.status(500).json({ error: "Erro interno ao buscar itens pendentes." });
    }
};