import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, Users, Key } from 'lucide-react';
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

  const privilegesList = [
    { key: 'createBill', label: 'Crear Factura' },
    { key: 'deleteBill', label: 'Eliminar Factura' },
    { key: 'viewHistory', label: 'Ver Historial' },
    { key: 'printBill', label: 'Imprimir Factura' },
    { key: 'createProduct', label: 'Crear Producto' },
    { key: 'deleteProduct', label: 'Eliminar Producto' },
    { key: 'createUser', label: 'Crear Usuario' },
    { key: 'deleteUser', label: 'Eliminar Usuario' },
    { key: 'generateReports', label: 'Generar Reportes' },
    { key: 'editConfig', label: 'Editar Configuración' },
    { key: 'viewConfig', label: 'Ver Configuración' },
    { key: 'createRol', label: 'Crear Rol' },
    { key: 'deleteRol', label: 'Eliminar Rol' }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/users-rol/v1/api');
      setRoles(response.data);
    } catch (error) {
      showAlert('Error al cargar roles', 'error');
    }
  };

  const loadPrivileges = async (rolId) => {
    try {
      const response = await api.get(`/users-rol/${rolId}/privileges`);
      setPrivileges(response.data);
      setSelectedRole(roles.find(r => r.rolId === rolId));
    } catch (error) {
      showAlert('Error al cargar privilegios', 'error');
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) {
      showAlert('El nombre del rol es requerido', 'error');
      return;
    }

    try {
      await api.post('/users-rol/v1/api', { rolName: newRoleName });
      showAlert('Rol creado exitosamente');
      setNewRoleName('');
      setIsCreating(false);
      loadRoles();
    } catch (error) {
      showAlert('Error al crear rol', 'error');
    }
  };

  const updateRole = async () => {
    if (!selectedRole || !newRoleName.trim()) return;

    try {
      await api.put(`/users-rol/v1/api/${selectedRole.rolId}`, { 
        rolName: newRoleName 
      });
      showAlert('Rol actualizado exitosamente');
      setIsEditing(false);
      setNewRoleName('');
      loadRoles();
    } catch (error) {
      showAlert('Error al actualizar rol', 'error');
    }
  };

  const deleteRole = async (rolId) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol? Esto también eliminará sus privilegios.')) return;

    try {
      await api.delete(`/users-rol/v1/api/${rolId}`);
      showAlert('Rol eliminado exitosamente');
      setSelectedRole(null);
      setPrivileges(null);
      loadRoles();
    } catch (error) {
      showAlert('Error al eliminar rol', 'error');
    }
  };

  const updatePrivileges = async () => {
    if (!privileges) return;

    try {
      const payload = {
        rolId: privileges.rol.rolId,
        rol: privileges.rol,
        ...privilegesList.reduce((acc, priv) => {
          acc[priv.key] = privileges[priv.key] || false;
          return acc;
        }, {})
      };

      await api.put(`/users-rol/${privileges.rol.rolId}/privileges`, payload);
      showAlert('Privilegios actualizados exitosamente');
      loadPrivileges(privileges.rol.rolId);
    } catch (error) {
      showAlert('Error al actualizar privilegios', 'error');
    }
  };

  const togglePrivilege = (key) => {
    setPrivileges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
            <div className={`mx-6 mt-4 p-4 rounded-lg ${
              alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {alert.message}
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
                Roles
              </button>
              <button
                onClick={() => setActiveTab('privileges')}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'privileges'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="h-4 w-4" />
                Privilegios
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'roles' && (
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
                        placeholder="Nombre del rol"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={createRole}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setNewRoleName('');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Roles List */}
                <div className="grid gap-3">
                  {roles.map((role) => (
                    <div
                      key={role.rolId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privileges' && (
              <div>
                {!selectedRole ? (
                  <div className="text-center py-12 text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Selecciona un rol para gestionar sus privilegios</p>
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
                      <button
                        onClick={updatePrivileges}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </button>
                    </div>

                    {privileges && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {privilegesList.map((priv) => (
                          <label
                            key={priv.key}
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
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