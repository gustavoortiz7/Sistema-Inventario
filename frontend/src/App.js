import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Products from './pages/Products';
import History from './pages/History';
import Sales from './pages/Sales';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import RequireAuth from './components/RequireAuth';


function App() {
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState(() => {
    const role = localStorage.getItem('role');
    return role === 'admin' ? 'dashboard' : 'sales';
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLogged(false);
    }

    const handleExternalLogout = () => {
      setIsLogged(false);
      setPage('dashboard');
    };

    window.addEventListener('logout', handleExternalLogout);
    return () => window.removeEventListener('logout', handleExternalLogout);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (!isLogged) {
    return <Login setIsLogged={setIsLogged} setPage={setPage} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Notifications />
      <Sidebar page={page} setPage={handlePageChange} setIsLogged={setIsLogged} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Bienvenido al Sistema de Inventario</h1>

          {page === 'products' && (
            <RequireAuth>
              <Products setPage={setPage} />
            </RequireAuth>
          )}
          {page === 'sales' && (
            <RequireAuth>
              <Sales />
            </RequireAuth>
          )}
          {page === 'categories' && (
            <RequireAuth allowedRoles={["admin"]}>
              <Categories />
            </RequireAuth>
          )}
          {page === 'customers' && (
            <RequireAuth>
              <Customers />
            </RequireAuth>
          )}
          {page === 'employees' && (
            <RequireAuth allowedRoles={["admin"]}>
              <Employees />
            </RequireAuth>
          )}
          {page === 'reports' && (
            <RequireAuth allowedRoles={["admin"]}>
              <Reports />
            </RequireAuth>
          )}
          {page === 'history' && (
            <RequireAuth>
              <History />
            </RequireAuth>
          )}
          {page === 'dashboard' && (
            <RequireAuth allowedRoles={["admin"]}>
              <Dashboard setPage={setPage} />
            </RequireAuth>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
