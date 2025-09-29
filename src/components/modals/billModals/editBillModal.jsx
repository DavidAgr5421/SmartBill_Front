import { useState, useEffect } from 'react';
import api from '../../../api/apiClient';

export default function EditBillModal({ isOpen, onClose, onUpdate, users, clients, token, billData }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        clientId: '',
        paymentMethod: '',
        total: ''
    });

    useEffect(() => {
        if (billData) {
            setFormData({
                userId: billData.userId || '',
                clientId: billData.clientId || '',
                paymentMethod: billData.paymentMethod || '',
                total: billData.total || ''
            });
        }
    }, [billData]);

    if (!isOpen || !billData) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.userId || !formData.clientId || !formData.paymentMethod || !formData.total) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (parseFloat(formData.total) <= 0) {
            setError('El total debe ser mayor a 0');
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);

            const updateData = {
                userId: parseInt(formData.userId),
                clientId: parseInt(formData.clientId),
                paymentMethod: formData.paymentMethod,
                total: parseFloat(formData.total)
            };

            await api.put(`/bill/v1/api/${billData.id}`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            onUpdate(updateData);
        } catch (err) {
            console.error('Error updating bill:', err);
            setError(err.response?.data?.message || 'Error al actualizar la factura');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Editar Factura</h2>
                            <p className="text-yellow-100 text-sm">ID: #{billData.id}</p>
                        </div>
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
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Usuario <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white transition-all"
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Cliente <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white transition-all"
                                >
                                    <option value="">Seleccionar cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Método de Pago <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white transition-all"
                                >
                                    <option value="">Seleccionar método</option>
                                    <option value="CASH">💵 Efectivo</option>
                                    <option value="CREDIT_CARD">💳 Tarjeta</option>
                                    <option value="TRANSFER">🏦 Transferencia</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="text-gray-500 font-semibold">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="total"
                                    value={formData.total}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Ingresa el nuevo valor total de la factura</p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            disabled={isUpdating}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isUpdating}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Actualizando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Actualizar Factura</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}