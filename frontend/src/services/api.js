import axios from 'axios';

const API = axios.create({
 baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
 //baseURL: 'https://sistema-inventario-backend-1k6o.onrender.com/api'
});

// Interceptor para agregar el token de autenticación a cada solicitud
API.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 config.headers = config.headers || {};
 if (token) {
   config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
},
(error) => Promise.reject(error));

API.interceptors.response.use(
 (response) => response,
 (error) => {
   if (error.response?.status === 401) {
     localStorage.removeItem('token');
     localStorage.removeItem('role');
     localStorage.removeItem('name');
     window.dispatchEvent(new Event('logout'));
     window.dispatchEvent(new CustomEvent('notify', {
       detail: { type: 'error', message: 'Sesión expirada. Inicia sesión de nuevo.' }
     }));
   }
   return Promise.reject(error);
 }
);

export default API;
