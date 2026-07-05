import { useState } from 'react';
import API from '../services/api';

function Login({ setIsLogged, setPage }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [feedback, setFeedback] = useState('');
 const [loading, setLoading] = useState(false);

 const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    setFeedback('Por favor ingresa email y contraseña.');
    return;
  }
  setLoading(true);
  setFeedback('');

  try {
    const res = await API.post('/auth/login', {
      email,
      password
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    localStorage.setItem('name', res.data.name);
    setFeedback('');
    setIsLogged(true);
    setPage(res.data.role === 'admin' ? 'dashboard' : 'sales');
    window.dispatchEvent(new CustomEvent('notify', {
      detail: { type: 'success', message: 'Bienvenido de nuevo' }
    }));
  } catch (error) {
    const message = error.response?.data?.message || 'Error al iniciar sesión. Revisa tus credenciales.';
    setFeedback(message);
    window.dispatchEvent(new CustomEvent('notify', {
      detail: { type: 'error', message }
    }));
  } finally {
    setLoading(false);
  }
};

 return (
  <div className="flex items-center justify-center h-screen bg-gray-100">
   <div className="bg-white p-8 rounded shadow-md w-80">
    <h2 className="text-2xl font-bold mb-4 text-center">
     Iniciar Sesión
    </h2>

    <input
     type="email"
     value={email}
     className="border p-2 w-full mb-3 rounded"
     placeholder="Email"
     onChange={(e) => setEmail(e.target.value)}
    />

    <input
     type="password"
     value={password}
     className="border p-2 w-full mb-4 rounded"
     placeholder="Contraseña"
     onChange={(e) => setPassword(e.target.value)}
    />
    {feedback && (
     <div className="mb-4 text-red-600 text-center">
      {feedback}
     </div>
    )}
    <button
     type="button"
     disabled={loading}
     className={`w-full py-2 rounded font-semibold text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
     onClick={handleLogin}
    >
     {loading ? 'Ingresando...' : 'Ingresar'}
    </button>
   </div>
  </div>
 );
}

export default Login;