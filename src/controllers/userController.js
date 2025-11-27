// userController.js — responsável por centralizar toda a lógica relacionada aos usuários
// Cada função aqui responde a uma rota específica e contém a "inteligência" do que deve acontecer

export const getAllUsers = (req, res) => {
  // Esta função será executada quando a rota para listar usuários for acessada.
  // Por enquanto, estamos retornando dados estáticos apenas para testar o fluxo
  // entre rota → controller → resposta.

  res.status(200).json({
    message: 'Lista de usuários retornada com sucesso!',
    users: [
      { id: 1, nome: 'João' },
      { id: 2, nome: 'Maria' }
    ]
  });
};
