import { useEffect, useState } from 'react';
import API from '../services/api';

function History() {
 const [history, setHistory] = useState([]);

 const getHistory = async () => {
  try {
   const res = await API.get('/inventory/history');
   setHistory(res.data);
  } catch (error) {
   console.error(error);
  }
 };

 useEffect(() => {
  getHistory();
 }, []);

 return (
  <div className="p-6 max-w-4xl mx-auto">
   <h2 className="text-2xl font-bold mb-4">
    Historial de Movimientos
   </h2>

   <div className="grid grid-cols-2 gap-4">
    {history.map((item) => (
     <div key={item._id} className="border p-4 rounded shadow">
      <p><strong>Producto:</strong> {item.product?.name}</p>
      <p>
       <strong>Tipo:</strong>{' '}
       <span className={item.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
        {item.type}
       </span>
      </p>
      <p><strong>Cantidad:</strong> {item.quantity}</p>
      <p className="text-sm text-gray-500">
       {new Date(item.createdAt).toLocaleString()}
      </p>
     </div>
    ))}
   </div>
  </div>
 );
}

export default History;