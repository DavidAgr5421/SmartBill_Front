import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

import DeleteBillModal from "../components/modals/billModals/deteleBillModal";
import EditBillModal from "../components/modals/billModals/editBillModal";
import BillDetailsModal from "../components/modals/billModals/billDetailsModal";

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

export default function AdminBills() {

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [selectedBill, setSelectedBill] = useState(null);

    const { token } = useAuth();
    const [bills, setBills] = useState([]);
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });

    const [filters, setFilters] = useState({
        userId: "",
        clientId: "",
        startTotal: "",
        endTotal: "",
        paymentMethod: "",
        startCreationDate: "",
        endCreationDate: ""
    });

    useEffect(() => {
        fetchUsers();
        fetchClients();
        fetchBills();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/v1/api', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
            console.log("Usuarios cargados:", response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast("Error al cargar los usuarios", "error");
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('/client/v1/api', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClients(response.data);
            console.log("Clientes cargados:", response.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
            showToast("Error al cargar los clientes", "error");
        }
    };

    const fetchBills = async (page = 0) => {
        try {
            setLoading(true);
            const searchRequest = {
                userId: filters.userId ? parseInt(filters.userId) : null,
                clientId: filters.clientId ? parseInt(filters.clientId) : null,
                startTotal: filters.startTotal ? parseInt(filters.startTotal) : null,
                endTotal: filters.endTotal ? parseInt(filters.endTotal) : null,
                paymentMethod: filters.paymentMethod || null,
                startCreationDate: filters.startCreationDate || null,
                endCreationDate: filters.endCreationDate || null
            };

            console.log("Search request:", searchRequest);

            const response = await api.post(`/bill/v1/api?page=${page}&size=${pagination.size}`,
                searchRequest,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setBills(response.data.content);
            setPagination({
                page: response.data.number,
                size: response.data.size,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements
            });
        } catch (error) {
            console.error("Error fetching bills:", error);
            showToast("Error al cargar facturas", "error");
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

    const handleSearch = () => fetchBills(0);

    const handleClearFilters = () => {
        setFilters({ 
            userId: "", 
            clientId: "", 
            startTotal: "", 
            endTotal: "", 
            paymentMethod: "",
            startCreationDate: "",
            endCreationDate: ""
        });
        setTimeout(() => fetchBills(0), 0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchBills(newPage);
        }
    };

    const handleBillDelete = (billId) => {
        fetchBills(pagination.page);
        showToast("Factura eliminada exitosamente", "delete");
        setShowDeleteModal(false);
        setSelectedBill(null);
    };

    const handleBillUpdate = (updatedBill) => {
        fetchBills(pagination.page);
        showToast("Factura actualizada exitosamente", "update");
        setShowEditModal(false);
        setSelectedBill(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
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
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Administración de Facturas</h1>
                        <p className="text-gray-600">Gestiona y busca facturas del sistema</p>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtros de Búsqueda</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                                <select
                                    name="userId"
                                    value={filters.userId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los usuarios</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                                <select
                                    name="clientId"
                                    value={filters.clientId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los clientes</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                <select
                                    name="paymentMethod"
                                    value={filters.paymentMethod}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Mínimo</label>
                                <input
                                    type="number"
                                    name="startTotal"
                                    value={filters.startTotal}
                                    onChange={handleFilterChange}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Máximo</label>
                                <input
                                    type="number"
                                    name="endTotal"
                                    value={filters.endTotal}
                                    onChange={handleFilterChange}
                                    placeholder="999999"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                                <input
                                    type="date"
                                    name="startCreationDate"
                                    value={filters.startCreationDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                                <input
                                    type="date"
                                    name="endCreationDate"
                                    value={filters.endCreationDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
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

                    {/* Tabla de Facturas */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Encabezado con botón agregar */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800">Facturas</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Método de Pago</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
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
                                    ) : bills.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron facturas
                                            </td>
                                        </tr>
                                    ) : (
                                        bills.map(bill => (
                                            <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900">{bill.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {bill.userName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {bill.clientName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(bill.total)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                        {bill.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(bill.creationDate).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                                                            onClick={() => {setSelectedBill(bill); setShowDetailsModal(true)}}
                                                        >
                                                            Ver Detalles
                                                        </button>
                                                        <button
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                                                            onClick={() => {setSelectedBill(bill); setShowEditModal(true)}}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                                            onClick={() => {setSelectedBill(bill); setShowDeleteModal(true)}}
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
                        {!loading && bills.length > 0 && (
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Mostrando {pagination.page * pagination.size + 1} a {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} de {pagination.totalElements} facturas
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

                    {/* Modales */}
                    {showDeleteModal && (
                        <DeleteBillModal 
                            isOpen={showDeleteModal}
                            onClose={() => {
                                setShowDeleteModal(false);
                                setSelectedBill(null);
                            }}
                            bill={selectedBill}
                            onDelete={handleBillDelete}
                            token={token}
                        />
                    )}

                    {showEditModal && (
                        <EditBillModal 
                            isOpen={showEditModal}
                            onClose={() => {
                                setShowEditModal(false);
                                setSelectedBill(null);
                            }}
                            onUpdate={handleBillUpdate}
                            users={users}
                            clients={clients}
                            token={token}
                            billData={selectedBill}
                        />
                    )}

                    {showDetailsModal && (
                        <BillDetailsModal 
                            isOpen={showDetailsModal}
                            onClose={() => {
                                setShowDetailsModal(false);
                                setSelectedBill(null);
                            }}
                            bill={selectedBill}
                            token={token}
                        />
                    )}
                </div>
            </div>
        </>
    );
}