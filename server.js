import express from 'express'; //responsável por criar o servidor, definir rotas e lidar com requisições HTTP
import cors from 'cors'; // permite que seu front-end (ou outros clientes) façam requisições para o seu servidor mesmo que estejam em domínios diferentes
import dotenv from 'dotenv'; //permite carregar variáveis de ambiente de um arquivo .env, você não quer colocar senhas, portas ou URLs de banco direto no código. Com dotenv, você coloca no .env e acessa via process.env.

dotenv.config(); //esta linha carrega as variáveis de ambiente definidas no arquivo .env, como a porta do servidor (PORT=3000). Com isso, podemos alterar configurações importantes sem precisar mexer no código, mantendo o projeto flexível e seguro.


const app = express(); //aqui criamos a instância do servidor com express()
const PORT = process.env.PORT || 3000; //e definimos a porta em que ele vai “ouvir” as requisições. Caso a variável PORT não esteja definida no .env, usamos 3000 como padrão. Isso garante que o servidor sempre tenha uma porta disponível para rodar localmente ou em produção.


app.use(cors()); 
app.use(express.json()); //configuram middlewares globais para o servidor. O cors() libera requisições externas para que front-end ou outras aplicações consigam se comunicar sem bloqueios, e o express.json() permite que o servidor interprete dados enviados no formato JSON, que é o padrão em APIs modernas.


app.get('/', (req, res) => {
  res.send({ message: 'Servidor do Sagarana rodando 🚀' });
}); //criamos uma rota raiz (/) que responde com uma mensagem simples de teste. Essa rota serve para verificar se o servidor está ativo e funcionando corretamente antes de adicionarmos rotas mais complexas de usuários, livros, resenhas e eventos.


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); //finalmente, iniciamos o servidor com app.listen(). Ele fica “ouvindo” a porta definida e pronto para processar requisições. A mensagem no console confirma que tudo está funcionando, e o Sagarana já pode receber futuras funcionalidades
