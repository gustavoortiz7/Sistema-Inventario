import axios from 'axios';

const API = axios.create({
 baseURL: 'https://sistema-inventario-backend-1k6o.onrender.com/api'
});

// Interceptor para agregar el token de autenticación a cada solicitud
API.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 if (token) {
   config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
},
(error) => Promise.reject(error) );

export default API;