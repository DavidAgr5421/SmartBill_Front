import { useRef, useState, useEffect } from 'react';

export default function PrintBill({ bill, billDetails, onClose }) {
    const printRef = useRef();
    const [printConfig, setPrintConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:8080/config/v1/api';

    useEffect(() => {
        loadActiveConfig();
    }, []);

    const getAuthToken = () => {
        return localStorage.getItem('authToken') || '';
    };

    const loadActiveConfig = async () => {
        try {
            const activeConfigId = localStorage.getItem('smartbill_active_config_id');
            
            if (!activeConfigId) {
                await loadDefaultConfig();
                return;
            }

            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/${activeConfigId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                await loadDefaultConfig();
                return;
            }

            const config = await response.json();
            setPrintConfig(config);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar configuración:", error);
            await loadDefaultConfig();
        }
    };

    const loadDefaultConfig = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(API_BASE_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.content && data.content.length > 0) {
                    setPrintConfig(data.content[0]);
                    localStorage.setItem('smartbill_active_config_id', data.content[0].id.toString());
                } else {
                    setPrintConfig(getDefaultConfig());
                }
            } else {
                setPrintConfig(getDefaultConfig());
            }
        } catch (error) {
            console.error("Error al cargar configuración por defecto:", error);
            setPrintConfig(getDefaultConfig());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultConfig = () => {
        return {
            configName: 'Configuración por Defecto',
            nit: '900.XXX.XXX-X',
            contact: 'info@empresa.com',
            footer: '¡Gracias por su compra!',
            paperWidth: 80,
            fontSize: 12,
            logoType: 'TEXT',
            qrType: 'NONE'
        };
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
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

    const calculateSubtotal = () => {
        if (!billDetails || billDetails.length === 0) return 0;
        return billDetails.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    };

    if (!bill) return null;

    if (loading || !printConfig) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="text-gray-600">Cargando configuración...</p>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = calculateSubtotal();
    const total = bill.total || subtotal;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="no-print sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                    <h2 className="text-xl font-bold">Vista Previa de Impresión</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div ref={printRef} className="p-8 print-content" style={{ fontSize: `${printConfig.fontSize}px` }}>
                    <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {printConfig.configName || 'MI EMPRESA'}
                        </h1>
                        {printConfig.contact && (
                            <p className="text-sm text-gray-600">Email: {printConfig.contact}</p>
                        )}
                        <p className="text-sm text-gray-600">NIT: {printConfig.nit}</p>
                    </div>

                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-700">FACTURA #:</p>
                                <p className="text-lg font-bold text-gray-900">{bill.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-700">FECHA:</p>
                                <p className="text-gray-900">{formatDate(bill.creationDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                        <div>
                            <p className="font-semibold text-gray-700 mb-2">CLIENTE:</p>
                            <p className="text-gray-900">{bill.clientId?.name || 'N/A'}</p>
                            {bill.clientId?.email && (
                                <p className="text-sm text-gray-600">{bill.clientId.email}</p>
                            )}
                            {bill.clientId?.phone && (
                                <p className="text-sm text-gray-600">{bill.clientId.phone}</p>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-2">ATENDIDO POR:</p>
                            <p className="text-gray-900">{bill.userId?.name || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg border-b border-gray-300 pb-2">
                            DETALLE DE PRODUCTOS
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">PRODUCTO</th>
                                    <th className="text-center py-2 px-2 font-semibold text-gray-700">CANT.</th>
                                    <th className="text-right py-2 px-2 font-semibold text-gray-700">P. UNIT.</th>
                                    <th className="text-right py-2 px-2 font-semibold text-gray-700">SUBTOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billDetails && billDetails.length > 0 ? (
                                    billDetails.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-gray-900">
                                                    {item.productId?.name || 'N/A'}
                                                </div>
                                                {item.observation && item.observation !== 'Null' && item.observation !== '' && (
                                                    <div className="text-xs text-gray-500 italic mt-1">
                                                        Obs: {item.observation}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center py-3 px-2 text-gray-900">{item.amount}</td>
                                            <td className="text-right py-3 px-2 text-gray-900">{formatCurrency(item.unitPrice)}</td>
                                            <td className="text-right py-3 px-2 font-semibold text-gray-900">
                                                {formatCurrency(item.subTotal)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">
                                            No hay detalles disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mb-6 border-t-2 border-gray-300 pt-4">
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="flex justify-between py-2 text-gray-700">
                                    <span className="font-semibold">SUBTOTAL:</span>
                                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-gray-300">
                                    <span className="font-semibold text-gray-700">MÉTODO DE PAGO:</span>
                                    <span className="text-gray-900">{bill.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between py-3 border-t-2 border-gray-400 mt-2">
                                    <span className="text-xl font-bold text-gray-800">TOTAL:</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8 pt-6 border-t border-gray-300">
                        {printConfig.footer && (
                            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                                {printConfig.footer}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Este documento es una representación impresa de la factura electrónica
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Generado por SmartBill - Sistema de Facturación
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-content, .print-content * {
                        visibility: visible;
                    }
                    .print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        margin: 1cm;
                        size: ${printConfig.paperWidth}mm auto;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                
                @media screen {
                    .print-content {
                        background: white;
                        max-width: ${printConfig.paperWidth}mm;
                        margin: 0 auto;
                    }
                }
            `}</style>
        </div>
    );
}