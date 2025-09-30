import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/mainlayouts";
import NuevaFactura from "./pages/facturacion";
import LoginPage from "./pages/login";
import Reset from "./pages/reset";

import PrivateRoute from "./context/PrivateRoute";
import Profile from "./pages/perfil";
import ConfigGlobal from "./pages/configGlobal";
import AdminBills from "./pages/adminBills";
import AdminUsers from "./pages/adminusers";
import ProductManagement from "./pages/productos";
import ClientManagement from "./pages/clientes";
import RoleManagement from "./pages/adminRols";
import ReportManagement from "./pages/reportes";

import {ProtectedRoute} from "./context/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset" element={<Reset />} />

        {/* Rutas privadas */}
        <Route path="/admin-users" element={<PrivateRoute><ProtectedRoute requiredPermissions={['createUser', 'deleteUser']}><MainLayout><AdminUsers /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/admin-bills" element={<PrivateRoute><ProtectedRoute requiredPermission={"viewHistory"}><MainLayout><AdminBills /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/admin-rols" element={<PrivateRoute><ProtectedRoute requiredPermissions={['createRol', 'deleteRol']}><MainLayout><RoleManagement /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/"element={<PrivateRoute><MainLayout><NuevaFactura /></MainLayout></PrivateRoute>}/>
        <Route path="/factura" element={<PrivateRoute><ProtectedRoute requiredPermission={"createBill"}><MainLayout><NuevaFactura /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/perfil" element={<PrivateRoute><ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/reportes" element={<PrivateRoute><ProtectedRoute requiredPermission="generateReports"><MainLayout><ReportManagement /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/configuracion" element={<PrivateRoute><ProtectedRoute requiredPermissions={['viewConfig', 'editConfig']}><MainLayout><ConfigGlobal /></MainLayout></ProtectedRoute></PrivateRoute>}/>
        <Route path="/productos" element={<PrivateRoute><ProtectedRoute requiredPermissions={['createProduct', 'deleteProduct']}><MainLayout><ProductManagement/></MainLayout></ProtectedRoute></PrivateRoute>}></Route>
        <Route path="/clientes" element={<PrivateRoute><ProtectedRoute><MainLayout><ClientManagement /></MainLayout></ProtectedRoute></PrivateRoute>}></Route>
      </Routes>
    </Router>
  );
}
