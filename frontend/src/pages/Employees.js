import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const myRole = localStorage.getItem('role');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users');
      setEmployees(res.data || []);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al cargar empleados' } }));
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myRole === 'admin') {
      fetchEmployees();
    }
  }, [myRole]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setEditingEmployee(null);
    setShowForm(false);
  };

  const createOrUpdateEmployee = async () => {
    if (!name.trim() || !email.trim() || (!editingEmployee && !password.trim())) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Nombre, email y contrasena son requeridos' } }));
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      role,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      if (editingEmployee) {
        await API.put(`/users/${editingEmployee._id}`, payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Empleado actualizado' } }));
      } else {
        await API.post('/users', payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Empleado creado' } }));
      }
      resetForm();
      fetchEmployees();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al guardar empleado';
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    }
  };

  const editEmployee = (employee) => {
    setEditingEmployee(employee);
    setName(employee.name);
    setEmail(employee.email);
    setRole(employee.role || 'user');
    setPassword('');
    setShowForm(true);
  };

  const deleteEmployee = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Empleado eliminado' } }));
      fetchEmployees();
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al eliminar empleado' } }));
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      employee.name.toLowerCase().includes(q) ||
      employee.email.toLowerCase().includes(q) ||
      employee.role.toLowerCase().includes(q)
    );
  });

  if (myRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-red-600">
            <h2 className="text-xl font-semibold">No autorizado</h2>
            <p className="mt-2">Esta seccion esta restringida a administradores.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <Loader size={24} />}

      <h2 className="text-3xl font-bold mb-6 text-center">Gestion de Empleados</h2>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Crear / Editar Empleado</h3>
              <p className="text-sm text-gray-500">Solo el administrador puede registrar y editar empleados.</p>
            </div>
            {showForm && (
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">x</button>
            )}
          </div>

          {showForm ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded p-2"
              />
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded p-2"
              />
              <input
                type="password"
                placeholder={editingEmployee ? 'Contrasena (dejar en blanco para no cambiar)' : 'Contrasena *'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded p-2"
              />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded p-2">
                <option value="user">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={createOrUpdateEmployee}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
                </button>
                <button onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              + Nuevo Empleado
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-lg">Listado de Empleados</h3>
              <p className="text-sm text-gray-500">Gestiona los accesos de la tienda.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded p-2 w-full md:w-72"
              placeholder="Buscar por nombre, email o rol..."
            />
          </div>

          {filteredEmployees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay empleados registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Nombre</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Rol</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Creado</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{employee.name}</td>
                      <td className="px-4 py-3">{employee.email}</td>
                      <td className="px-4 py-3 capitalize">{employee.role}</td>
                      <td className="px-4 py-3">{new Date(employee.createdAt).toLocaleDateString('es-ES')}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => editEmployee(employee)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(employee)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar empleado"
          message={`Eliminar a ${confirmDelete.name}?`}
          onConfirm={() => deleteEmployee(confirmDelete._id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default Employees;
