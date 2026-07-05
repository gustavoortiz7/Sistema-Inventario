import { useEffect, useState } from 'react';
import API from '../services/api';

function History() {
 const [history, setHistory] = useState([]);
 const [feedback, setFeedback] = useState({ type: '', message: '' });

 const getHistory = async () => {
  try {
   const res = await API.get('/inventory/history');
   setHistory(res.data);
  } catch (error) {
   setFeedback({ type: 'error', message: 'Error al cargar el historial.' });
  }
 };

 useEffect(() => {
  getHistory();

  const handleInventoryUpdated = () => {
   getHistory();
  };

  window.addEventListener('inventoryUpdated', handleInventoryUpdated);
  return () => {
   window.removeEventListener('inventoryUpdated', handleInventoryUpdated);
  };
 }, []);

 return (
  <div className="p-6 max-w-4xl mx-auto">
   <h2 className="text-2xl font-bold mb-4">
    Historial de Movimientos
   </h2>   {feedback.message && (
    <div
     className={`mb-4 px-4 py-3 rounded ${
      feedback.type === 'success'
       ? 'bg-green-100 text-green-800'
       : 'bg-red-100 text-red-800'
     }`}
    >
     {feedback.message}
    </div>
   )}
   <div className="grid grid-cols-2 gap-4">
    {history.map((item) => (
     <div
      key={item._id}
      className="bg-white p-4 rounded-2xl shadow mb-3"
     >
      <div className="flex justify-between items-center">

       <div>
        <h3 className="font-bold text-lg">
         {item.product?.name}
        </h3>

        <p className="text-gray-500">
         Usuario: {item.user?.name || item.user?.email || 'N/A'}
        </p>

        <p className="text-gray-500">
         Motivo: {item.reason || 'N/A'}
        </p>

        {item.reference && (
         <p className="text-gray-500">
          Referencia: {item.reference}
         </p>
        )}

        {(item.provider || item.product?.provider) && (
         <p className="text-gray-500">
          Proveedor: {item.provider || item.product?.provider}
         </p>
        )}

        <p className="text-gray-400 text-sm">
         {new Date(item.createdAt).toLocaleString()}
        </p>
       </div>

       <div>
        <span
         className={`px-3 py-1 rounded-full text-white font-bold
          ${item.type === 'entrada'
           ? 'bg-green-500'
           : 'bg-red-500'
          }`}
        >
         {item.type === 'entrada'
          ? `+${item.quantity}`
          : `-${item.quantity}`}
        </span>
       </div>

      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

export default History;