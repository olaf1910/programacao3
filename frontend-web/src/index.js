// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // O seu CSS global, se houver
import App from './App';
import { AuthProvider } from './contextos/AuthContext'; // Importar o AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Envolver App com AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);