import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomers();
  }, []);

  const getCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/customers');
      setCustomers(res.data || []);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al cargar clientes' } }));
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateCustomer = async () => {
    if (!name.trim()) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'El nombre es requerido' } }));
      return;
    }

    setSaving(true);
    try {
      const payload = { name, email, phone, address, city, notes };

      if (editingCustomer) {
        await API.put(`/customers/${editingCustomer._id}`, payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Cliente actualizado' } }));
      } else {
        await API.post('/customers', payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Cliente creado' } }));
      }

      resetForm();
      getCustomers();
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al guardar cliente' } }));
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await API.delete(`/customers/${id}`);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Cliente eliminado' } }));
      getCustomers();
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al eliminar cliente' } }));
    } finally {
      setConfirmDelete(null);
    }
  };

  const editCustomer = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    setCity(customer.city || '');
    setNotes(customer.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setNotes('');
    setEditingCustomer(null);
    setShowForm(false);
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(q) ||
      (customer.email && customer.email.toLowerCase().includes(q)) ||
      (customer.phone && customer.phone.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <Loader size={24} />}

      <h2 className="text-3xl font-bold mb-6 text-center">👥 Gestión de Clientes</h2>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Crear / Editar Cliente</h3>
            {showForm && (
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            )}
          </div>

          {showForm && (
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
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded p-2"
              />
              <textarea
                placeholder="Notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full border rounded p-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={createOrUpdateCustomer}
                  disabled={saving}
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saving ? (editingCustomer ? 'Actualizando...' : 'Creando...') : (editingCustomer ? 'Actualizar' : 'Crear')}&nbsp;Cliente
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              + Nuevo Cliente
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay clientes</p>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{customer.name}</p>
                      {customer.email && <p className="text-sm text-gray-600">📧 {customer.email}</p>}
                      {customer.phone && <p className="text-sm text-gray-600">📱 {customer.phone}</p>}
                      {customer.address && <p className="text-sm text-gray-600">📍 {customer.address}</p>}
                      {customer.city && <p className="text-sm text-gray-600">🏙️ {customer.city}</p>}
                      {customer.notes && <p className="text-sm text-gray-600 mt-2">📝 {customer.notes}</p>}
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => editCustomer(customer)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setConfirmDelete(customer)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          open={true}
          title="Eliminar cliente"
          message={`¿Eliminar ${confirmDelete.name}?`}
          onConfirm={() => deleteCustomer(confirmDelete._id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default Customers;
