import { useState, useEffect } from 'react';
import API from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import KardexModal from '../components/KardexModal';
import Loader from '../components/Loader';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newSubCategories, setNewSubCategories] = useState([]);
  const [editSubCategories, setEditSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const role = localStorage.getItem('role');
  const [search, setSearch] = useState('');
  const [filterStock] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('nameAsc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductHistory, setSelectedProductHistory] = useState([]);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editProviderPhone, setEditProviderPhone] = useState('');
  const [movementType, setMovementType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [movementLoading, setMovementLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [lowStockCount, setLowStockCount] = useState(0);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('General');
  const [provider, setProvider] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    const productToEdit = JSON.parse(localStorage.getItem('editProduct'));

    if (productToEdit) {
      updateProduct(productToEdit);
      localStorage.removeItem('editProduct');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await API.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(res.data);
      const lowCount = res.data.filter((product) => Number(product.stock) < 5).length;
      setLowStockCount(lowCount);
      if (lowCount > 0) {
        window.dispatchEvent(
          new CustomEvent('notify', {
            detail: {
              type: 'warning',
              message: `${lowCount} producto${lowCount === 1 ? '' : 's'} con bajo stock. Revisa el inventario.`
            }
          })
        );
      }
    } catch (err) {
      const msg = 'No se pudo cargar los productos.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error.response?.data || error.message);
      setCategories([]);
    }
  };

  const getSubCategories = async (categoryId, editMode = false) => {
    if (!categoryId) {
      if (editMode) setEditSubCategories([]);
      else setNewSubCategories([]);
      return;
    }

    try {
      const res = await API.get(`/categories/sub/list?categoryId=${categoryId}`);
      if (editMode) {
        setEditSubCategories(res.data || []);
      } else {
        setNewSubCategories(res.data || []);
      }
    } catch (error) {
      if (editMode) setEditSubCategories([]);
      else setNewSubCategories([]);
    }
  };

  useEffect(() => {
    getCategories();
    getProducts();

    const handleInventoryUpdated = () => {
      getProducts();
    };

    window.addEventListener('inventoryUpdated', handleInventoryUpdated);
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdated);
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setEditName(selectedProduct.name);
      setEditPrice(selectedProduct.price);
      setEditCategory(selectedProduct.category || 'General');
      setEditSubCategory(selectedProduct.subCategory || '');
      setEditProvider(selectedProduct.provider || '');
      setEditProviderPhone(selectedProduct.providerPhone || '');
    }
  }, [selectedProduct]);

  useEffect(() => {
    const categoryObj = categories.find((cat) => cat.name === category);
    if (categoryObj) {
      getSubCategories(categoryObj._id, false);
    } else {
      setNewSubCategories([]);
      setSubCategory('');
    }
  }, [category, categories]);

  useEffect(() => {
    const categoryObj = categories.find((cat) => cat.name === editCategory);
    if (categoryObj) {
      getSubCategories(categoryObj._id, true);
    } else {
      setEditSubCategories([]);
      setEditSubCategory('');
    }
  }, [editCategory, categories]);

  useEffect(() => {
    if (feedback.message) {
      const timeout = setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  const normalize = (str) =>
    str
      ? str
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
      : '';

  const matchesSearch = (product, query) => {
    if (!query) return true;
    const q = normalize(query).trim();
    if (!q) return true;
    const searchText = [
      product.name,
      product.description,
      product.category,
      product.subCategory,
      product.provider,
      product.providerPhone,
      product.supplier,
    ]
      .filter(Boolean)
      .join(' ');
    const n = normalize(searchText);
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every((tok) => n.includes(tok));
  };

  const matchesFilter = (product) => {
    if (filterStock === 'low' && Number(product.stock) >= 5) {
      return false;
    }
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }
    if (subCategoryFilter !== 'all' && (product.subCategory || '') !== subCategoryFilter) {
      return false;
    }
    return true;
  };

  const sortProducts = (list) => {
    return [...list].sort((a, b) => {
      if (sortOrder === 'priceAsc') return a.price - b.price;
      if (sortOrder === 'priceDesc') return b.price - a.price;
      if (sortOrder === 'nameDesc') return a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  };

  const addStock = (product) => {
    setSelectedProduct(product);
    setMovementType('entrada');
    setIsMovementModalOpen(true);
  };

  const removeStock = (product) => {
    setSelectedProduct(product);
    setMovementType('salida');
    setIsMovementModalOpen(true);
  };

  const viewKardex = async (product) => {
    setSelectedProduct(product);
    setIsKardexOpen(true);
    try {
      const response = await API.get(`/inventory/history/product/${product._id}`);
      setSelectedProductHistory(response.data || []);
    } catch (error) {
      const msg = 'No se pudo cargar el kardex del producto.';
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
      setSelectedProductHistory([]);
    }
  };

  const closeKardex = () => {
    setIsKardexOpen(false);
    setSelectedProduct(null);
    setSelectedProductHistory([]);
  };

  const saveMovement = async () => {
    if (movementLoading) return;

    if (!selectedProduct) {
      const msg = 'Selecciona un producto.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      const msg = 'Ingresa una cantidad válida.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
      return;
    }

    if (!reason || !reason.trim()) {
      const msg = 'Ingresa un motivo.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
      return;
    }

    setMovementLoading(true);
    setIsMovementModalOpen(false);

    const payload = {
      productId: selectedProduct._id,
      quantity: Number(quantity),
      reason,
      reference,
      provider: selectedProduct.provider || ''
    };
    const currentMovementType = movementType;

    setQuantity('');
    setReason('');
    setReference('');
    setMovementType('');
    setSelectedProduct(null);

    try {
      const endpoint =
        currentMovementType === 'entrada'
          ? '/inventory/in'
          : '/inventory/out';

      const response = await API.post(endpoint, payload);

      if (response?.data?.product) {
        const updatedProduct = response.data.product;
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product
          )
        );
      } else {
        await getProducts();
      }

      window.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: response?.data?.movement ?? null }));
      const msg = 'Movimiento guardado correctamente.';
      setFeedback({ type: 'success', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: msg } }));
    } catch (error) {
      const msg = 'Error al guardar el movimiento.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setMovementLoading(false);
    }
  };

  const createProduct = async () => {
    setCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('provider', provider);
      formData.append('providerPhone', providerPhone);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await API.post('/products', formData);

      setName('');
      setPrice('');
      setStock('');
      setCategory('General');
      setSubCategory('');
      setProvider('');
      setProviderPhone('');
      setImageFile(null);
      setImagePreview('');
      setIsCreateModalOpen(false);

      await getProducts();
      const msg = 'Producto creado correctamente.';
      setFeedback({ type: 'success', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: msg } }));
    } catch (err) {
      const msg = 'Error al crear el producto.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setCreateLoading(false);
    }
  };

  // Modal-based delete flow
  const [confirmDelete, setConfirmDelete] = useState(null);

  const askDeleteProduct = (product) => setConfirmDelete(product);

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete._id;
    try {
      await API.delete(`/products/${id}`);
      getProducts();
      const msg = `Producto "${confirmDelete.name}" eliminado.`;
      setFeedback({ type: 'success', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: msg } }));
    } catch (error) {
      const msg = 'Error al eliminar el producto.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    } finally {
      setConfirmDelete(null);
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
      const msg = 'Producto actualizado correctamente.';
      setFeedback({ type: 'success', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: msg } }));
    } catch (error) {
      const msg = 'Error al actualizar el producto.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    }
  };

  const saveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('price', editPrice);
      formData.append('category', editCategory);
      formData.append('subCategory', editSubCategory);
      formData.append('provider', editProvider);
      formData.append('providerPhone', editProviderPhone);
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await API.put(`/products/${selectedProduct._id}`, formData);

      setIsEditModalOpen(false);
      getProducts();
      const msg = 'Producto editado correctamente.';
      setFeedback({ type: 'success', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: msg } }));
    } catch (error) {
      const msg = 'Error al guardar los cambios del producto.';
      setFeedback({ type: 'error', message: msg });
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: msg } }));
    }
  };

  const uniqueSubCategories = Array.from(
    new Set(products.map((product) => product.subCategory).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {loading && (
        <div className="w-full max-w-5xl">
          <Loader size={24} />
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4 text-center mb-4">Productos</h2>
      {lowStockCount > 0 && (
        <div className="mb-4 w-full max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <strong>{lowStockCount} producto{lowStockCount === 1 ? '' : 's'} con bajo stock</strong>
              <p className="text-sm text-red-700">Revisa los productos marcados en rojo y actualiza el inventario cuanto antes.</p>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6 w-full max-w-6xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Buscar producto, categoría o proveedor..."
              className="border p-2 rounded w-full pr-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
              >
                ✖
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row lg:w-[620px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="all">Todas las categorías</option>
              {[...new Set(['General', ...categories.map((cat) => cat.name)])].map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </select>
            <select
              value={subCategoryFilter}
              onChange={(e) => setSubCategoryFilter(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="all">Todas las subcategorías</option>
              {uniqueSubCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="nameAsc">Nombre A-Z</option>
              <option value="nameDesc">Nombre Z-A</option>
              <option value="priceAsc">Precio ascendente</option>
              <option value="priceDesc">Precio descendente</option>
            </select>
          </div>
        </div>

        {role === 'admin' && (
          <div className="mt-3 flex justify-start">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              + Nuevo producto
            </button>
          </div>
        )}
      </div>

      <div key={products.map(p => p._id + '-' + p.stock).join('|')} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-6xl">
        {sortProducts(
          products.filter((product) => matchesSearch(product, search) && matchesFilter(product))
        ).map((product) => (
          <div
            key={product._id}
            className={`p-4 rounded-2xl shadow-md transition flex flex-col h-full ${product.stock < 5
              ? 'bg-red-50 border border-red-300'
              : 'bg-white hover:shadow-lg'
              }`}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="mb-3 h-40 w-full object-cover rounded-2xl"
              />
            ) : (
              <div className="mb-3 h-40 w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {product.category || 'General'}
              </span>
              {product.subCategory && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                  {product.subCategory}
                </span>
              )}
              {product.provider && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {product.provider}
                </span>
              )}
            </div>
            {role === 'admin' && product.providerPhone && (
              <p className="text-gray-500 mt-2 text-sm">Tel: {product.providerPhone}</p>
            )}
            {product.stock < 5 && (
              <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${product.stock < 3 ? 'bg-red-700 text-white' : 'bg-red-500 text-white'}`}>
                {product.stock < 3 ? 'Stock crítico' : 'Bajo stock'}
              </span>
            )}

            <p className="text-gray-500 mt-3">Precio: ${product.price}</p>
            <p className="text-gray-500">Stock: {product.stock}</p>

            <div className="mt-auto flex flex-wrap justify-between items-center gap-2 pt-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700 transition"
                  onClick={() => addStock(product)}
                >
                  Agregar
                </button>

                <button
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700 transition"
                  onClick={() => removeStock(product)}
                >
                  Retirar
                </button>

                <button
                  className="px-3 py-1.5 rounded-md bg-slate-600 text-white text-sm font-medium shadow-sm hover:bg-slate-700 transition"
                  onClick={() => viewKardex(product)}
                >
                  Kardex
                </button>
              </div>

              {role === 'admin' && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-3 py-1.5 rounded-md bg-yellow-500 text-white text-sm font-medium shadow-sm hover:bg-yellow-600 transition"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="px-3 py-1.5 rounded-md bg-gray-700 text-white text-sm font-medium shadow-sm hover:bg-black transition"
                    onClick={() => askDeleteProduct(product)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[92vw] max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Crear producto</h3>

            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="border p-2 rounded w-full"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="border p-2 rounded w-full"
                type="number"
                placeholder="Precio"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <input
                className="border p-2 rounded w-full"
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />

              <select
                className="border p-2 rounded w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                className="border p-2 rounded w-full"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!newSubCategories.length}
              >
                <option value="">Sin subcategoría</option>
                {newSubCategories.map((subCat) => (
                  <option key={subCat._id} value={subCat.name}>
                    {subCat.name}
                  </option>
                ))}
              </select>

              <input
                className="border p-2 rounded w-full"
                placeholder="Proveedor"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />

              <input
                className="border p-2 rounded w-full"
                placeholder="Teléfono proveedor"
                value={providerPhone}
                onChange={(e) => setProviderPhone(e.target.value)}
              />
            </div>

            <div className="border p-2 rounded w-full mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  setImagePreview(file ? URL.createObjectURL(file) : '');
                }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="mt-2 h-24 w-full object-cover rounded"
                />
              )}
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setName('');
                  setPrice('');
                  setStock('');
                  setCategory('General');
                  setSubCategory('');
                  setProvider('');
                  setProviderPhone('');
                  setImageFile(null);
                  setImagePreview('');
                }}
              >
                Cancelar
              </button>

              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={createProduct}
                disabled={createLoading}
              >
                {createLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-80">

              <h3 className="text-lg font-bold mb-4">Editar producto</h3>

              <input
                className="border p-2 w-full mb-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <select
                className="border p-2 w-full mb-2"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="General">General</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                className="border p-2 w-full mb-2"
                value={editSubCategory}
                onChange={(e) => setEditSubCategory(e.target.value)}
                disabled={!editSubCategories.length}
              >
                <option value="">Sin subcategoría</option>
                {editSubCategories.map((subCat) => (
                  <option key={subCat._id} value={subCat.name}>
                    {subCat.name}
                  </option>
                ))}
              </select>

              <input
                className="border p-2 w-full mb-2"
                value={editProvider}
                placeholder="Proveedor"
                onChange={(e) => setEditProvider(e.target.value)}
              />

              <input
                className="border p-2 w-full mb-2"
                value={editProviderPhone}
                placeholder="Teléfono proveedor"
                onChange={(e) => setEditProviderPhone(e.target.value)}
              />

              <div className="border p-2 rounded w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditImageFile(file);
                  }}
                />
                {(editImageFile || selectedProduct?.image) && (
                  <img
                    src={editImageFile ? URL.createObjectURL(editImageFile) : selectedProduct?.image}
                    alt="Vista previa"
                    className="mt-2 h-24 w-full object-cover rounded"
                  />
                )}
              </div>

              <input
                className="border p-2 w-full mb-4"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />

              <div className="flex justify-between">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={saveEdit}
                >
                  Guardar
                </button>
              </div>

            </div>
          </div>
        )
      }

      {
        isMovementModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-2xl shadow-xl w-96">

              <h2 className="text-2xl font-bold mb-4 text-center">

                {movementType === 'entrada'
                  ? 'Agregar Stock'
                  : 'Retirar Stock'}

              </h2>

              <p className="mb-4 text-center text-gray-500">
                {selectedProduct?.name}
              </p>

              <input
                type="number"
                placeholder="Cantidad"
                className="border p-2 rounded w-full mb-3"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <input
                type="text"
                placeholder="Motivo"
                className="border p-2 rounded w-full mb-3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <input
                type="text"
                placeholder="Referencia (ej. factura, orden, nota)"
                className="border p-2 rounded w-full mb-4"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />

              <div className="flex justify-between">

                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setIsMovementModalOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={movementLoading}
                  className={`px-4 py-2 rounded text-white ${movementLoading ? 'bg-gray-400 cursor-not-allowed' : movementType === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`}
                  onClick={saveMovement}
                >
                  {movementLoading ? 'Guardando...' : 'Guardar'}
                </button>

              </div>

            </div>

          </div>
        )
      }
      {
        isKardexOpen && selectedProduct && (
          <KardexModal
            open={isKardexOpen}
            product={selectedProduct}
            entries={selectedProductHistory}
            onClose={closeKardex}
          />
        )
      }

      {
        confirmDelete && (
          <ConfirmModal
            open={true}
            title="Eliminar producto"
            message={`¿Eliminar ${confirmDelete.name}?`}
            onConfirm={confirmDeleteProduct}
            onCancel={() => setConfirmDelete(null)}
          />
        )
      }
    </div >
  );
}

export default Products;
