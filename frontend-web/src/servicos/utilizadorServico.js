// src/servicos/utilizadorServico.js
import apiClient from './api';

const utilizadorServico = {
  buscarTodos: async () => {
    try {
      const resposta = await apiClient.get('/utilizadores');
      return resposta.data;
    } catch (erro) {
      console.error('Erro ao buscar todos os utilizadores:', erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao buscar todos os utilizadores.');
    }
  },

  buscarUtilizadorPorId: async (idUtilizador) => {
    try {
      const resposta = await apiClient.get(`/utilizadores/${idUtilizador}`);
      return resposta.data;
    } catch (erro) {
      console.error(`Erro ao buscar utilizador ${idUtilizador}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao buscar detalhes do utilizador.');
    }
  },

  criarUtilizador: async (dadosUtilizador) => {
    try {
      const resposta = await apiClient.post('/utilizadores', dadosUtilizador);
      return resposta.data; 
    } catch (erro) {
      console.error('Erro ao criar utilizador:', erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao criar utilizador.');
    }
  },

  atualizarUtilizador: async (idUtilizador, dadosAtualizacao) => {
    try {
      const resposta = await apiClient.put(`/utilizadores/${idUtilizador}`, dadosAtualizacao);
      return resposta.data;
    } catch (erro) {
      console.error(`Erro ao atualizar utilizador ${idUtilizador}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao atualizar utilizador.');
    }
  },

  eliminarUtilizador: async (idUtilizador) => {
    try {
      await apiClient.delete(`/utilizadores/${idUtilizador}`);
      return true; 
    } catch (erro) {
      console.error(`Erro ao eliminar utilizador ${idUtilizador}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao eliminar utilizador.');
    }
  },

  alterarPalavraPasse: async (idUtilizador, dadosPalavraPasse) => {
    try {
      const resposta = await apiClient.patch(`/utilizadores/${idUtilizador}/palavra_passe`, dadosPalavraPasse);
      return resposta.data;
    } catch (erro) { // AQUI ESTAVA O ERRO, O TEXTO EXTRA FOI REMOVIDO
      console.error(`Erro ao alterar palavra-passe para utilizador ${idUtilizador}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao alterar palavra-passe.');
    }
  },

  buscarCompetenciasUtilizador: async (idUtilizador) => {
    try {
      const resposta = await apiClient.get(`/utilizadores/${idUtilizador}/competencias`);
      return resposta.data; // Array de objetos competência { id, nome }
    } catch (erro) {
      console.error(`Erro ao buscar competências para utilizador ${idUtilizador}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao buscar competências do utilizador.');
    }
  },

  adicionarCompetenciaUtilizador: async (idUtilizador, nomeCompetencia) => {
    // nomeCompetencia é uma string
    try {
      // O backend retorna a lista completa de competências do utilizador após adicionar
      const resposta = await apiClient.post(`/utilizadores/${idUtilizador}/competencias`, { competencia: nomeCompetencia });
      return resposta.data; 
    } catch (erro) {
      console.error(`Erro ao adicionar competência para utilizador ${idUtilizador}:`, erro.response?.data?.mensagem || erro.message);
      throw erro.response?.data || new Error('Erro ao adicionar competência.');
    }
  }
};

export default utilizadorServico;