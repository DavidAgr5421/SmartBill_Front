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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset" element={<Reset />} />

        {/* Rutas privadas */}
        <Route path="/admin-users" element={<PrivateRoute><MainLayout><AdminUsers /></MainLayout></PrivateRoute>}/>
        <Route path="/admin-bills" element={<PrivateRoute><MainLayout><AdminBills /></MainLayout></PrivateRoute>}/>
        <Route path="/"element={<PrivateRoute><MainLayout><NuevaFactura /></MainLayout></PrivateRoute>}/>
        <Route path="/factura" element={<PrivateRoute><MainLayout><NuevaFactura /></MainLayout></PrivateRoute>}/>
        <Route path="/perfil" element={<PrivateRoute><MainLayout><Profile /></MainLayout></PrivateRoute>}/>
        <Route path="/configuracion" element={<PrivateRoute> <MainLayout><ConfigGlobal /></MainLayout></PrivateRoute>}/>
      </Routes>
    </Router>
  );
}
