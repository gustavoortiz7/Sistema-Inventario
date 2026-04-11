import { useState, useEffect } from 'react';
import API from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
     const token = localStorage.getItem('token');

     const res = await API.get('/products', {
      headers: {
       Authorization: `Bearer ${token}`
      }
     });
     setProducts(res.data);
    } catch (err) {
     console.error(err);
    }
  };
  

  useEffect(() => {
    getProducts();
  }, []);

 const addStock = async (productId) => {
  const quantity = prompt('Cantidad a agregar:');

  try {
   await API.post('/inventory/in', {
    productId,
    quantity: Number(quantity)
   });

   getProducts();
  } catch (error) {
   console.error(error);
  }
 };

 const removeStock = async (productId) => {
  const quantity = prompt('Cantidad a retirar:');

  try {
   await API.post('/inventory/out', {
    productId,
    quantity: Number(quantity)
   });

   getProducts();
  } catch (error) {
   console.error(error);
  }
 };

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const createProduct = async () => {
    try {
     await API.post('/products', {
      name,
      price,
      stock
     });

     getProducts();
    } catch (err) {
     console.error(err);
    }
  };

 const deleteProduct = async (id) => {
  if (!window.confirm('¿Eliminar producto?')) return;

  try {
   await API.delete(`/products/${id}`);
   getProducts();
  } catch (error) {
   console.error(error);
  }
 };

 const updateProduct = async (product) => {
  const newName = prompt('Nuevo nombre:', product.name);
  const newPrice = prompt('Nuevo precio:', product.price);

  try {
   await API.put(`/products/${product._id}`, {
    name: newName,
    price: Number(newPrice),
   });

   getProducts();
  } catch (error) {
   console.error(error);
  }
 };

 return (
  <div className="p-6 max-w-4xl mx-auto">
   <h2 className="text-2xl font-bold mb-4 text-center mb-4">Productos</h2>

   <div className="mb-6">
    <h3 className="font-semibold mb-2">Crear producto</h3>

    <input
     className="border p-2 mr-2"
     placeholder="Nombre"
     onChange={(e) => setName(e.target.value)}
    />

    <input
     className="border p-2 mr-2"
     type="number"
     placeholder="Precio"
     onChange={(e) => setPrice(e.target.value)}
    />

    <input
     className="border p-2 mr-2"
     type="number"
     placeholder="Stock"
     onChange={(e) => setStock(e.target.value)}
    />

    <button
     className="bg-blue-500 text-white px-4 py-2 rounded"
     onClick={createProduct}
    >
     Crear
    </button>
   </div>

   <div className="grid grid-cols-3 gap-4">
    {products.map((product) => (
     <div key={product._id} className="border p-4 rounded shadow">
      <h3 className="font-bold">{product.name}</h3>
      <p>Precio: ${product.price}</p>
      <p>Stock: {product.stock}</p>

      <div className="mt-2">
       <button
        className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
        onClick={() => addStock(product._id)}
       >
        ➕
       </button>

       <button
        className="bg-red-500 text-white px-2 py-1 rounded"
        onClick={() => removeStock(product._id)}
       >
        ➖
       </button>

       <button
        className="bg-gray-500 text-white px-2 py-1 ml-2 rounded"
        onClick={() => deleteProduct(product._id)}
       >
        🗑️
       </button>
       <button
        className="bg-yellow-500 text-white px-2 py-1 ml-2 rounded"
        onClick={() => updateProduct(product)}
       >
        ✏️
       </button>

      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

export default Products;