import express from 'express'; // responsável por criar o servidor, definir rotas e lidar com requisições HTTP
import cors from 'cors'; // permite que o front-end (ou outros clientes) façam requisições ao servidor mesmo que estejam em domínios diferentes
import dotenv from 'dotenv'; // carrega variáveis de ambiente do arquivo .env, permitindo configurar portas, URLs e senhas sem expor no código

import userRoutes from './src/routes/userRoutes.js'; // importa as rotas relacionadas aos usuários, como registro, login e listagem

dotenv.config(); // carrega todas as variáveis definidas no arquivo .env, permitindo acesso via process.env e mantendo o projeto seguro e flexível


const app = express(); // cria a instância do servidor usando express()
const PORT = process.env.PORT || 3000; // define a porta do servidor. Se PORT não existir no .env, usa 3000 por padrão, garantindo funcionamento local


app.use(cors()); // libera o acesso externo à API, permitindo que front-ends ou outros serviços consumam as rotas
app.use(express.json()); // permite que o servidor entenda e processe dados enviados em JSON, formato padrão das APIs modernas


// rota raiz (/) apenas para teste, útil para verificar se o servidor está funcionando antes de implementar funcionalidades mais complexas
app.get('/', (req, res) => {
   res.send({ 
        message: `Bem-vindo à API Sagarana - Ambiente: ${NODE_ENV}`, 
        version: '1.0.0'
    });
});


// registra as rotas de usuário no caminho /api/users
// isso significa que qualquer rota definida em userRoutes será acessada começando por /api/users
app.use('/api/users', userRoutes); 


// inicia o servidor e o coloca para "escutar" a porta definida. A mensagem no console confirma o funcionamento
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
