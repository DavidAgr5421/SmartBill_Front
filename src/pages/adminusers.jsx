import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

import CreateUserModal from "../components/modals/usersModals/adduserModal";
import DeleteUserModal from "../components/modals/usersModals/deleteUserModal";
import EditUserModal from "../components/modals/usersModals/editUserModal";

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColorMap = {
        success: 'bg-green-500',
        update: 'bg-blue-500',
        delete: 'bg-red-500',
    };

    const bgColor = bgColorMap[type] || 'bg-gray-500';
    return (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
            <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
                <span className="flex-1">{message}</span>
                <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded p-1">×</button>
            </div>
        </div>
    );
};

export default function AdminUsers() {

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });

    const [filters, setFilters] = useState({
        name: "",
        email: "",
        rolId: "",
        active: ""
    });

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/users-rol/v1/api', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRoles(response.data);
            console.log("Roles cargados:", response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
            showToast("Error al cargar los roles", "error");
        }
    };

    const fetchUsers = async (page = 0) => {
        try {
            console.log(filters);
            setLoading(true);
            const searchRequest = {
                name: filters.name || null,
                email: filters.email || null,
                rolId: filters.rolId ? parseInt(filters.rolId) : null,
                active: filters.active !== "" ? filters.active === "true" : null
            };

            console.log(searchRequest);

            const response = await api.post(`/users/v1/api?page=${page}&size=${pagination.size}`,
                searchRequest,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setUsers(response.data.content);
            setPagination({
                page: response.data.number,
                size: response.data.size,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast("Error al cargar usuarios", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => setToast({ message, type });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log("Cambio filtro:", name, value);
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => fetchUsers(0);

    const handleClearFilters = () => {
        setFilters({ name: "", email: "", rolId: "", active: "" });
        setTimeout(() => fetchUsers(0), 0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchUsers(newPage);
        }
    };

    const handleCreateUser = (newUser) => {
        // ✅ Refrescar la lista desde el servidor en lugar de agregar manualmente
        fetchUsers(pagination.page);
        showToast("Usuario creado exitosamente", "success");
        setShowCreateModal(false);
    }

    const handleUserDelete = (userId) => {
        fetchUsers(pagination.page);
        showToast("Usuario eliminado exitosamente", "delete");
        setShowDeleteModal(false);
        setSelectedUser(null);
    }

    const handleUserUpdate = (updatedUser) => {
        fetchUsers(pagination.page);
        showToast("Usuario actualizado exitosamente", "update");
        setShowEditModal(false);
        setSelectedUser(null);
    };

    return (
        <>
            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
            `}</style>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Administración de Usuarios</h1>
                        <p className="text-gray-600">Gestiona y busca usuarios del sistema</p>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtros de Búsqueda</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    placeholder="Buscar por nombre..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={filters.email}
                                    onChange={handleFilterChange}
                                    placeholder="Buscar por email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                                <select
                                    name="rolId"
                                    value={filters.rolId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los roles</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.rolId}>{role.rolName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    name="active"
                                    value={filters.active}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Activos</option>
                                    <option value="false">Inactivos</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Tabla de Usuarios */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Encabezado con botón agregar */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800">Usuarios</h2>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                                onClick={() => setShowCreateModal(true)}
                            >
                                + Agregar Usuario
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha Creación</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron usuarios
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {user.rolId.rolName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(user.creationDate).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                                                            onClick={() => {setSelectedUser(user); setShowEditModal(true)}}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                                            onClick={() => {setSelectedUser(user); setShowDeleteModal(true)}}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {!loading && users.length > 0 && (
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Mostrando {pagination.page * pagination.size + 1} a {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} de {pagination.totalElements} usuarios
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 0}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                        {pagination.page + 1} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages - 1}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ✅ MODALES - Solo renderizar cuando están abiertos */}
                    {showCreateModal && (
                        <CreateUserModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onCreate={handleCreateUser}
                            roles={roles}
                            token={token}
                        />
                    )}

                    {showDeleteModal && (
                        <DeleteUserModal 
                            isOpen={showDeleteModal}
                            onClose={() => {
                                setShowDeleteModal(false);
                                setSelectedUser(null);
                            }}
                            user={selectedUser}
                            onDelete={handleUserDelete}
                        />
                    )}

                    {showEditModal && (
                        <EditUserModal 
                            isOpen={showEditModal}
                            onClose={() => {
                                setShowEditModal(false);
                                setSelectedUser(null);
                            }}
                            onUpdate={handleUserUpdate}
                            roles={roles}
                            token={token}
                            userData={selectedUser}
                        />
                    )}
                </div>
            </div>
        </>
    );
}