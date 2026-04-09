import {useState} from 'react';
import Login from './pages/Login';
import Products from './pages/Products';

function App() {
  const [isLogged, setIsLogged] = useState(
    !!localStorage.getItem('token')
  );
  return (
    <div>
      {isLogged ? <Products /> : <Login />}
    </div>
  );
}

export default App;
