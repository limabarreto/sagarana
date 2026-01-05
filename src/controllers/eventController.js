// src/controllers/eventController.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// src/controllers/eventController.js (continue o arquivo)

// Cria um novo evento (APENAS ADMIN)
export const createEvent = async (req, res) => {
    // Pega o ID do usuário (ADMIN) do token JWT
    const submittedById = req.user.userId; 
    
    // Dados do corpo da requisição
    const { title, description, eventDate, location } = req.body;

    // Converte a data para o formato DateTime esperado pelo Prisma
    const parsedDate = new Date(eventDate);

    try {
        const newEvent = await prisma.event.create({
            data: {
                title,
                description,
                eventDate: parsedDate,
                location,
                submittedById, // ID do ADMIN que está criando o evento
                isApproved: false, // Começa sempre pendente
            },
        });

        res.status(201).json({
            message: "Evento submetido com sucesso. Aguardando aprovação.",
            event: newEvent,
        });
    } catch (error) {
        console.error("Erro ao criar evento:", error);
        res.status(500).json({ error: "Erro interno ao submeter o evento." });
    }
};

// src/controllers/eventController.js (continue o arquivo)

// Retorna todos os eventos APROVADOS (Listagem Pública)
export const getApprovedEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            where: { isApproved: true },
            orderBy: { eventDate: 'asc' }, // Ordena pelo evento mais próximo
            // Opcional: Incluir o nome do Admin que submeteu o evento
            include: { submittedBy: { select: { name: true } } } 
        });
        res.json(events);
    } catch (error) {
        console.error("Erro ao listar eventos aprovados:", error);
        res.status(500).json({ error: "Erro interno ao buscar eventos." });
    }
};

// Retorna o detalhe de um evento (Público, mas exige aprovação)
export const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: { submittedBy: { select: { name: true } } }
        });

        // Só retorna se existir e estiver aprovado
        if (!event || !event.isApproved) {
            return res.status(404).json({ error: "Evento não encontrado ou pendente de aprovação." });
        }
        
        res.json(event);
    } catch (error) {
        console.error("Erro ao buscar detalhe do evento:", error);
        res.status(500).json({ error: "Erro interno ao buscar detalhe do evento." });
    }
};

// src/controllers/eventController.js (continue o arquivo)

// Retorna todos os eventos PENDENTES (APENAS ADMIN)
export const getPendingEvents = async (req, res) => {
    try {
        const pendingEvents = await prisma.event.findMany({
            where: { isApproved: false },
            include: { submittedBy: { select: { name: true, email: true } } } // Inclui detalhes para moderação
        });
        res.json(pendingEvents);
    } catch (error) {
        console.error("Erro ao listar eventos pendentes:", error);
        res.status(500).json({ error: "Erro interno ao buscar eventos pendentes." });
    }
};

// Aprova um evento (PUT /api/events/:id/approve) (APENAS ADMIN)
export const approveEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const approvedEvent = await prisma.event.update({
            where: { id: parseInt(id) },
            data: { isApproved: true },
        });

        res.json({
            message: `Evento ID ${id} aprovado com sucesso e publicado no acervo.`,
            event: approvedEvent,
        });
    } catch (error) {
        console.error("Erro ao aprovar evento:", error);
        res.status(500).json({ error: "Erro interno ao aprovar evento. Verifique se o ID existe." });
    }
};