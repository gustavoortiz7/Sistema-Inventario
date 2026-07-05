import React, { useMemo } from 'react';

function KardexModal({ open, product, entries, onClose }) {
  const ledger = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    let balance = 0;
    return entries.map((entry) => {
      const quantity = Number(entry.quantity);
      balance += entry.type === 'entrada' ? quantity : -quantity;
      return {
        ...entry,
        balance,
      };
    });
  }, [entries]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kardex - {product.name}</h2>
            <p className="text-sm text-gray-500">Categoría: {product.category || 'General'} · Proveedor: {product.provider || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">Cerrar</button>
        </div>

        <div className="p-6">
          {entries.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-4 text-gray-600">No hay movimientos para este producto.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Tipo</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Cantidad</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Saldo</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Usuario</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Referencia</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.slice().reverse().map((entry) => (
                    <tr key={entry._id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(entry.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{entry.type === 'entrada' ? 'Entrada' : 'Salida'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.balance}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.user?.name || entry.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.reference || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KardexModal;
