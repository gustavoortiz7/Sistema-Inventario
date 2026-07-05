import React, { useState, useEffect } from 'react';
import API from '../services/api';

function SalesCart({ cart, customers, onRemoveItem, onUpdateQuantity, onCheckout, onSaleComplete, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const computedTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * Number(item.quantity), 0);

  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      return;
    }

    const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId);
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name || '');
      setCustomerEmail(selectedCustomer.email || '');
      setCustomerPhone(selectedCustomer.phone || '');
    }
  }, [selectedCustomerId, customers]);

  const resetCustomerFields = () => {
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setNotes('');
    setPaymentMethod('efectivo');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'El carrito está vacío' } }));
      return;
    }

    setCheckoutLoading(true);

    const payload = {
      items: cart.map((item) => ({
        product: item.product._id,
        quantity: Number(item.quantity),
        price: Number(item.product.price),
        subtotal: Number(item.product.price) * Number(item.quantity)
      })),
      total: computedTotal,
      paymentMethod,
      customerId: selectedCustomerId || null,
      customer: {
        name: customerName || null,
        email: customerEmail || null,
        phone: customerPhone || null
      },
      notes: notes || null
    };

    try {
      const res = await API.post('/sales', payload);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Venta registrada exitosamente' } }));
      resetCustomerFields();
      onCheckout();
      if (onSaleComplete) onSaleComplete(res.data);
    } catch (error) {
      console.error('checkout error', error.response?.data || error.message);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al registrar la venta';
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">🛒 Carrito de Venta</h2>

      {cart.length === 0 ? (
        <div className="text-center py-8 text-gray-500">El carrito está vacío</div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto mb-4">
            <div className="space-y-3">
              {cart.map((item) => {
                const itemSubtotal = Number(item.product.price) * Number(item.quantity);
                return (
                  <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.product.name}</p>
                      <p className="text-sm text-gray-600">${Number(item.product.price).toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.product._id, parseInt(e.target.value, 10))}
                        className="w-14 border rounded px-2 py-1 text-center"
                      />
                      <span className="text-gray-800 font-semibold">${itemSubtotal.toFixed(2)}</span>
                      <button
                        onClick={() => onRemoveItem(item.product._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t-2 pt-4 mb-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">${computedTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Cliente nuevo / no seleccionado</option>
              {customers?.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
                </option>
              ))}
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="transferencia">🏦 Transferencia</option>
              <option value="qr">🔲 QR</option>
            </select>

            <input
              type="text"
              placeholder="Nombre del cliente (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg p-2"
            />

            <input
              type="email"
              placeholder="Email del cliente (opcional)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border rounded-lg p-2"
            />

            <input
              type="tel"
              placeholder="Teléfono del cliente (opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border rounded-lg p-2"
            />

            <textarea
              placeholder="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2"
              rows="3"
            />
          </div>

          <button
            disabled={loading || checkoutLoading || cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-lg font-bold text-white text-lg ${
              loading || checkoutLoading || cart.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading || checkoutLoading ? 'Procesando...' : `✓ Completar Venta - $${computedTotal.toFixed(2)}`}
          </button>
        </>
      )}
    </div>
  );
}

export default SalesCart;
