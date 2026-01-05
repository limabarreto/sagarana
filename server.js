// server.js (VERSÃO FINAL)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importa o módulo principal de autenticação (userRoutes)
import userRoutes from './src/routes/userRoutes.js'; 
import bookRoutes from './src/routes/bookRoutes.js'; 
import reviewRoutes from './src/routes/reviewRoutes.js'; 
import commentRoutes from './src/routes/commentRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';

// 1. Configuração Inicial e Carregamento de Variáveis de Ambiente
dotenv.config(); // Carrega variáveis do .env

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 2. Configuração de Middleware Global
app.use(cors()); 
app.use(express.json());

// 3. Rotas da API
app.get('/', (req, res) => {
    res.send({ 
        message: `Bem-vindo à API Sagarana - Ambiente: ${NODE_ENV}`, 
        version: '1.0.0'
    });
});
app.post('/teste', (req, res) => res.json({ ok: true }));


app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes); 
app.use('/api/reviews', reviewRoutes); 
app.use('/api/comments', commentRoutes);
app.use('/api/events', eventRoutes);
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint não encontrado.' });
});

app.listen(PORT, () => {
    console.log(`| Servidor Sagarana rodando: http://localhost:${PORT}`);
});