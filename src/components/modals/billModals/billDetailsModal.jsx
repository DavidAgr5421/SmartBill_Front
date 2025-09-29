import { useState, useEffect } from 'react';
import api from '../../../api/apiClient';

export default function BillDetailsModal({ isOpen, onClose, bill, token }) {
    const [billDetails, setBillDetails] = useState(null);
    const [userData, setUserData] = useState(null);
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && bill) {
            fetchBillDetails();
            fetchUser();
            fetchClient();
        }
    }, [isOpen, bill]);

    if (!isOpen || !bill) return null;

    const fetchBillDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get(`/bill/v1/api/${bill.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setBillDetails(response.data);
        } catch (err) {
            console.error('Error fetching bill details:', err);
            setError('Error al cargar los detalles de la factura');
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null)

            const response = await api.get(`users/v1/api/${bill.userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setUserData(response.data);
        }catch(err){
            console.error("Error fetching user data: ",err);
            setError('Error al cargar los datos del usuario');
        }finally{
            setLoading(false);
        }
    }

    const fetchClient = async () => {
        try {
            setLoading(true);
            setError(null)

            const response = await api.get(`client/v1/api/${bill.clientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setClientData(response.data);
        }catch(err){
            console.error("Error fetching client data: ",err);
            setError('Error al cargar los datos del cliente');
        }finally{
            setLoading(false);
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold">Detalles de Factura</h2>
                        <p className="text-blue-100 text-sm">ID: #{bill.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : billDetails ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Información del Usuario
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-blue-700">Nombre</p>
                                            <p className="font-semibold text-gray-900">{userData.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700">Email</p>
                                            <p className="text-sm text-gray-700">{userData.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Información del Cliente
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-purple-700">Nombre</p>
                                            <p className="font-semibold text-gray-900">{clientData.name|| 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-purple-700">Email</p>
                                            <p className="text-sm text-gray-700">{clientData.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                                <h3 className="text-sm font-semibold text-green-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Detalles de la Factura
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-green-700 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(billDetails.total)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-700 mb-1">Método de Pago</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                            {billDetails.paymentMethod}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-700 mb-1">Fecha de Creación</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatDate(billDetails.creationDate)}</p>
                                    </div>
                                </div>
                            </div>

                            {billDetails.billItems && billDetails.billItems.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Items de la Factura ({billDetails.billItems.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Producto</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Precio Unit.</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {billDetails.billItems.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-100">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.productId?.name || 'N/A'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.price)}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                                            {formatCurrency(item.quantity * item.price)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}