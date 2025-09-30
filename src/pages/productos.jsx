import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit2, Trash2, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../api/apiClient';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
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

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      await api.delete(`product/v1/api/${productToDelete.id}`);
      showNotification('success', 'Producto eliminado exitosamente');
      setShowDeleteModal(false);
      setProductToDelete(null);
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

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getInputClassName = (field) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01]";
    return errors[field] 
      ? `${baseClass} border-red-500 bg-red-50 animate-shake`
      : `${baseClass} border-gray-300`;
  };

  const getStockStatus = (amount) => {
    if (!amount || amount === 0) return { color: 'bg-red-100 text-red-800', label: 'Sin stock' };
    if (amount < 10) return { color: 'bg-yellow-100 text-yellow-800', label: 'Stock bajo' };
    return { color: 'bg-green-100 text-green-800', label: 'En stock' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .row-appear {
          animation: slideInRight 0.4s ease-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-white animate-pulse" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
                  <p className="text-blue-100 text-sm">Administra tu inventario</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 font-medium shadow-md"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 font-medium shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Producto
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-b border-gray-200 bg-gray-50 p-6 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    placeholder="Buscar por nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Referencia</label>
                  <input
                    type="text"
                    value={filters.referenceNo}
                    onChange={(e) => handleFilterChange('referenceNo', e.target.value)}
                    placeholder="Buscar por referencia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={filters.active}
                    onChange={(e) => handleFilterChange('active', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Cantidad Mínima</label>
                  <input
                    type="number"
                    value={filters.startAmount}
                    onChange={(e) => handleFilterChange('startAmount', e.target.value)}
                    placeholder="Mínimo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Cantidad Máxima</label>
                  <input
                    type="number"
                    value={filters.endAmount}
                    onChange={(e) => handleFilterChange('endAmount', e.target.value)}
                    placeholder="Máximo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                >
                  <Search className="h-4 w-4" />
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{products.length}</span> de <span className="font-semibold">{pagination.totalElements}</span> productos
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 animate-fadeIn">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">No se encontraron productos</p>
                <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros o crear uno nuevo</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referencia</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product, index) => {
                        const stockStatus = getStockStatus(product.amount);
                        return (
                          <tr 
                            key={product.id} 
                            className="hover:bg-gray-50 transition-all duration-200 row-appear"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{product.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{product.referenceNo || '-'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.unitPrice)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {product.amount || 0} unidades
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(product)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between animate-fadeIn">
                    <p className="text-sm text-gray-600">
                      Página {pagination.currentPage + 1} de {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => searchProducts(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 0}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => searchProducts(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-blue-800 rounded p-1 transition-all duration-200 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Ej: Martillo de acero"
                  className={getInputClassName('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                    <AlertCircle className="h-4 w-4" />
                    Este campo es obligatorio
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Referencia
                </label>
                <input
                  type="text"
                  value={productForm.referenceNo}
                  onChange={(e) => handleFormChange('referenceNo', e.target.value)}
                  placeholder="Ej: HER-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Precio Unitario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={productForm.unitPrice}
                    onChange={(e) => handleFormChange('unitPrice', e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Cantidad en Stock
                </label>
                <input
                  type="number"
                  value={productForm.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    id="active"
                    checked={productForm.active}
                    onChange={(e) => handleFormChange('active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Producto Activo
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                ¿Eliminar Producto?
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Estás a punto de eliminar el producto <span className="font-semibold">"{productToDelete.name}"</span>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded-lg font-medium text-white z-50 shadow-lg flex items-center gap-3 animate-slideDown ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;