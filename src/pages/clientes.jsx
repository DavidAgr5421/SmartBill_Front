import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Edit2, Trash2, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Mail, MapPin, Phone, AlertTriangle } from 'lucide-react';
import api from '../api/apiClient';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    pageSize: 20
  });

  const [filters, setFilters] = useState({
    id: '',
    name: '',
    address: '',
    contact: '',
    active: ''
  });

  const [clientForm, setClientForm] = useState({
    id: null,
    name: '',
    email: '',
    address: '',
    contact: '',
    active: true
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    searchClients();
  }, []);

  const searchClients = async (page = 0) => {
    setLoading(true);
    try {
      const searchPayload = {
        id: filters.id ? parseInt(filters.id) : null,
        name: filters.name || null,
        address: filters.address || null,
        contact: filters.contact || null,
        active: filters.active === '' ? null : filters.active === 'true'
      };

      Object.keys(searchPayload).forEach(key => {
        if (searchPayload[key] === null || searchPayload[key] === '') {
          delete searchPayload[key];
        }
      });

      const response = await api.post(`client/v1/api?page=${page}&size=${pagination.pageSize}`, searchPayload);
      
      setClients(response.data.content || []);
      setPagination({
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        currentPage: response.data.number,
        pageSize: response.data.size
      });
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      showNotification('error', 'Error al cargar los clientes');
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
    searchClients(0);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      id: '',
      name: '',
      address: '',
      contact: '',
      active: ''
    });
    setTimeout(() => searchClients(0), 100);
  };

  const handleCreateClient = () => {
    setModalMode('create');
    setClientForm({
      id: null,
      name: '',
      email: '',
      address: '',
      contact: '',
      active: true
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditClient = async (client) => {
    setModalMode('edit');
    setClientForm({
      id: client.id,
      name: client.name,
      email: client.email || '',
      address: client.address || '',
      contact: client.contact || '',
      active: client.active
    });
    setErrors({});
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setClientForm(prev => ({
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
    
    if (!clientForm.name || !clientForm.name.trim()) {
      newErrors.name = true;
    }

    if (modalMode === 'create') {
      if (!clientForm.address || !clientForm.address.trim()) {
        newErrors.address = true;
      }
      if (!clientForm.contact || !clientForm.contact.trim()) {
        newErrors.contact = true;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (clientForm.email && !emailRegex.test(clientForm.email)) {
      newErrors.email = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    setLoading(true);
    try {
      if (modalMode === 'create') {
        const payload = {
          name: clientForm.name,
          email: clientForm.email || null,
          address: clientForm.address,
          contact: clientForm.contact
        };

        await api.post('client/v1/api/new', payload);
        showNotification('success', 'Cliente creado exitosamente');
      } else {
        const payload = {};
        
        if (clientForm.name) payload.name = clientForm.name;
        if (clientForm.email) payload.email = clientForm.email;
        if (clientForm.address) payload.address = clientForm.address;
        if (clientForm.contact) payload.contact = clientForm.contact;
        payload.active = clientForm.active;

        await api.put(`client/v1/api/${clientForm.id}`, payload);
        showNotification('success', 'Cliente actualizado exitosamente');
      }

      setShowModal(false);
      searchClients(pagination.currentPage);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      showNotification('error', 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setLoading(true);
    try {
      await api.delete(`client/v1/api/${clientToDelete.id}`);
      showNotification('success', 'Cliente eliminado exitosamente');
      setShowDeleteModal(false);
      setClientToDelete(null);
      searchClients(pagination.currentPage);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      showNotification('error', 'Error al eliminar el cliente');
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
    const baseClass = "w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:scale-[1.01]";
    return errors[field] 
      ? `${baseClass} border-red-500 bg-red-50 animate-shake`
      : `${baseClass} border-gray-300`;
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
        
        .card-appear {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-white animate-pulse" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
                  <p className="text-purple-100 text-sm">Administra tu cartera de clientes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 hover:scale-105 font-medium shadow-md"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
                <button
                  onClick={handleCreateClient}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 hover:scale-105 font-medium shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Cliente
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">ID</label>
                  <input
                    type="number"
                    value={filters.id}
                    onChange={(e) => handleFilterChange('id', e.target.value)}
                    placeholder="Buscar por ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    placeholder="Buscar por nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={filters.address}
                    onChange={(e) => handleFilterChange('address', e.target.value)}
                    placeholder="Buscar por dirección"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Contacto</label>
                  <input
                    type="text"
                    value={filters.contact}
                    onChange={(e) => handleFilterChange('contact', e.target.value)}
                    placeholder="Buscar por contacto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={filters.active}
                    onChange={(e) => handleFilterChange('active', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
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
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105"
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
                Mostrando <span className="font-semibold">{clients.length}</span> de <span className="font-semibold">{pagination.totalElements}</span> clientes
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando clientes...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-16 animate-fadeIn">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">No se encontraron clientes</p>
                <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros o crear uno nuevo</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client, index) => (
                    <div
                      key={client.id}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-purple-300 card-appear"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{client.name}</h3>
                            <span className="text-xs text-gray-500">ID: {client.id}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {client.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-purple-600" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <span className="truncate">{client.address}</span>
                          </div>
                        )}
                        {client.contact && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-purple-600" />
                            <span>{client.contact}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 hover:scale-105 text-sm font-medium"
                        >
                          <Edit2 className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(client)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-105 text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between animate-fadeIn">
                    <p className="text-sm text-gray-600">
                      Página {pagination.currentPage + 1} de {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => searchClients(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 0}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => searchClients(pagination.currentPage + 1)}
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
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-purple-800 rounded p-1 transition-all duration-200 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nombre del Cliente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Ej: Juan Pérez"
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
                  Email {modalMode === 'create' && '(Opcional)'}
                </label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={getInputClassName('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                    <AlertCircle className="h-4 w-4" />
                    Email inválido
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Dirección {modalMode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="Calle 123 #45-67"
                  className={getInputClassName('address')}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                    <AlertCircle className="h-4 w-4" />
                    Este campo es obligatorio
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contacto {modalMode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={clientForm.contact}
                  onChange={(e) => handleFormChange('contact', e.target.value)}
                  placeholder="+57 300 123 4567"
                  className={getInputClassName('contact')}
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                    <AlertCircle className="h-4 w-4" />
                    Este campo es obligatorio
                  </p>
                )}
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    id="active"
                    checked={clientForm.active}
                    onChange={(e) => handleFormChange('active', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Cliente Activo
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105 disabled:bg-purple-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                ¿Eliminar Cliente?
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Estás a punto de eliminar el cliente <span className="font-semibold">"{clientToDelete.name}"</span>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClientToDelete(null);
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

export default ClientManagement;