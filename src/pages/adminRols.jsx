import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, Users, Key, AlertCircle } from 'lucide-react';
import api from '../api/apiClient';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [privileges, setPrivileges] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(false);

  const privilegesList = [
    { key: 'createBill', label: 'Crear Factura', category: 'Facturación' },
    { key: 'deleteBill', label: 'Eliminar Factura', category: 'Facturación' },
    { key: 'viewHistory', label: 'Ver Historial', category: 'Facturación' },
    { key: 'printBill', label: 'Imprimir Factura', category: 'Facturación' },
    { key: 'createProduct', label: 'Crear Producto', category: 'Productos' },
    { key: 'deleteProduct', label: 'Eliminar Producto', category: 'Productos' },
    { key: 'createUser', label: 'Crear Usuario', category: 'Usuarios' },
    { key: 'deleteUser', label: 'Eliminar Usuario', category: 'Usuarios' },
    { key: 'generateReports', label: 'Generar Reportes', category: 'Reportes' },
    { key: 'editConfig', label: 'Editar Configuración', category: 'Configuración' },
    { key: 'viewConfig', label: 'Ver Configuración', category: 'Configuración' },
    { key: 'createRol', label: 'Crear Rol', category: 'Roles' },
    { key: 'deleteRol', label: 'Eliminar Rol', category: 'Roles' }
  ];

  // Agrupar privilegios por categoría
  const privilegesByCategory = privilegesList.reduce((acc, priv) => {
    if (!acc[priv.category]) {
      acc[priv.category] = [];
    }
    acc[priv.category].push(priv);
    return acc;
  }, {});

  useEffect(() => {
    loadRoles();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users-rol/v1/api');
      setRoles(response.data);
    } catch (error) {
      showAlert('Error al cargar roles: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPrivileges = async (rolId) => {
    try {
      setLoading(true);
      const response = await api.get(`/users-rol/${rolId}/privileges`);
      setPrivileges(response.data);
      setSelectedRole(roles.find(r => r.rolId === rolId));
    } catch (error) {
      showAlert('Error al cargar privilegios: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) {
      showAlert('El nombre del rol es requerido', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.post('/users-rol/v1/api', { rolName: newRoleName });
      showAlert('Rol creado exitosamente. Los privilegios se han inicializado por defecto.');
      setNewRoleName('');
      setIsCreating(false);
      await loadRoles();
    } catch (error) {
      showAlert('Error al crear rol: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async () => {
    if (!selectedRole || !newRoleName.trim()) {
      showAlert('El nombre del rol es requerido', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/users-rol/v1/api/${selectedRole.rolId}`, { 
        rolName: newRoleName 
      });
      showAlert('Rol actualizado exitosamente');
      setIsEditing(false);
      setNewRoleName('');
      setSelectedRole(null);
      await loadRoles();
    } catch (error) {
      showAlert('Error al actualizar rol: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (rolId) => {
    const role = roles.find(r => r.rolId === rolId);
    if (!window.confirm(
      `¿Estás seguro de eliminar el rol "${role?.rolName}"?\n\n` +
      `Esto eliminará:\n` +
      `• El rol y sus privilegios\n` +
      `• Los usuarios con este rol quedarán con el rol DEFAULT`
    )) return;

    try {
      setLoading(true);
      await api.delete(`/users-rol/v1/api/${rolId}`);
      showAlert('Rol eliminado exitosamente. Los usuarios afectados ahora tienen el rol DEFAULT.');
      
      if (selectedRole?.rolId === rolId) {
        setSelectedRole(null);
        setPrivileges(null);
      }
      
      await loadRoles();
    } catch (error) {
      showAlert('Error al eliminar rol: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivileges = async () => {
    if (!privileges) {
      showAlert('No hay privilegios para actualizar', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Construir el payload solo con los privilegios
      const payload = privilegesList.reduce((acc, priv) => {
        acc[priv.key] = privileges[priv.key] || false;
        return acc;
      }, {});

      await api.put(`/users-rol/${privileges.rol.rolId}/privileges`, payload);
      showAlert('Privilegios actualizados exitosamente');
      
      // Recargar privilegios para obtener el estado actualizado
      await loadPrivileges(privileges.rol.rolId);
    } catch (error) {
      showAlert('Error al actualizar privilegios: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePrivilege = (key) => {
    setPrivileges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAllInCategory = (category) => {
    const categoryPrivileges = privilegesByCategory[category];
    const allSelected = categoryPrivileges.every(priv => privileges[priv.key]);
    
    setPrivileges(prev => {
      const updated = { ...prev };
      categoryPrivileges.forEach(priv => {
        updated[priv.key] = !allSelected;
      });
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Gestión de Roles y Privilegios</h1>
                <p className="text-blue-100 text-sm">Administra roles y permisos del sistema</p>
              </div>
            </div>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`mx-6 mt-4 p-4 rounded-lg flex items-start gap-3 ${
              alert.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{alert.message}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'roles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Roles ({roles.length})
              </button>
              <button
                onClick={() => setActiveTab('privileges')}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'privileges'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                disabled={!selectedRole}
              >
                <Key className="h-4 w-4" />
                Privilegios {selectedRole && `(${selectedRole.rolName})`}
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && activeTab === 'roles' && (
              <div>
                {/* Create Role Section */}
                <div className="mb-6">
                  {!isCreating ? (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Crear Nuevo Rol
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Nombre del rol (ej: GERENTE)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && createRole()}
                      />
                      <button
                        onClick={createRole}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Guardar"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setNewRoleName('');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Roles List */}
                {roles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay roles creados. Crea el primer rol.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {roles.map((role) => (
                      <div
                        key={role.rolId}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          selectedRole?.rolId === role.rolId
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            {isEditing && selectedRole?.rolId === role.rolId ? (
                              <input
                                type="text"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && updateRole()}
                              />
                            ) : (
                              <>
                                <h3 className="font-semibold text-gray-900">{role.rolName}</h3>
                                <p className="text-sm text-gray-500">ID: {role.rolId}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isEditing && selectedRole?.rolId === role.rolId ? (
                            <>
                              <button
                                onClick={updateRole}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Guardar"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setSelectedRole(null);
                                  setNewRoleName('');
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRole(role);
                                  setNewRoleName(role.rolName);
                                  setIsEditing(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar nombre"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  loadPrivileges(role.rolId);
                                  setActiveTab('privileges');
                                }}
                                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Ver Privilegios
                              </button>
                              <button
                                onClick={() => deleteRole(role.rolId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar rol"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && activeTab === 'privileges' && (
              <div>
                {!selectedRole ? (
                  <div className="text-center py-12 text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Selecciona un rol desde la pestaña "Roles" para gestionar sus privilegios</p>
                    <button
                      onClick={() => setActiveTab('roles')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ir a Roles
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Privilegios de: {selectedRole.rolName}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {selectedRole.rolId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab('roles')}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Volver
                        </button>
                        <button
                          onClick={updatePrivileges}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          Guardar Cambios
                        </button>
                      </div>
                    </div>

                    {privileges && (
                      <div className="space-y-6">
                        {Object.entries(privilegesByCategory).map(([category, categoryPrivs]) => (
                          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{category}</h4>
                              <button
                                onClick={() => selectAllInCategory(category)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {categoryPrivs.every(priv => privileges[priv.key]) 
                                  ? 'Desmarcar todos' 
                                  : 'Marcar todos'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                              {categoryPrivs.map((priv) => (
                                <label
                                  key={priv.key}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={privileges[priv.key] || false}
                                    onChange={() => togglePrivilege(priv.key)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700">{priv.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}