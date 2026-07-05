import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import API from '../services/api';
import SalesCart from '../components/SalesCart';
import Loader from '../components/Loader';

function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [invoiceSale, setInvoiceSale] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    getProducts();
    getRecentSales();
    getCustomers();
  }, []);

  useEffect(() => {
    setSubCategoryFilter('all');
  }, [categoryFilter]);

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products');
      setProducts(res.data || []);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al cargar productos' } }));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getCustomers = async () => {
    try {
      const res = await API.get('/customers');
      setCustomers(res.data || []);
    } catch (error) {
      setCustomers([]);
    }
  };

  const getRecentSales = async () => {
    setSalesLoading(true);
    try {
      const res = await API.get('/sales/day');
      setRecentSales(res.data.sales || []);
    } catch (error) {
      setRecentSales([]);
    } finally {
      setSalesLoading(false);
    }
  };

  const normalize = (str) =>
    str
      ? str
          .toString()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
      : '';

  const availableCategories = ['all', ...new Set(products.map((product) => product.category || 'Sin categoría'))];
  const availableSubCategories = [
    'all',
    ...new Set(
      products
        .filter((product) => categoryFilter === 'all' || (product.category || 'Sin categoría') === categoryFilter)
        .map((product) => product.subCategory || 'Sin subcategoría')
    )
  ];

  const filteredProducts = products.filter((product) => {
    const category = product.category || 'Sin categoría';
    const subCategory = product.subCategory || 'Sin subcategoría';
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    const matchesSubCategory = subCategoryFilter === 'all' || subCategory === subCategoryFilter;

    if (!matchesCategory || !matchesSubCategory) return false;

    if (!search) return true;
    const q = normalize(search).trim();
    const searchText = [product.name, product.category, product.subCategory, product.provider]
      .filter(Boolean)
      .join(' ');
    const n = normalize(searchText);
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every((tok) => n.includes(tok));
  });

  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const category = product.category || 'Sin categoría';
    const subsection = product.subCategory || 'Sin subcategoría';
    if (!groups[category]) groups[category] = {};
    if (!groups[category][subsection]) groups[category][subsection] = [];
    groups[category][subsection].push(product);
    return groups;
  }, {});

  const addToCart = (product) => {
    if (product.stock <= 0) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Stock insuficiente' } }));
      return;
    }

    const existingItem = cart.find((item) => item.product._id === product._id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        updateQuantity(product._id, existingItem.quantity + 1);
      } else {
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'warning', message: 'Stock limitado' } }));
      }
    } else {
      setCart([...cart, { product, quantity: 1, subtotal: product.price }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    if (quantity <= 0) {
      removeFromCart(productId);
    } else if (quantity > product.stock) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'warning', message: 'Stock insuficiente' } }));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product._id === productId
            ? { ...item, quantity, subtotal: product.price * quantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
  };

  const handleCheckout = () => {
    setCart([]);
    getRecentSales();
    getProducts();
  };

  const handleSaleCompleted = (sale) => {
    setInvoiceSale(sale);
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    if (!invoiceSale) return;

    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const saleDate = new Date(invoiceSale.createdAt).toLocaleString('es-ES');
    const customerInfo = invoiceSale.customer || {};

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Factura - ${invoiceSale._id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            h1 { color: #1d4ed8; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .totals { margin-top: 16px; }
            .totals div { display: flex; justify-content: space-between; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>Factura de Venta</h1>
          <p><strong>Factura N°:</strong> ${invoiceSale._id}</p>
          <p><strong>Fecha:</strong> ${saleDate}</p>
          <p><strong>Cliente:</strong> ${customerInfo.name || 'Anónimo'}</p>
          <p><strong>Email:</strong> ${customerInfo.email || 'No disponible'}</p>
          <p><strong>Teléfono:</strong> ${customerInfo.phone || 'No disponible'}</p>
          <p><strong>Método de pago:</strong> ${invoiceSale.paymentMethod}</p>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceSale.items
                .map(
                  (item) => `
                    <tr>
                      <td>${item.product?.name || 'Producto eliminado'}</td>
                      <td>${item.quantity}</td>
                      <td>$${Number(item.price).toFixed(2)}</td>
                      <td>$${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
          <div class="totals">
            <div><strong>Total:</strong><span>$${Number(invoiceSale.total).toFixed(2)}</span></div>
          </div>
          <p>Gracias por su compra.</p>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
  };

  const handleDownloadInvoice = () => {
    if (!invoiceSale) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(18);
    doc.setTextColor('#1d4ed8');
    doc.text('Factura de Venta', 40, 50);

    doc.setFontSize(12);
    doc.setTextColor('#111827');
    const saleDate = new Date(invoiceSale.createdAt).toLocaleString('es-ES');
    const customerInfo = invoiceSale.customer || {};

    doc.text(`Factura N°: ${invoiceSale._id}`, 40, 80);
    doc.text(`Fecha: ${saleDate}`, 40, 100);
    doc.text(`Cliente: ${customerInfo.name || 'Anónimo'}`, 40, 120);
    doc.text(`Email: ${customerInfo.email || 'No disponible'}`, 40, 140);
    doc.text(`Teléfono: ${customerInfo.phone || 'No disponible'}`, 40, 160);
    doc.text(`Método de pago: ${invoiceSale.paymentMethod}`, 40, 180);

    const tableTop = 210;
    doc.setFontSize(11);
    doc.text('Producto', 40, tableTop);
    doc.text('Cantidad', 240, tableTop);
    doc.text('Precio', 340, tableTop);
    doc.text('Subtotal', 440, tableTop);

    let y = tableTop + 20;
    invoiceSale.items.forEach((item) => {
      doc.text(item.product?.name || 'Producto eliminado', 40, y);
      doc.text(String(item.quantity), 240, y);
      doc.text(`$${Number(item.price).toFixed(2)}`, 340, y);
      doc.text(`$${Number(item.subtotal).toFixed(2)}`, 440, y);
      y += 20;
      if (y > 740) {
        doc.addPage();
        y = 40;
      }
    });

    const totalY = y + 20;
    doc.setFontSize(13);
    doc.text(`Total: $${Number(invoiceSale.total).toFixed(2)}`, 40, totalY);
    doc.save(`factura_${invoiceSale._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && (
        <div className="w-full max-w-5xl mx-auto">
          <Loader size={24} />
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-center">🛒 Punto de Venta (POS)</h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sección de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                className="w-full border-2 rounded-lg p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border-2 rounded-lg p-3 min-w-[180px]"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
              <select
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                className="border-2 rounded-lg p-3 min-w-[200px]"
              >
                {availableSubCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory === 'all' ? 'Todas las subcategorías' : subCategory}
                  </option>
                ))}
              </select>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay productos disponibles
              </div>
            ) : (
              Object.keys(groupedProducts).map((category) => (
                <div key={category} className="mb-6">
                  <div className="mb-3 rounded-2xl bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-800">{category}</p>
                        <p className="text-sm text-blue-600">{Object.keys(groupedProducts[category]).length} subcategoría(s)</p>
                      </div>
                    </div>
                  </div>
                  {Object.keys(groupedProducts[category]).map((subCategory) => (
                    <div key={subCategory} className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">{subCategory}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedProducts[category][subCategory].map((product) => (
                          <div
                            key={product._id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                              product.stock > 0
                                ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                                : 'border-red-200 bg-red-50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-800">{product.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                product.stock > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                Stock: {product.stock}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-green-600">${product.price}</span>
                              <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                                className={`px-3 py-1 rounded font-semibold ${
                                  product.stock > 0
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                              >
                                + Agregar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Ventas recientes */}
          {recentSales.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📊 Ventas del Día</h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{sale.customer?.name || 'Anónimo'}</td>
                        <td className="text-right p-2 font-bold text-green-600">${sale.total.toFixed(2)}</td>
                        <td className="text-right p-2 text-gray-600">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Carrito lateral */}
        <div className="lg:col-span-1">
          <SalesCart
            key={cart.map((item) => `${item.product._id}:${item.quantity}`).join('|')}
            cart={cart}
            customers={customers}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={handleCheckout}
            onSaleComplete={handleSaleCompleted}
            loading={salesLoading}
          />
        </div>
      </div>

      {showInvoice && invoiceSale && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">Factura generada</h3>
                <p className="text-sm text-gray-500">Venta N° {invoiceSale._id}</p>
              </div>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Cliente</p>
                  <p className="text-lg font-bold">{invoiceSale.customer?.name || 'Anónimo'}</p>
                  <p className="text-sm text-slate-600">{invoiceSale.customer?.email || 'No registrado'}</p>
                  <p className="text-sm text-slate-600">{invoiceSale.customer?.phone || 'No registrado'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Total</p>
                  <p className="text-3xl font-bold text-green-700">${invoiceSale.total.toFixed(2)}</p>
                  <p className="text-sm text-slate-600">Pago: {invoiceSale.paymentMethod}</p>
                </div>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Producto</th>
                    <th className="p-3 border">Cantidad</th>
                    <th className="p-3 border">Precio</th>
                    <th className="p-3 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceSale.items.map((item) => (
                    <tr key={item._id || `${item.product?._id}:${item.quantity}`} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{item.product?.name || 'Producto'}</td>
                      <td className="p-3 border">{item.quantity}</td>
                      <td className="p-3 border">${item.price.toFixed(2)}</td>
                      <td className="p-3 border">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
                <button
                  onClick={handlePrintInvoice}
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Imprimir factura
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="px-5 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700"
                >
                  Descargar PDF
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="px-5 py-3 rounded-2xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;
