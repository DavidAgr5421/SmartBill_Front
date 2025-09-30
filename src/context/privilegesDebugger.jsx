import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Eye, EyeOff, RefreshCw, User, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiClient';

export default function PrivilegesDebugger() {
  const { 
    userPrivileges, 
    privilegesLoading, 
    refreshPrivileges,
    name,
    role,
    rolId,
    hasPermission
  } = useAuth();

  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [tempPrivileges, setTempPrivileges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

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

  // Obtener el valor actual del privilegio (considerando cambios temporales)
  const getPrivilegeValue = (key) => {
    if (hasChanges && tempPrivileges.hasOwnProperty(key)) {
      return tempPrivileges[key];
    }
    return hasPermission(key);
  };

  // Contar privilegios activos
  const activeCount = privilegesList.filter(p => getPrivilegeValue(p.key)).length;
  const totalCount = privilegesList.length;

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Toggle de privilegio temporal
  const togglePrivilege = (key) => {
    const currentValue = getPrivilegeValue(key);
    const newTempPrivileges = { ...tempPrivileges, [key]: !currentValue };
    setTempPrivileges(newTempPrivileges);
    setHasChanges(true);
  };

  // Guardar cambios en el servidor
  const saveChanges = async () => {
    if (!rolId) {
      showAlert('No se puede guardar: RolId no disponible', 'error');
      return;
    }

    try {
      setIsSaving(true);

      // Construir payload con todos los privilegios
      const payload = privilegesList.reduce((acc, priv) => {
        acc[priv.key] = getPrivilegeValue(priv.key);
        return acc;
      }, {});

      // Enviar actualización al servidor
      await api.put(`/users-rol/${rolId}/privileges`, payload);

      showAlert('Privilegios actualizados exitosamente', 'success');
      
      // Recargar privilegios desde el servidor
      await refreshPrivileges();
      
      // Limpiar cambios temporales
      setTempPrivileges({});
      setHasChanges(false);
    } catch (error) {
      showAlert(
        'Error al guardar: ' + (error.response?.data?.message || error.message),
        'error'
      );
      console.error('Error saving privileges:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Descartar cambios
  const discardChanges = () => {
    setTempPrivileges({});
    setHasChanges(false);
    showAlert('Cambios descartados', 'info');
  };

  // Seleccionar/deseleccionar todos en una categoría
  const toggleCategory = (category) => {
    const categoryPrivs = privilegesByCategory[category];
    const allSelected = categoryPrivs.every(priv => getPrivilegeValue(priv.key));
    
    const newTempPrivileges = { ...tempPrivileges };
    categoryPrivs.forEach(priv => {
      newTempPrivileges[priv.key] = !allSelected;
    });
    
    setTempPrivileges(newTempPrivileges);
    setHasChanges(true);
  };

  // Habilitar/deshabilitar todos los privilegios
  const toggleAll = () => {
    const allSelected = privilegesList.every(p => getPrivilegeValue(p.key));
    const newTempPrivileges = {};
    
    privilegesList.forEach(priv => {
      newTempPrivileges[priv.key] = !allSelected;
    });
    
    setTempPrivileges(newTempPrivileges);
    setHasChanges(true);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        title="Ver mis privilegios"
      >
        <Shield className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-white" />
          <h3 className="font-semibold text-white">Mis Privilegios</h3>
          {hasChanges && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-xs font-medium rounded-full">
              Cambios sin guardar
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshPrivileges}
            disabled={privilegesLoading || isSaving}
            className="p-1 text-white hover:bg-blue-800 rounded transition-colors disabled:opacity-50"
            title="Refrescar privilegios"
          >
            <RefreshCw className={`h-4 w-4 ${privilegesLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-white hover:bg-blue-800 rounded transition-colors"
            title="Ocultar"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`mx-4 mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
          alert.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : alert.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* User Info */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{name || 'Usuario'}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Rol: <span className="font-semibold text-gray-900">{role || 'N/A'}</span></span>
          <span>ID Rol: <span className="font-semibold text-gray-900">{rolId || 'N/A'}</span></span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700">Privilegios activos:</span>
          <span className="text-lg font-bold text-blue-600">
            {activeCount} / {totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(activeCount / totalCount) * 100}%` }}
          />
        </div>
        
        {/* Botón para seleccionar/deseleccionar todos */}
        <button
          onClick={toggleAll}
          className="w-full mt-3 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors"
        >
          {activeCount === totalCount ? 'Desmarcar todos' : 'Marcar todos'}
        </button>
      </div>

      {/* Privileges List */}
      <div className="flex-1 overflow-y-auto">
        {privilegesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !userPrivileges ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No se pudieron cargar los privilegios</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(privilegesByCategory).map(([category, categoryPrivs]) => {
              const categoryActive = categoryPrivs.filter(p => getPrivilegeValue(p.key)).length;
              const categoryTotal = categoryPrivs.length;
              
              return (
                <div key={category} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{category}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {categoryActive}/{categoryTotal}
                      </span>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        title={categoryActive === categoryTotal ? 'Desmarcar categoría' : 'Marcar categoría'}
                      >
                        {categoryActive === categoryTotal ? 'Desmarcar' : 'Marcar'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {categoryPrivs.map((priv) => {
                      const hasPriv = getPrivilegeValue(priv.key);
                      const hasChanged = tempPrivileges.hasOwnProperty(priv.key);
                      
                      return (
                        <button
                          key={priv.key}
                          onClick={() => togglePrivilege(priv.key)}
                          className={`w-full flex items-center gap-2 text-sm py-2 px-2 rounded transition-all cursor-pointer hover:scale-[1.02] ${
                            hasPriv ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
                          } ${hasChanged ? 'ring-2 ring-yellow-400' : ''}`}
                        >
                          {hasPriv ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={`flex-1 text-left ${hasPriv ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {priv.label}
                          </span>
                          {hasChanged && (
                            <span className="text-xs text-yellow-600 font-medium">
                              Modificado
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
          <button
            onClick={discardChanges}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Descartar cambios"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          🔧 Herramienta de desarrollo - Eliminar en producción
        </p>
      </div>
    </div>
  );
}