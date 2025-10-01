import React, { useState } from "react";
import api from "../../../api/apiClient";

export default function CreateBillModal({ isOpen, onClose, onCreate, users, clients, token }) {
    const [formData, setFormData] = useState({
        userId: "",
        clientId: "",
        total: "",
        paymentMethod: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.userId) {
            newErrors.userId = "Debes seleccionar un usuario";
        }
        
        if (!formData.clientId) {
            newErrors.clientId = "Debes seleccionar un cliente";
        }
        
        if (!formData.total) {
            newErrors.total = "El total es requerido";
        } else if (isNaN(formData.total) || parseInt(formData.total) <= 0) {
            newErrors.total = "El total debe ser un número mayor a 0";
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = "Debes seleccionar un método de pago";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/bill/v1/api/new",
                {
                    userId: parseInt(formData.userId),
                    clientId: parseInt(formData.clientId),
                    total: parseInt(formData.total),
                    paymentMethod: formData.paymentMethod
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess(true);

            if(onCreate) onCreate(response.data);

        } catch(error) {
            console.error("Error al crear factura: ", error);
            
            if (error.response?.data?.message) {
                setErrors({ 
                    submit: error.response.data.message 
                });
            } else {
                setErrors({ 
                    submit: "Error al crear la factura. Por favor intenta de nuevo." 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ userId: "", clientId: "", total: "", paymentMethod: "" });
        setErrors({});
        setSuccess(false);
        setLoading(false);
        onClose();
    };

    const formatCurrency = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat('es-CO').format(value);
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes checkmark {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .modal-overlay {
                    animation: fadeIn 0.3s ease-out;
                }

                .modal-content {
                    animation: slideUp 0.4s ease-out;
                }

                .success-checkmark {
                    animation: checkmark 0.5s ease-out;
                }
            `}</style>

            <div 
                className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
                onClick={!loading ? handleClose : undefined}
            >
                <div 
                    className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleClose}
                        type="button"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {!success ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
                                Crear nueva factura
                            </h2>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Completa la información para crear una factura
                            </p>

                            {errors.submit && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-700">{errors.submit}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usuario
                                    </label>
                                    <select
                                        name="userId"
                                        value={formData.userId}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            errors.userId 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    >
                                        <option value="">Selecciona un usuario</option>
                                        {users && users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.userId && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.userId}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cliente
                                    </label>
                                    <select
                                        name="clientId"
                                        value={formData.clientId}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            errors.clientId 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    >
                                        <option value="">Selecciona un cliente</option>
                                        {clients && clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.clientId && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.clientId}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            name="total"
                                            placeholder="0"
                                            value={formData.total}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                                errors.total 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        />
                                    </div>
                                    {formData.total && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatCurrency(formData.total)} COP
                                        </p>
                                    )}
                                    {errors.total && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.total}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Método de Pago
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            errors.paymentMethod 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    >
                                        <option value="">Selecciona un método</option>
                                        <option value="EFECTIVO">Efectivo</option>
                                        <option value="TARJETA">Tarjeta</option>
                                        <option value="TRANSFERENCIA">Transferencia</option>
                                    </select>
                                    {errors.paymentMethod && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.paymentMethod}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Creando...</span>
                                            </div>
                                        ) : (
                                            "Crear Factura"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="success-checkmark flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-gray-800">¡Factura Creada!</h2>
                            <p className="text-gray-600 mb-8">La factura se ha creado correctamente en el sistema.</p>
                            <button  
                                onClick={handleClose}  
                                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}