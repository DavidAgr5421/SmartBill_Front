import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/apiClient";

const AuthContext = createContext(null);

// Función para decodificar el token JWT y extraer información
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [tokenType, setTokenType] = useState(localStorage.getItem("token_type") || "Bearer");
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [name, setName] = useState(localStorage.getItem("name"));
  const [id, setId] = useState(localStorage.getItem("id"));
  const [rolId, setRolId] = useState(localStorage.getItem("rolId"));
  
  // Nuevo: estado para privilegios
  const [userPrivileges, setUserPrivileges] = useState(null);
  const [privilegesLoading, setPrivilegesLoading] = useState(false);

  // Cargar privilegios cuando cambie el rolId
  useEffect(() => {
    if (rolId && token) {
      loadUserPrivileges(rolId);
    }
  }, [rolId, token]);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);
      if (role) localStorage.setItem("role", role);
      if (name) localStorage.setItem("name", name);
      if (id) localStorage.setItem("id", id);
      if (rolId) localStorage.setItem("rolId", rolId);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("id");
      localStorage.removeItem("rolId");
    }
  }, [token, tokenType, role, name, id, rolId]);

  // Nuevo: Cargar privilegios del usuario
  const loadUserPrivileges = async (userRolId) => {
    setPrivilegesLoading(true);
    try {
      const response = await api.get(`/users-rol/${userRolId}/privileges`);
      setUserPrivileges(response.data);
    } catch (error) {
      setUserPrivileges(null);
    } finally {
      setPrivilegesLoading(false);
    }
  };

  // Nuevo: Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    if (!userPrivileges) return false;
    return userPrivileges[permission] === true;
  };

  // Nuevo: Verificar si el usuario tiene al menos uno de varios permisos
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  // Nuevo: Verificar si el usuario tiene todos los permisos especificados
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  // Nuevo: Recargar privilegios manualmente
  const refreshPrivileges = async () => {
    if (rolId) {
      await loadUserPrivileges(rolId);
    }
  };

  const login = (jwtToken, type, userData) => {
    setToken(jwtToken);
    setTokenType(type || "Bearer");
    
    // Extraer información del token
    const decodedToken = decodeToken(jwtToken);
    
    // Establecer el ID desde el token o desde userData
    const userId = userData?.id || decodedToken?.sub || decodedToken?.userId || decodedToken?.id;
    const userRole = userData?.role || decodedToken?.role;
    const userName = userData?.name || decodedToken?.name;
    const userRolId = userData?.rolId || decodedToken?.rolId;
    
    if (userId) setId(userId);
    if (userRole) setRole(userRole);
    if (userName) setName(userName);
    if (userRolId) setRolId(userRolId);
  };

  const logout = () => {
    setToken(null);
    setTokenType("Bearer");
    setName(null);
    setId(null);
    setRole(null);
    setRolId(null);
    setUserPrivileges(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      tokenType, 
      name, 
      role, 
      id, 
      rolId,
      login, 
      logout,
      // Nuevas propiedades para permisos
      userPrivileges,
      privilegesLoading,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      refreshPrivileges
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};