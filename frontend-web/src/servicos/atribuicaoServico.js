// src/servicos/atribuicaoServico.js
import apiClient from './api';

const atribuicaoServico = {
  atribuirTarefa: async (dadosAtribuicao) => {
    // dadosAtribuicao = { tarefa_id: X, atribuido_a: Y (ID do programador) }
    try {
      const resposta = await apiClient.post('/atribuicoes', dadosAtribuicao);
      return resposta.data;
    } catch (erro) {
      console.error('Erro ao atribuir tarefa:', erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao atribuir tarefa.');
    }
  },

  atualizarProgressoAtribuicao: async (idAtribuicao, dadosProgresso) => {
    // dadosProgresso = { inicio: "YYYY-MM-DDTHH:mm:ssZ" } ou { fim: "YYYY-MM-DDTHH:mm:ssZ" }
    // ou { inicio: "...", fim: "..." } se a API permitir ambos de uma vez
    try {
      const resposta = await apiClient.patch(`/atribuicoes/${idAtribuicao}`, dadosProgresso);
      return resposta.data; // Retorna a tarefa atualizada (conforme sua API)
    } catch (erro) {
      console.error(`Erro ao atualizar progresso da atribuição ${idAtribuicao}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao atualizar progresso da atribuição.');
    }
  },
};

export default atribuicaoServico;