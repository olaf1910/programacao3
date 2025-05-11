// src/rotas/RotaAdminProtegida.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

const RotaAdminProtegida = ({ children }) => {
  const { estaAutenticado, funcaoUtilizador, aCarregarAutenticacao } = useAuth();
  const location = useLocation();

  if (aCarregarAutenticacao) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        A verificar autenticação...
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (funcaoUtilizador !== 'admin') {
    // Redireciona para uma página "Não Autorizado" ou para a página inicial
    // Por simplicidade, vamos redirecionar para a página inicial
    console.warn("Acesso negado: Rota apenas para administradores.");
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default RotaAdminProtegida;