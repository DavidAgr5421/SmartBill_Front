import { AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  requiredPermissions, 
  requireAll = false, 
  fallback 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, privilegesLoading } = useAuth();

  if (privilegesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (requiredPermissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
        </div>
      </div>
    );
  }

  return children;
};