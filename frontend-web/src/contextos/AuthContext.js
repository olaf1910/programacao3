// src/contextos/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import servicoAutenticacao from '../servicos/autenticacaoServico'; // Ajuste o caminho se necessário
import { jwtDecode } from 'jwt-decode';

// Certifique-se de que instalou: npm install jwt-decode

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [utilizadorAtual, setUtilizadorAtual] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [aCarregarAutenticacao, setACarregarAutenticacao] = useState(true); // Renomeado para maior clareza

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    if (tokenGuardado) {
      try {
        const utilizadorDescodificado = jwtDecode(tokenGuardado);
        const agoraEmSegundos = Date.now() / 1000;

        if (utilizadorDescodificado.exp && utilizadorDescodificado.exp < agoraEmSegundos) {
          console.warn("Token JWT expirado.");
          localStorage.removeItem('token');
          setUtilizadorAtual(null);
          setToken(null);
        } else {
          setUtilizadorAtual(utilizadorDescodificado); // Contém utilizador_id, funcao
          setToken(tokenGuardado);
        }
      } catch (error) {
        console.error("Erro ao descodificar token JWT ou token inválido:", error);
        localStorage.removeItem('token');
        setUtilizadorAtual(null);
        setToken(null);
      }
    }
    setACarregarAutenticacao(false);
  }, []);

  const login = async (credenciais) => {
    try {
      const dados = await servicoAutenticacao.login(credenciais);
      if (dados.token) {
        localStorage.setItem('token', dados.token);
        const utilizadorDescodificado = jwtDecode(dados.token);
        setUtilizadorAtual(utilizadorDescodificado);
        setToken(dados.token);
        return utilizadorDescodificado;
      } else {
        // Esta condição pode não ser alcançada se o backend sempre retornar erro para login falhado
        throw new Error(dados.mensagem || "Token de autenticação não foi recebido.");
      }
    } catch (erro) {
      console.error("Falha no login (AuthProvider):", erro);
      setUtilizadorAtual(null);
      setToken(null);
      localStorage.removeItem('token');
      throw erro; // Re-lança para ser tratado na PaginaLogin ou outro chamador
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUtilizadorAtual(null);
    setToken(null);
    // Opcional: redirecionar para a página de login ou inicial
    // Se usar react-router, pode precisar de 'useNavigate' aqui, ou
    // o componente que chama logout pode tratar do redirecionamento.
    // Exemplo: window.location.href = '/login'; (menos ideal que useNavigate)
    console.log("Utilizador desautenticado.");
  };

  const valor = {
    utilizadorAtual,
    token,
    estaAutenticado: !!token && !!utilizadorAtual, // Mais robusto: verificar token E utilizadorAtual
    funcaoUtilizador: utilizadorAtual?.funcao,
    idUtilizador: utilizadorAtual?.utilizador_id, // Adicionado para conveniência
    login,
    logout,
    aCarregarAutenticacao
  };

  return (
    <AuthContext.Provider value={valor}>
      {/* Renderiza children apenas quando o carregamento inicial da autenticação estiver concluído */}
      {!aCarregarAutenticacao && children}
      {/* Pode adicionar um ecrã de carregamento global aqui se aCarregarAutenticacao for true */}
      {aCarregarAutenticacao && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          A carregar aplicação...
        </div>
      )}
    </AuthContext.Provider>
  );
};