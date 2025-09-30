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
    const [showFilters, setShowFilters] = useState(false);

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
        } catch (error) {
            console.error("Error fetching roles:", error);
            showToast("Error al cargar los roles", "error");
        }
    };

    const fetchUsers = async (page = 0) => {
        try {
            setLoading(true);
            const searchRequest = {
                name: filters.name || null,
                email: filters.email || null,
                rolId: filters.rolId ? parseInt(filters.rolId) : null,
                active: filters.active !== "" ? filters.active === "true" : null
            };

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
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        fetchUsers(0);
        setShowFilters(false);
    };

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

    const activeUsers = users.filter(u => u.active).length;
    const inactiveUsers = users.filter(u => !u.active).length;

    return (
        <>
            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                .animate-slideDown { animation: slideDown 0.4s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
                .animate-fadeInRow { animation: fadeIn 0.5s ease-out; }
            `}</style>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 animate-fadeIn">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Administración de Usuarios
                        </h1>
                        <p className="text-gray-600 text-lg">Gestiona y busca usuarios del sistema</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fadeIn">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-semibold uppercase">Total Usuarios</p>
                                    <p className="text-3xl font-bold mt-2">{pagination.totalElements}</p>
                                </div>
                                <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-semibold uppercase">Activos</p>
                                    <p className="text-3xl font-bold mt-2">{activeUsers}</p>
                                </div>
                                <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-semibold uppercase">Inactivos</p>
                                    <p className="text-3xl font-bold mt-2">{inactiveUsers}</p>
                                </div>
                                <svg className="w-12 h-12 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-semibold uppercase">Roles</p>
                                    <p className="text-3xl font-bold mt-2">{roles.length}</p>
                                </div>
                                <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-scaleIn">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtros de Búsqueda
                            </h2>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
                            >
                                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                                <svg className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {showFilters && (
                            <div className="animate-slideDown">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={filters.name}
                                            onChange={handleFilterChange}
                                            placeholder="Buscar por nombre..."
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                                        <select
                                            name="rolId"
                                            value={filters.rolId}
                                            onChange={handleFilterChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 transform hover:scale-105 shadow-md"
                                    >
                                        {loading ? "Buscando..." : "Buscar"}
                                    </button>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabla de Usuarios */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-scaleIn">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Listado de Usuarios
                            </h2>
                            <button
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg shadow-md transition-all transform hover:scale-105 font-semibold flex items-center gap-2"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Agregar Usuario
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha Creación</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                                                    <p className="mt-4 text-gray-600 font-semibold">Cargando usuarios...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <p className="text-lg font-semibold">No se encontraron usuarios</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr 
                                                key={user.id} 
                                                className="hover:bg-blue-50 transition-all duration-300 animate-fadeInRow"
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                <td className="px-6 py-4 text-sm font-bold">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                        #{user.id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                                        {user.rolId.rolName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                                                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 shadow-md"
                                                            onClick={() => {setSelectedUser(user); setShowEditModal(true)}}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 shadow-md"
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
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-600 font-medium">
                                    Mostrando {pagination.page * pagination.size + 1} a {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} de {pagination.totalElements} usuarios
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 0}
                                        className="px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
                                    >
                                        ← Anterior
                                    </button>
                                    <span className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold shadow-md">
                                        {pagination.page + 1} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages - 1}
                                        className="px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modales */}
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