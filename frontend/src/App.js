import {useState} from 'react';
import Login from './pages/Login';
import Products from './pages/Products';
import History from './pages/History';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [page, setPage] = useState('products');

  if (!isLogged){ 
    return <Login setIsLogged={setIsLogged} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="w-full max-w-4xl">
      <div className="p-4 bg-gray-800 text-white rounded">
        <h1 className = "text-3xl font-bold text-blue-600 text-center mb-4">Bienvenido al Sistema de Inventario </h1>
        <div className="flex justify-between">
            <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={() => setPage('products')}>Productos</button>
            <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={() => setPage('history')}>Historial</button>
        </div>
      </div>
      {page === 'products' ? <Products /> : <History />}
    </div>
    </div>

  );
}

export default App;
