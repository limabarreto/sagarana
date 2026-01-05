// src/controllers/eventController.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEvent = async (req, res) => {
    const submittedById = req.user.userId; 
    
    const { title, description, eventDate, location } = req.body;

    const parsedDate = new Date(eventDate);

    try {
        const newEvent = await prisma.event.create({
            data: {
                title,
                description,
                eventDate: parsedDate,
                location,
                submittedById, 
                isApproved: false, 
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

export const getApprovedEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            where: { isApproved: true },
            orderBy: { eventDate: 'asc' }, 
            include: { submittedBy: { select: { name: true } } } 
        });
        res.json(events);
    } catch (error) {
        console.error("Erro ao listar eventos aprovados:", error);
        res.status(500).json({ error: "Erro interno ao buscar eventos." });
    }
};


export const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: { submittedBy: { select: { name: true } } }
        });


        if (!event || !event.isApproved) {
            return res.status(404).json({ error: "Evento não encontrado ou pendente de aprovação." });
        }
        
        res.json(event);
    } catch (error) {
        console.error("Erro ao buscar detalhe do evento:", error);
        res.status(500).json({ error: "Erro interno ao buscar detalhe do evento." });
    }
};


export const getPendingEvents = async (req, res) => {
    try {
        const pendingEvents = await prisma.event.findMany({
            where: { isApproved: false },
            include: { submittedBy: { select: { name: true, email: true } } } 
        });
        res.json(pendingEvents);
    } catch (error) {
        console.error("Erro ao listar eventos pendentes:", error);
        res.status(500).json({ error: "Erro interno ao buscar eventos pendentes." });
    }
};

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