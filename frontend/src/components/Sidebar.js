import React from 'react';

function Sidebar({ page, setPage, setIsLogged }) {
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setIsLogged(false);
  };

  const name = localStorage.getItem('name') || 'Usuario';

  return (
    <aside className="w-72 bg-white h-screen border-r p-6 sticky top-0 shadow-sm">
      <div className="mb-6 flex flex-col">
        <h1 className="text-2xl font-bold text-blue-600">Inventario</h1>
        <p className="text-sm text-gray-500">Panel de control</p>
        <div className="mt-4 py-2 px-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-700">Hola,</div>
          <div className="font-semibold">{name}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <button
          onClick={() => setPage('products')}
          className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'products' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
          <span>📦</span>
          <span>Productos</span>
        </button>

        <button
          onClick={() => setPage('sales')}
          className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'sales' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
          <span>🛒</span>
          <span>Punto de Venta</span>
        </button>

        {role === 'admin' && (
          <button
            onClick={() => setPage('categories')}
            className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'categories' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
            <span>📁</span>
            <span>Categorías</span>
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setPage('dashboard')}
            className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'dashboard' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
            <span>📊</span>
            <span>Dashboard</span>
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setPage('reports')}
            className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'reports' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
            <span>📈</span>
            <span>Reportes</span>
          </button>
        )}

        <button
          onClick={() => setPage('customers')}
          className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'customers' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
          <span>👤</span>
          <span>Clientes</span>
        </button>

        <button
          onClick={() => setPage('history')}
          className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'history' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
          <span>📜</span>
          <span>Historial</span>
        </button>

        {role === 'admin' && (
          <button
            onClick={() => setPage('employees')}
            className={`text-left px-4 py-2 rounded flex items-center gap-3 ${page === 'employees' ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}>
            <span>👥</span>
            <span>Empleados</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="text-left px-4 py-2 rounded hover:bg-red-50 text-red-600 mt-6 flex items-center gap-3">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
