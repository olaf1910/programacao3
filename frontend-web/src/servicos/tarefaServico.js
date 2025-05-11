// src/servicos/tarefaServico.js
import apiClient from './api';

const tarefaServico = {
  buscarTodasAsTarefas: async () => {
    try {
      const resposta = await apiClient.get('/tarefas');
      return resposta.data;
    } catch (erro) {
      console.error('Erro ao buscar tarefas:', erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao buscar tarefas.');
    }
  },

  criarTarefa: async (dadosNovaTarefa) => {
    try {
      const resposta = await apiClient.post('/tarefas', dadosNovaTarefa);
      return resposta.data;
    } catch (erro) {
      console.error('Erro ao criar tarefa:', erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao criar tarefa.');
    }
  },

  atualizarTarefa: async (idTarefa, dadosAtualizacao) => {
    // dadosAtualizacao = { descricao: "..." }
    try {
      const resposta = await apiClient.put(`/tarefas/${idTarefa}`, dadosAtualizacao);
      return resposta.data; // Retorna a tarefa atualizada
    } catch (erro) {
      console.error(`Erro ao atualizar tarefa ${idTarefa}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao atualizar tarefa.');
    }
  },

  eliminarTarefa: async (idTarefa) => {
    try {
      await apiClient.delete(`/tarefas/${idTarefa}`);
      return true; // Sucesso
    } catch (erro) {
      console.error(`Erro ao eliminar tarefa ${idTarefa}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao eliminar tarefa.');
    }
  },
};

export default tarefaServico;