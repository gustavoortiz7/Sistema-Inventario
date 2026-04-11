import { useState } from 'react';
import API from '../services/api';

function Login({ setIsLogged }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');

 const handleLogin = async () => {
  try {
   console.log(email, password);
   const res = await API.post('/auth/login', {
    email,
    password
   });

   localStorage.setItem('token', res.data.token);
   setIsLogged(true);
  } catch (error) {
   console.error(error);
   console.error(error.response?.data);
   alert('Error en login');
  }
 };

 return (
  <div className="flex items-center justify-center h-screen bg-gray-100">
   <div className="bg-white p-8 rounded shadow-md w-80">
    <h2 className="text-2xl font-bold mb-4 text-center">
     Iniciar Sesión
    </h2>

    <input
     className="border p-2 w-full mb-3 rounded"
     placeholder="Email"
     onChange={(e) => setEmail(e.target.value)}
    />

    <input
     type="password"
     className="border p-2 w-full mb-4 rounded"
     placeholder="Contraseña"
     onChange={(e) => setPassword(e.target.value)}
    />

    <button
     className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
     onClick={handleLogin}
    >
     Ingresar
    </button>
   </div>
  </div>
 );
}

export default Login;