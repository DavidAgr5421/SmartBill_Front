import { useState, useEffect } from 'react';
import api from '../../../api/apiClient';

export default function DeleteBillModal({ isOpen, onClose, bill, onDelete, token }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
            if (isOpen && bill) {
                fetchUser();
                fetchClient();
            }
    }, [isOpen, bill]);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            setError(null);
            
            await api.delete(`/bill/v1/api/${bill.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            onDelete(bill.id);
        } catch (err) {
            console.error('Error deleting bill:', err);
            setError('Error al eliminar la factura. Por favor intenta de nuevo.');
        } finally {
            setIsDeleting(false);
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
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mt-8 bg-red-100 rounded-full">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        ¿Eliminar Factura?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Esta acción no se puede deshacer. La factura será eliminada permanentemente.
                    </p>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 mb-6 text-left shadow-inner">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">ID de Factura:</span>
                                <span className="font-bold text-gray-900 text-lg">#{bill.id}</span>
                            </div>
                            <div className="h-px bg-gray-300"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Cliente:</span>
                                <span className="font-semibold text-gray-900">{clientData?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Usuario:</span>
                                <span className="font-semibold text-gray-900">{userData?.name || 'N/A'}</span>
                            </div>
                            <div className="h-px bg-gray-300"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Total:</span>
                                <span className="font-bold text-red-600 text-xl">{formatCurrency(bill.total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Método de Pago:</span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                    {bill.paymentMethod}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Fecha:</span>
                                <span className="text-sm text-gray-700">{formatDate(bill.creationDate)}</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-600 text-left">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Eliminando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Eliminar Factura</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}