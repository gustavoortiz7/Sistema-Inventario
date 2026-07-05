import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryDesc, setSubCategoryDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    getCategories();
    getSubCategories();
  }, []);

  const getCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('getCategories error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Error al cargar categorías';
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message } }));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getSubCategories = async (categoryId) => {
    try {
      const query = categoryId ? `?categoryId=${categoryId}` : '';
      const res = await API.get(`/categories/sub/list${query}`);
      setSubCategories(res.data);
    } catch (error) {
      setSubCategories([]);
    }
  };

  const createCategory = async () => {
    if (!categoryName.trim()) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Nombre de categoría requerido' } }));
      return;
    }

    try {
      const payload = { name: categoryName, description: categoryDesc };
      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Categoría actualizada' } }));
      } else {
        await API.post('/categories', payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Categoría creada' } }));
      }
      setCategoryName('');
      setCategoryDesc('');
      setEditingCategory(null);
      setShowCategoryForm(false);
      getCategories();
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al guardar categoría' } }));
    }
  };

  const createSubCategory = async () => {
    if (!subCategoryName.trim()) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Nombre de subcategoría requerido' } }));
      return;
    }

    if (!selectedCategory) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Selecciona una categoría' } }));
      return;
    }

    try {
      const payload = { name: subCategoryName, description: subCategoryDesc, category: selectedCategory };
      if (editingSubCategory) {
        await API.put(`/categories/sub/${editingSubCategory._id}`, payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Subcategoría actualizada' } }));
      } else {
        await API.post('/categories/sub', payload);
        window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Subcategoría creada' } }));
      }
      setSubCategoryName('');
      setSubCategoryDesc('');
      setEditingSubCategory(null);
      setShowSubCategoryForm(false);
      getSubCategories(selectedCategory);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al guardar subcategoría' } }));
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría y sus subcategorías?')) return;
    try {
      await API.delete(`/categories/${id}`);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Categoría eliminada' } }));
      getCategories();
      getSubCategories();
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al eliminar categoría' } }));
    }
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta subcategoría?')) return;
    try {
      await API.delete(`/categories/sub/${id}`);
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Subcategoría eliminada' } }));
      getSubCategories(selectedCategory);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al eliminar subcategoría' } }));
    }
  };

  const editCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description);
    setShowCategoryForm(true);
  };

  const editSubCategory = (subCat) => {
    setEditingSubCategory(subCat);
    setSubCategoryName(subCat.name);
    setSubCategoryDesc(subCat.description);
    setShowSubCategoryForm(true);
  };

  if (role !== 'admin') {
    return <div className="p-6 text-center text-red-600">Solo administradores pueden acceder a esta sección</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <Loader size={24} />}

      <h2 className="text-3xl font-bold mb-6 text-center">📁 Gestión de Categorías</h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorías */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Categorías</h3>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryName('');
                setCategoryDesc('');
                setShowCategoryForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + Nueva Categoría
            </button>
          </div>

          {showCategoryForm && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <input
                type="text"
                placeholder="Nombre de categoría"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                className="w-full border rounded p-2 mb-2"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={createCategory}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {categories.length === 0 && !loading ? (
              <p className="text-center text-gray-500 py-8">Aún no hay categorías. Crea la primera categoría para comenzar.</p>
            ) : (
              categories.map((cat) => {
                return (
                  <div
                    key={cat._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat._id);
                      getSubCategories(cat._id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`flex-1 ${selectedCategory === cat._id ? 'font-bold text-blue-600' : ''}`}>
                        <p className="font-semibold text-lg">{cat.name}</p>
                        {cat.description && <p className="text-sm text-gray-600">{cat.description}</p>}
                      </div>
                      {role === 'admin' && (
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editCategory(cat);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(cat._id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Subcategorías */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Subcategorías</h3>
            <button
              disabled={!selectedCategory}
              onClick={() => {
                setEditingSubCategory(null);
                setSubCategoryName('');
                setSubCategoryDesc('');
                setShowSubCategoryForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              + Nueva Subcategoría
            </button>
          </div>

          {!selectedCategory && (
            <p className="text-center text-gray-500 py-8">Selecciona una categoría para ver sus subcategorías</p>
          )}

          {showSubCategoryForm && selectedCategory && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <input
                type="text"
                placeholder="Nombre de subcategoría"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={subCategoryDesc}
                onChange={(e) => setSubCategoryDesc(e.target.value)}
                className="w-full border rounded p-2 mb-2"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={createSubCategory}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setShowSubCategoryForm(false);
                    setEditingSubCategory(null);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedCategory && subCategories.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay subcategorías en esta categoría todavía.</p>
            ) : (
              subCategories.map((subCat) => (
                <div key={subCat._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{subCat.name}</p>
                      {subCat.description && <p className="text-sm text-gray-600">{subCat.description}</p>}
                    </div>
                    {role === 'admin' && (
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => editSubCategory(subCat)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteSubCategory(subCat._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
