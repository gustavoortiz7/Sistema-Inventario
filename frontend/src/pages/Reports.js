import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import API from '../services/api';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

function Reports() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState({});
  const role = localStorage.getItem('role');
  const [confirmAction, setConfirmAction] = useState({ open: false, type: '', sale: null });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getSales();
  }, []);

  const getSales = async () => {
    setLoading(true);
    try {
      const res = await API.get('/sales');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.sales)
        ? res.data.sales
        : [];
      const normalized = data.map((s) => ({ ...s, total: Number(s.total) || 0 }));
      setSales(normalized);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al cargar ventas' } }));
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredSales = sales.filter((sale) => {
    if (filterPaymentMethod !== 'all' && sale.paymentMethod !== filterPaymentMethod) return false;
    if (customerFilter !== 'all') {
      const customerName = sale.customerId?.name || sale.customer?.name || 'Anónimo';
      if (customerName !== customerFilter) return false;
    }
    
    const saleDate = new Date(sale.createdAt);
    if (dateFrom) {
      const start = new Date(dateFrom + 'T00:00:00');
      if (saleDate < start) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo + 'T23:59:59.999');
      if (saleDate > end) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const customerName = (sale.customerId?.name || sale.customer?.name || 'Anónimo').toLowerCase();
      const paymentMethod = (sale.paymentMethod || 'efectivo').toLowerCase();
      const status = (sale.status || 'completada').toLowerCase();
      if (!customerName.includes(q) && !paymentMethod.includes(q) && !status.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const avgSale = totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0;

  const uniqueCustomerNames = Array.from(
    new Set(
      sales
        .map((sale) => sale.customerId?.name || sale.customer?.name)
        .filter(Boolean)
    )
  );

  const paymentMethodStats = {};
  filteredSales.forEach((sale) => {
    const method = sale.paymentMethod || 'efectivo';
    paymentMethodStats[method] = (paymentMethodStats[method] || 0) + 1;
  });

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const margin = 40;
    let cursor = 40;

    doc.setFontSize(18);
    doc.setTextColor('#1d4ed8');
    doc.text('Reporte de Ventas', margin, cursor);

    doc.setFontSize(10);
    doc.setTextColor('#374151');
    cursor += 20;
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, margin, cursor);

    cursor += 30;
    const headerLabels = ['Fecha', 'Cliente', 'Items', 'Total', 'Método', 'Estado'];
    const columnWidths = [70, 160, 50, 70, 90, 70];
    let x = margin;

    doc.setFillColor(243, 244, 246);
    doc.rect(margin - 5, cursor - 16, columnWidths.reduce((sum, value) => sum + value, 0) + 10, 22, 'F');
    doc.setFontSize(10);
    doc.setTextColor('#111827');
    headerLabels.forEach((label, index) => {
      doc.text(label, x + 3, cursor);
      x += columnWidths[index];
    });

    cursor += 20;
    doc.setFontSize(9);
    doc.setTextColor('#1f2937');

    filteredSales.forEach((sale) => {
      if (cursor > 520) {
        doc.addPage();
        cursor = 40;
      }

      x = margin;
      const row = [
        formatDate(sale.createdAt),
        sale.customerId?.name || sale.customer?.name || 'Anónimo',
        String(sale.items?.length || 0),
        `$${sale.total?.toFixed(2) || '0.00'}`,
        sale.paymentMethod || 'efectivo',
        sale.status || 'completada'
      ];

      row.forEach((cell, index) => {
        doc.text(String(cell), x + 3, cursor);
        x += columnWidths[index];
      });
      cursor += 18;
    });

    doc.save('reporte_ventas.pdf');
  };
  
  const cancelSale = async (saleId) => {
    setCanceling((s) => ({ ...s, [saleId]: true }));
    try {
      await API.put(`/sales/${saleId}/cancel`);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Venta cancelada' } }));
      await getSales();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cancelar la venta';
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setCanceling((s) => ({ ...s, [saleId]: false }));
    }
  };

  const restoreSale = async (saleId) => {
    setCanceling((s) => ({ ...s, [saleId]: true }));
    try {
      await API.put(`/sales/${saleId}/restore`);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Venta restaurada' } }));
      await getSales();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al restaurar la venta';
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setCanceling((s) => ({ ...s, [saleId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <Loader size={24} />}

      <h2 className="text-3xl font-bold mb-6 text-center">📊 Reportes de Ventas</h2>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-bold">Total Ventas</p>
            <p className="text-2xl font-bold text-blue-800">{totalSales}</p>
          </div>
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-sm text-green-600 font-bold">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-800">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-bold">Venta Promedio</p>
            <p className="text-2xl font-bold text-purple-800">${avgSale}</p>
          </div>
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-bold">Período</p>
            <p className="text-sm text-orange-800">
              {dateFrom ? formatDate(dateFrom) : 'Inicio'} - {dateTo ? formatDate(dateTo) : 'Hoy'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-lg">Filtros</h3>
              <p className="text-sm text-gray-500">Usa filtros para acotar ventas por cliente, método y período.</p>
            </div>
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setFilterPaymentMethod('all');
                setCustomerFilter('all');
                setSearchQuery('');
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Limpiar Filtros
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded p-2"
              placeholder="Desde"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded p-2"
              placeholder="Hasta"
            />
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="border rounded p-2"
            >
              <option value="all">Todos los clientes</option>
              {uniqueCustomerNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="border rounded p-2"
            >
              <option value="all">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded p-2"
              placeholder="Buscar por cliente, método o estado..."
            />
            <button
              onClick={exportToPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Listado de Ventas */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">Historial de Ventas ({totalSales})</h3>
          {filteredSales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay ventas en este período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-2 font-bold">Fecha</th>
                    <th className="text-left p-2 font-bold">Cliente</th>
                    <th className="text-left p-2 font-bold">Items</th>
                    <th className="text-right p-2 font-bold">Total</th>
                    <th className="text-left p-2 font-bold">Método</th>
                    <th className="text-left p-2 font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{formatDate(sale.createdAt)}</td>
                      <td className="p-2">{sale.customerId?.name || sale.customer?.name || 'Anónimo'}</td>
                      <td className="p-2">{sale.items?.length || 0} productos</td>
                      <td className="text-right p-2 font-bold">${sale.total?.toFixed(2) || '0'}</td>
                      <td className="p-2 capitalize">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                          {sale.paymentMethod || 'efectivo'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            sale.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {sale.status || 'completada'}
                            </span>
                            {(role === 'admin' || role === 'user') && !(sale.status === 'cancelada' || sale.status === 'cancelled' || sale.status === 'canceled') && (
                              <button
                                onClick={() => setConfirmAction({ open: true, type: 'cancel', sale })}
                                disabled={!!canceling[sale._id]}
                                className={`text-sm px-3 py-1 rounded ${canceling[sale._id] ? 'bg-gray-300 text-gray-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                              >
                                {canceling[sale._id] ? 'Cancelando...' : 'Cancelar'}
                              </button>
                            )}

                            {(role === 'admin') && (sale.status === 'cancelada' || sale.status === 'cancelled' || sale.status === 'canceled') && (
                              <button
                                onClick={() => setConfirmAction({ open: true, type: 'restore', sale })}
                                disabled={!!canceling[sale._id]}
                                className={`text-sm px-3 py-1 rounded ${canceling[sale._id] ? 'bg-gray-300 text-gray-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
                              >
                                {canceling[sale._id] ? 'Procesando...' : 'Restaurar'}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {confirmAction.open && (
          <ConfirmModal
            open={true}
            title={confirmAction.type === 'cancel' ? 'Cancelar venta' : 'Restaurar venta'}
            message={
              confirmAction.type === 'cancel'
                ? `¿Cancelar la venta de ${confirmAction.sale?.customerId?.name || confirmAction.sale?.customer?.name || 'Anónimo'}? Esta acción ajustará inventario.`
                : `¿Restaurar la venta de ${confirmAction.sale?.customerId?.name || confirmAction.sale?.customer?.name || 'Anónimo'}?`
            }
            onConfirm={async () => {
              const { type, sale } = confirmAction;
              setConfirmAction({ open: false, type: '', sale: null });
              if (type === 'cancel') await cancelSale(sale._id);
              if (type === 'restore') await restoreSale(sale._id);
            }}
            onCancel={() => setConfirmAction({ open: false, type: '', sale: null })}
          />
        )}
      </div>
    </div>
  );
}

export default Reports;
