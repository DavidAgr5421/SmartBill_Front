import React, { useState } from "react";
import api from "../../../api/apiClient";

const DeleteUserModal = ({ isOpen, onClose, user, onDelete}) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    console.log(user)

    const handleDelete = async () => {
        setError("");
        try {
            setLoading(true);
            const response = await api.delete(`/users/v1/api/${user.id}`);
            console.log("Usuario eliminado:", response);
            setSuccess(true);

            if(onDelete) onDelete(user.id);
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo eliminar el usuario.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError("");
        setSuccess(false);
        onClose();
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
                
                @keyframes successPop {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .modal-overlay {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .modal-content {
                    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .success-animation {
                    animation: successPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>

            <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:rotate-90 hover:scale-110"
                        onClick={handleClose}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {!success ? (
                        <>
                            {/* Icon Warning */}
                            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.22 5.22a9 9 0 1112.73 12.73A9 9 0 015.22 5.22z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold mb-3 text-gray-800 text-center">
                                Eliminar usuario
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm text-center leading-relaxed">
                                ¿Estás seguro que deseas eliminar al usuario{" "}
                                <span className="font-semibold text-red-600">{user.name}</span>?  
                                Esta acción no se puede deshacer.
                            </p>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="w-1/2 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold transition-all duration-300 hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className={`w-1/2 py-3 rounded-lg bg-red-600 text-white font-semibold transition-all duration-300 transform hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                        loading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Eliminando...</span>
                                        </div>
                                    ) : (
                                        "Eliminar"
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center success-animation">
                            {/* Success Icon */}
                            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold mb-3 text-gray-800">¡Usuario eliminado!</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                El usuario <span className="font-semibold">{user.name}</span> fue eliminado correctamente.
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold transition-all duration-300 transform hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DeleteUserModal;
