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

  return (
    <div>
      <h2>Productos</h2>

      <h3>Crear Producto</h3>

      <input
        placeholder="Nombre"
        onChange={(e)=> setName(e.target.value)}
      />
      <input
        placeholder="Precio"
        type ="number"
        onChange={(e)=> setPrice(e.target.value)}
      />
      <input
        placeholder="Stock"
        type ="number"
        onChange={(e)=> setStock(e.target.value)}
      />
      <button onClick={createProduct}>Crear Producto</button>
      <hr />
      
      {products.map((product) => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>Precio: ${product.price}</p>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </div>
  );
}

export default Products;