import React from 'react';
import { Link } from 'react-router-dom';

const PaginaNaoEncontrada = () => {
  return (
    <div>
      <h2>Erro 404: Página Não Encontrada</h2>
      <p>Lamentamos, mas a página que procurou não existe.</p>
      <Link to="/">Voltar à Página Inicial</Link>
    </div>
  );
};

export default PaginaNaoEncontrada;