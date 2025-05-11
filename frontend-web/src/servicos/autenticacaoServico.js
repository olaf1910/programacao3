// src/servicos/autenticacaoServico.js
import apiClient from './api';

const servicoAutenticacao = {
  login: async (credenciais) => {
    try {
      const resposta = await apiClient.post('/utilizadores/login', credenciais);
      return resposta.data; // Espera-se que retorne { token: "seu_jwt_token" }
    } catch (erro) {
      // O apiClient do axios já lança um erro para status codes não 2xx
      // Podemos re-lançar o erro para ser tratado no componente
      // ou tratar especificamente aqui e retornar uma estrutura de erro.
      // Por agora, vamos assumir que o componente tratará o erro.
      console.error('Erro no login:', erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao tentar fazer login.');
    }
  },

  // Poderíamos adicionar aqui funções de logout, registo, etc.
  // logout: () => {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('utilizador'); // Se guardar dados do utilizador
  //   // Lógica adicional se necessário (ex: redirecionar, notificar backend)
  // },
};

export default servicoAutenticacao;