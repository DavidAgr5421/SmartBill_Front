import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [activeMenu, setActiveMenu] = useState("");

  const menuItems = [
    { id: "admin-bills", icon: "fa-solid fa-money-bills", text: "Administrar Facturas", path: "/admin-bills" },
    { id: "admin-users", icon: "fa-solid fa-user-tie", text: "Administrar Usuarios", path: "/admin-users" },
    { id: "admin-rols", icon: "fa-solid fa-users-gear", text: "Administrar Roles", path: "/admin-rols" },
    { id: "perfil", icon: "fa-solid fa-user", text: "Perfil", path: "/perfil" },
    { id: "nueva-factura", icon: "fa-solid fa-file-invoice", text: "Nueva Factura", path: "/factura" },
    { id: "reportes", icon: "fa-solid fa-chart-bar", text: "Reportes de Facturas", path: "/reportes" },
    { id: "productos", icon: "fa-solid fa-box", text: "Productos", path: "/productos" },
    { id: "clientes", icon: "fa-solid fa-users", text: "Clientes", path: "/clientes" },
    { id: "configuracion", icon: "fa-solid fa-cog", text: "Configuración", path: "/configuracion" },
    { id: "salir", icon: "fa-solid fa-sign-out-alt", text: "Salir", path: "/login" }
  ];

  // Sincronizar el menú activo con la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    
    if (activeItem) {
      setActiveMenu(activeItem.id);
    }
  }, [location.pathname]);

  const handleItem = (item) => {
    if (item.id === "salir") {
      logout();
      navigate("/login");
    } else {
      setActiveMenu(item.id);
      navigate(item.path);
    }
  };

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-2">
            <i className="fa-solid fa-receipt text-2xl"></i>
          </div>
          <h2 className="text-blue-400 text-xl font-bold">SmartBill</h2>
          <p className="text-sm text-gray-400 mt-1">Sistema de Facturación</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.id === "salir" ? "#" : item.path}
            onClick={(e) => {
              if (item.id === "salir") {
                e.preventDefault();
              }
              handleItem(item);
            }}
            className={`flex items-center px-5 py-3.5 mx-2 rounded-lg mb-1 transition-all duration-200 group ${
              activeMenu === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "text-gray-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <i className={`${item.icon} mr-3 text-lg w-5 ${
              activeMenu === item.id ? "text-white" : "text-gray-400 group-hover:text-white"
            }`}></i>
            <span className="font-medium">{item.text}</span>
            
            {/* Indicador visual para item activo */}
            {activeMenu === item.id && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer opcional */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2024 SmartBill</p>
          <p className="mt-1">Versión 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;