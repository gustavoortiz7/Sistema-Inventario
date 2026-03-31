import { useState } from 'react';
import API from '../services/api';

function Login() {
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
   alert('Login exitoso ');
  } catch (error) {
   console.error(error);
   console.error(error.response?.data);
   alert('Error en login');
  }
 };

 return (
  <div>
   <h2>Login</h2>

   <input
    type="email"
    placeholder="Email"
    onChange={(e) => setEmail(e.target.value)}
   />

   <input
    type="password"
    placeholder="Password"
    onChange={(e) => setPassword(e.target.value)}
   />

   <button onClick={handleLogin}>Login</button>
  </div>
 );
}

export default Login;