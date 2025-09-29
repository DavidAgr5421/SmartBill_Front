import React, { useState } from "react";
import api from "../../api/apiClient";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("El correo es obligatorio");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Por favor ingresa un correo válido.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/recovery", { email });
            console.log(response)
            setSuccess(response.data.message || "Correo enviado correctamente.");
        } catch (err) {
            setError(err.response?.data || "No se pudo enviar el correo.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
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
                
                @keyframes emailSent {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
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
                
                .email-icon {
                    animation: emailSent 2s ease-in-out infinite;
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
                            {/* Icon */}
                            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold mb-3 text-gray-800 text-center">
                                Recuperar contraseña
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm text-center leading-relaxed">
                                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        placeholder="tucorreo@ejemplo.com"
                                        className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 transform focus:scale-[1.02] ${
                                            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField(true)}
                                        onBlur={() => setFocusedField(false)}
                                    />
                                    {focusedField && !error && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg animate-slideUp">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg bg-blue-600 text-white font-semibold transition-all duration-300 transform hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Enviando...</span>
                                        </div>
                                    ) : (
                                        'Enviar enlace'
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center success-animation">
                            {/* Success Icon */}
                            <div className="email-icon flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold mb-3 text-gray-800">¡Correo enviado!</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Si el correo es correcto, recibirás un enlace para restablecer tu contraseña.
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

export default ForgotPasswordModal;