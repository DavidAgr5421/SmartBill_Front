import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
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

      // Remover campos null
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

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`client/v1/api/${clientId}`);
      showNotification('success', 'Cliente eliminado exitosamente');
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
            <div className="text-2xl font-bold">SmartBill - Clientes</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-500">Gestión de Clientes</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <span>🔍</span>
                Filtros
              </button>
              <button
                onClick={handleCreateClient}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Nuevo Cliente
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Filtros de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">ID</label>
                  <input
                    type="number"
                    value={filters.id}
                    onChange={(e) => handleFilterChange('id', e.target.value)}
                    placeholder="Buscar por ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={filters.address}
                    onChange={(e) => handleFilterChange('address', e.target.value)}
                    placeholder="Buscar por dirección"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Contacto</label>
                  <input
                    type="text"
                    value={filters.contact}
                    onChange={(e) => handleFilterChange('contact', e.target.value)}
                    placeholder="Buscar por contacto"
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
            Mostrando {clients.length} de {pagination.totalElements} clientes
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Cargando clientes...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">👥</p>
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dirección</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contacto</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{client.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.address || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.contact || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClient(client)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
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
                    onClick={() => searchClients(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Página {pagination.currentPage + 1} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => searchClients(pagination.currentPage + 1)}
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
                {modalMode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Nombre del cliente"
                  className={getInputClassName('name')}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Email {modalMode === 'create' && '(Opcional)'}
                </label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={getInputClassName('email')}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Dirección {modalMode === 'create' && '*'}
                </label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="Dirección del cliente"
                  className={getInputClassName('address')}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Contacto {modalMode === 'create' && '*'}
                </label>
                <input
                  type="text"
                  value={clientForm.contact}
                  onChange={(e) => handleFormChange('contact', e.target.value)}
                  placeholder="Teléfono o contacto"
                  className={getInputClassName('contact')}
                />
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={clientForm.active}
                      onChange={(e) => handleFormChange('active', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold text-gray-700">Cliente Activo</span>
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

export default ClientManagement;