// src/servicos/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // A sua URL base do backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT a cada requisição, se disponível
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ou de onde quer que guarde o token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;