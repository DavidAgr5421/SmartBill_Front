import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    pageSize: 20
  });

  const [filters, setFilters] = useState({
    name: '',
    referenceNo: '',
    startAmount: '',
    endAmount: '',
    startDate: '',
    endDate: '',
    active: ''
  });

  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    referenceNo: '',
    unitPrice: '',
    amount: '',
    active: true
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    searchProducts();
  }, []);

  const searchProducts = async (page = 0) => {
    setLoading(true);
    try {
      const searchPayload = {
        name: filters.name || null,
        referenceNo: filters.referenceNo || null,
        startAmount: filters.startAmount ? parseInt(filters.startAmount) : null,
        endAmount: filters.endAmount ? parseInt(filters.endAmount) : null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        active: filters.active === '' ? null : filters.active === 'true'
      };

      // Remover campos null
      Object.keys(searchPayload).forEach(key => {
        if (searchPayload[key] === null || searchPayload[key] === '') {
          delete searchPayload[key];
        }
      });

      const response = await api.post(`product/v1/api/search?page=${page}&size=${pagination.pageSize}`, searchPayload);
      
      setProducts(response.data.content || []);
      setPagination({
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        currentPage: response.data.number,
        pageSize: response.data.size
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      showNotification('error', 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    searchProducts(0);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      referenceNo: '',
      startAmount: '',
      endAmount: '',
      startDate: '',
      endDate: '',
      active: ''
    });
    setTimeout(() => searchProducts(0), 100);
  };

  const handleCreateProduct = () => {
    setModalMode('create');
    setProductForm({
      id: null,
      name: '',
      referenceNo: '',
      unitPrice: '',
      amount: '',
      active: true
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditProduct = async (product) => {
    setModalMode('edit');
    setProductForm({
      id: product.id,
      name: product.name,
      referenceNo: product.referenceNo || '',
      unitPrice: product.unitPrice || '',
      amount: product.amount || '',
      active: product.active
    });
    setErrors({});
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!productForm.name || !productForm.name.trim()) {
      newErrors.name = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      if (modalMode === 'create') {
        const payload = {
          name: productForm.name,
          referenceNo: productForm.referenceNo || null,
          unitPrice: productForm.unitPrice ? parseInt(productForm.unitPrice) : null,
          amount: productForm.amount ? parseInt(productForm.amount) : null
        };

        await api.post('product/v1/api', payload);
        showNotification('success', 'Producto creado exitosamente');
      } else {
        const payload = {
          name: productForm.name,
          referenceNo: productForm.referenceNo || null,
          unitPrice: productForm.unitPrice ? parseInt(productForm.unitPrice) : null,
          amount: productForm.amount ? parseInt(productForm.amount) : null,
          active: productForm.active
        };

        await api.put(`product/v1/api/${productForm.id}`, payload);
        showNotification('success', 'Producto actualizado exitosamente');
      }

      setShowModal(false);
      searchProducts(pagination.currentPage);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      showNotification('error', 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`product/v1/api/${productId}`);
      showNotification('success', 'Producto eliminado exitosamente');
      searchProducts(pagination.currentPage);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showNotification('error', 'Error al eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const getInputClassName = (field) => {
    const baseClass = "w-full px-4 py-2 border rounded transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
    return errors[field] 
      ? `${baseClass} border-red-500`
      : `${baseClass} border-gray-300`;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-blue-500 text-white py-5 mb-6 shadow-md">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">SmartBill - Productos</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-500">Gestión de Productos</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <span>🔍</span>
                Filtros
              </button>
              <button
                onClick={handleCreateProduct}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Nuevo Producto
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Filtros de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    placeholder="Buscar por nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Referencia</label>
                  <input
                    type="text"
                    value={filters.referenceNo}
                    onChange={(e) => handleFilterChange('referenceNo', e.target.value)}
                    placeholder="Buscar por referencia"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Estado</label>
                  <select
                    value={filters.active}
                    onChange={(e) => handleFilterChange('active', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Cantidad Mínima</label>
                  <input
                    type="number"
                    value={filters.startAmount}
                    onChange={(e) => handleFilterChange('startAmount', e.target.value)}
                    placeholder="Mínimo"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Cantidad Máxima</label>
                  <input
                    type="number"
                    value={filters.endAmount}
                    onChange={(e) => handleFilterChange('endAmount', e.target.value)}
                    placeholder="Máximo"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 text-sm text-gray-600">
            Mostrando {products.length} de {pagination.totalElements} productos
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">📦</p>
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Referencia</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cantidad</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{product.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.referenceNo || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{product.amount || 0}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => searchProducts(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Página {pagination.currentPage + 1} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => searchProducts(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Nombre del producto"
                  className={getInputClassName('name')}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Referencia
                </label>
                <input
                  type="text"
                  value={productForm.referenceNo}
                  onChange={(e) => handleFormChange('referenceNo', e.target.value)}
                  placeholder="Número de referencia"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  value={productForm.unitPrice}
                  onChange={(e) => handleFormChange('unitPrice', e.target.value)}
                  placeholder="Precio"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={productForm.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  placeholder="Cantidad disponible"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productForm.active}
                      onChange={(e) => handleFormChange('active', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold text-gray-700">Producto Activo</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded font-semibold text-white z-50 shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;