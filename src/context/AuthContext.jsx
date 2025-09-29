import { createContext, useContext, useState, useEffect } from "react";

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

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);
      if (role) localStorage.setItem("role", role);
      if (name) localStorage.setItem("name", name);
      if (id) localStorage.setItem("id", id);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("id");
    }
  }, [token, tokenType, role, name, id]);

  const login = (jwtToken, type, userData) => {
    setToken(jwtToken);
    setTokenType(type || "Bearer");
    
    console.log("Lo que se obtiene en el token al auth")
    console.log(jwtToken)
    console.log(type)
    console.log(userData)
    // Extraer información del token
    const decodedToken = decodeToken(jwtToken);
    console.log("Token decodificado:", decodedToken);
    
    // Establecer el ID desde el token o desde userData
    const userId = userData?.id || decodedToken?.sub || decodedToken?.userId || decodedToken?.id;
    const userRole = userData?.role || decodedToken?.role;
    const userName = userData?.name || decodedToken?.name;
    
    console.log("ID extraído:", userId);
    console.log("Role extraído:", userRole);
    console.log("Name extraído:", userName);
    
    if (userId) setId(userId);
    if (userRole) setRole(userRole);
    if (userName) setName(userName);
  };

  const logout = () => {
    setToken(null);
    setTokenType("Bearer");
    setName(null);
    setId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, tokenType, name, role, id, login, logout }}>
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