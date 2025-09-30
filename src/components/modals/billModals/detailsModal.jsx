import React from 'react';

const BillDetailModal = ({ isOpen, onClose, bill, billDetails, formatCurrency, formatDate }) => {
    if (!isOpen || !bill) return null;

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
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-5 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold">Factura #{bill.id}</h3>
                        <p className="text-blue-100 text-sm mt-1">Detalles completos de la transacción</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300 transform hover:rotate-90"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Bill Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fadeInUp">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold uppercase">Cliente</p>
                                    <p className="font-bold text-gray-900 text-lg">{bill.clientName || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-purple-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-purple-600 font-semibold uppercase">Fecha</p>
                                    <p className="font-bold text-gray-900">{formatDate(bill.creationDate)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-green-600 font-semibold uppercase">Método de Pago</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getPaymentMethodBadge(bill.paymentMethod)}`}>
                                        {getPaymentMethodLabel(bill.paymentMethod)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-yellow-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-yellow-600 font-semibold uppercase">Total</p>
                                    <p className="font-bold text-gray-900 text-2xl">{formatCurrency(bill.total)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h4 className="font-bold text-gray-800 text-lg">Productos</h4>
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {billDetails.length} items
                            </span>
                        </div>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Producto</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Precio Unit.</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {billDetails.length > 0 ? (
                                            billDetails.map((detail, index) => (
                                                <tr 
                                                    key={index} 
                                                    className="hover:bg-blue-50 transition-colors duration-200 animate-fadeInUp"
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {detail.product?.name || 'Producto no encontrado'}
                                                            </p>
                                                            {detail.product?.description && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {detail.product.description}
                                                                </p>
                                                            )}
                                                            {detail.observation && detail.observation !== 'Null' && (
                                                                <p className="text-xs text-gray-500 italic mt-1 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {detail.observation}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                                                            {detail.amount}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-gray-700 font-medium">
                                                        {formatCurrency(detail.product?.unitPrice || detail.unitPrice || 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                        {formatCurrency(detail.subTotal)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    No hay productos en esta factura
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Total Summary */}
                        {billDetails.length > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex justify-between items-center text-white">
                                    <span className="text-lg font-semibold">Total de la Factura:</span>
                                    <span className="text-3xl font-bold">{formatCurrency(bill.total)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
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
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out;
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    );
};

export default BillDetailModal;