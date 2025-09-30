import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import BillDetailModal from '../components/modals/billModals/detailsModal';

const BillHistory = () => {
    const { id: userId, token } = useAuth();
    const [bills, setBills] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [billDetails, setBillDetails] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    const [filters, setFilters] = useState({
        clientId: '',
        startTotal: '',
        endTotal: '',
        paymentMethod: '',
        startCreationDate: '',
        endCreationDate: ''
    });

    useEffect(() => {
        fetchClients();
        fetchBills();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.post('client/v1/api', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClients(response.data.content || []);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchBills = async (page = 0) => {
        try {
            setLoading(true);
            const searchRequest = {
                userId: parseInt(userId),
                clientId: filters.clientId ? parseInt(filters.clientId) : null,
                startTotal: filters.startTotal ? parseInt(filters.startTotal) : null,
                endTotal: filters.endTotal ? parseInt(filters.endTotal) : null,
                paymentMethod: filters.paymentMethod || null,
                startCreationDate: filters.startCreationDate || null,
                endCreationDate: filters.endCreationDate || null
            };

            Object.keys(searchRequest).forEach(key => {
                if (searchRequest[key] === null || searchRequest[key] === '') {
                    delete searchRequest[key];
                }
            });

            searchRequest.userId = parseInt(userId);

            const response = await api.post(`bill/v1/api?page=${page}&size=${pagination.size}`,
                searchRequest,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setBills(response.data.content || []);
            setPagination({
                page: response.data.number,
                size: response.data.size,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements
            });
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBillDetails = async (billId) => {
        try {
            setLoadingDetails(true);
            const response = await api.post(`bill/${billId}/details`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const details = response.data || [];
            
            // Obtener información de cada producto
            const detailsWithProducts = await Promise.all(
                details.map(async (detail) => {
                    try {
                        const productResponse = await api.get(`product/v1/api/${detail.productId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        return {
                            ...detail,
                            product: productResponse.data
                        };
                    } catch (error) {
                        console.error(`Error fetching product ${detail.productId}:`, error);
                        return {
                            ...detail,
                            product: null
                        };
                    }
                })
            );
            
            setBillDetails(detailsWithProducts);
        } catch (error) {
            console.error("Error fetching bill details:", error);
            setBillDetails([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleViewDetails = async (bill) => {
        setSelectedBill(bill);
        setShowDetailsModal(true);
        await fetchBillDetails(bill.id);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedBill(null);
        setBillDetails([]);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        fetchBills(0);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({
            clientId: '',
            startTotal: '',
            endTotal: '',
            paymentMethod: '',
            startCreationDate: '',
            endCreationDate: ''
        });
        setTimeout(() => fetchBills(0), 100);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodBadge = (method) => {
        const colors = {
            'CASH': 'bg-green-100 text-green-800',
            'CREDIT_CARD': 'bg-blue-100 text-blue-800',
            'TRANSFER': 'bg-purple-100 text-purple-800',
            'OTHERS': 'bg-gray-100 text-gray-800'
        };
        return colors[method] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            'CASH': 'Efectivo',
            'CREDIT_CARD': 'Tarjeta',
            'TRANSFER': 'Transferencia',
            'OTHERS': 'Otros'
        };
        return labels[method] || method;
    };

    return (
        <div className="bg-white shadow-2xl rounded-2xl p-8 mt-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Historial de Facturas
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        {pagination.totalElements} factura{pagination.totalElements !== 1 ? 's' : ''} encontrada{pagination.totalElements !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg transform hover:scale-105"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtros
                </button>
            </div>

            {showFilters && (
                <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-inner animate-slideDown">
                    <h3 className="font-bold mb-4 text-gray-800 text-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Filtros de Búsqueda
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Cliente</label>
                            <select
                                value={filters.clientId}
                                onChange={(e) => handleFilterChange('clientId', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value="">Todos los clientes</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Método de Pago</label>
                            <select
                                value={filters.paymentMethod}
                                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value="">Todos</option>
                                <option value="CASH">Efectivo</option>
                                <option value="CREDIT_CARD">Tarjeta</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="OTHERS">Otros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Total Mínimo</label>
                            <input
                                type="number"
                                value={filters.startTotal}
                                onChange={(e) => handleFilterChange('startTotal', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Total Máximo</label>
                            <input
                                type="number"
                                value={filters.endTotal}
                                onChange={(e) => handleFilterChange('endTotal', e.target.value)}
                                placeholder="999999"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Fecha Desde</label>
                            <input
                                type="datetime-local"
                                value={filters.startCreationDate}
                                onChange={(e) => handleFilterChange('startCreationDate', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">Fecha Hasta</label>
                            <input
                                type="datetime-local"
                                value={filters.endCreationDate}
                                onChange={(e) => handleFilterChange('endCreationDate', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={handleClearFilters}
                            className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Cargando facturas...</p>
                </div>
            ) : bills.length === 0 ? (
                <div className="text-center py-16 text-gray-500 animate-fadeIn">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xl font-semibold">No tienes facturas registradas</p>
                    <p className="text-sm text-gray-400 mt-2">Las facturas que crees aparecerán aquí</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Método</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {bills.map((bill, index) => (
                                    <tr 
                                        key={bill.id} 
                                        className="hover:bg-blue-50 transition-all duration-300 animate-fadeInUp"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                #{bill.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{bill.clientName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(bill.creationDate)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-bold text-right">
                                            {formatCurrency(bill.total)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentMethodBadge(bill.paymentMethod)}`}>
                                                {getPaymentMethodLabel(bill.paymentMethod)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(bill)}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-3 animate-fadeIn">
                            <button
                                onClick={() => fetchBills(pagination.page - 1)}
                                disabled={pagination.page === 0}
                                className="px-5 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
                            >
                                ← Anterior
                            </button>
                            <span className="px-6 py-2.5 text-gray-700 font-bold bg-white rounded-lg shadow-md border border-gray-200">
                                Página {pagination.page + 1} de {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchBills(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages - 1}
                                className="px-5 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </>
            )}

            <BillDetailModal
                isOpen={showDetailsModal}
                onClose={handleCloseModal}
                bill={selectedBill}
                billDetails={billDetails}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                loading={loadingDetails}
            />

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes fadeInUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }

                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out;
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    );
};

export default BillHistory;