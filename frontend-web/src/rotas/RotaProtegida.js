// src/rotas/RotaProtegida.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

const RotaProtegida = ({ children }) => {
  const { estaAutenticado, aCarregarAutenticacao } = useAuth();
  const location = useLocation();

  if (aCarregarAutenticacao) {
    // Pode mostrar um spinner/indicador de carregamento aqui
    // enquanto o estado de autenticação inicial está a ser verificado
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        A verificar autenticação...
      </div>
    );
  }

  if (!estaAutenticado) {
    // Redireciona para a página de login, guardando a localização atual
    // para que possamos redirecionar de volta após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Renderiza o componente filho se estiver autenticado
};

export default RotaProtegida;