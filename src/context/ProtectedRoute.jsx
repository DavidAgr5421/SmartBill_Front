import { AlertCircle, Lock } from 'lucide-react';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  requiredPermissions, 
  requireAll = false, 
  fallback 
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    privilegesLoading,
    userPrivileges 
  } = useAuth();

  // Mostrar loading mientras se cargan los privilegios
  if (privilegesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay privilegios cargados, mostrar error
  if (!userPrivileges) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No se pudieron cargar los privilegios
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta recargar la página o contacta al administrador del sistema.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // Determinar si tiene acceso
  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (requiredPermissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  // Si no tiene acceso, mostrar mensaje de denegación
  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <Lock className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-gray-600 mb-6">
            No tienes los permisos necesarios para acceder a esta sección.
          </p>
          
          {/* Mostrar qué permisos se requieren */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Permisos requeridos:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {requiredPermission && (
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {getPermissionLabel(requiredPermission)}
                </li>
              )}
              {requiredPermissions && requiredPermissions.map((perm) => (
                <li key={perm} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {getPermissionLabel(perm)}
                </li>
              ))}
            </ul>
            {requiredPermissions && (
              <p className="text-xs text-gray-500 mt-2">
                {requireAll 
                  ? 'Se requieren TODOS estos permisos' 
                  : 'Se requiere AL MENOS UNO de estos permisos'}
              </p>
            )}
          </div>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  // Si tiene acceso, renderizar el contenido
  return children;
};

// Función helper para obtener etiquetas legibles de permisos
const getPermissionLabel = (permission) => {
  const labels = {
    createBill: 'Crear Factura',
    deleteBill: 'Eliminar Factura',
    viewHistory: 'Ver Historial',
    printBill: 'Imprimir Factura',
    createProduct: 'Crear Producto',
    deleteProduct: 'Eliminar Producto',
    createUser: 'Crear Usuario',
    deleteUser: 'Eliminar Usuario',
    generateReports: 'Generar Reportes',
    editConfig: 'Editar Configuración',
    viewConfig: 'Ver Configuración',
    createRol: 'Crear Rol',
    deleteRol: 'Eliminar Rol'
  };
  
  return labels[permission] || permission;
};