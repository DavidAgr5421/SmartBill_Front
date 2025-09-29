import React, { useState } from "react";
import api from "../../../api/apiClient";

export default function CreateUserModal({ isOpen, onClose, onCreate, roles, token }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
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
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }
        
        if (!formData.email.trim()) {
            newErrors.email = "El correo es requerido";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Correo electrónico inválido";
        }
        
        if (!formData.password) {
            newErrors.password = "La contraseña es requerida";
        } else if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }
        
        if (!formData.role) {
            newErrors.role = "Debes seleccionar un rol";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ CORREGIDO: Faltaban los paréntesis ()
        if(!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/users/v1/api/new",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    rolId: formData.role
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log("Usuario creado: ", response.data);

            // ✅ CORREGIDO: Mostrar pantalla de éxito
            setSuccess(true);

            // Llamar onCreate después de mostrar éxito
            console.log(response.data)
            if(onCreate) onCreate(response.data);

        } catch(error) {
            console.error("Error al crear usuario: ", error);
            
            // ✅ MEJORADO: Mostrar errores del servidor
            if (error.response?.data?.message) {
                setErrors({ 
                    submit: error.response.data.message 
                });
            } else {
                setErrors({ 
                    submit: "Error al crear el usuario. Por favor intenta de nuevo." 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: "", email: "", password: "", role: "" });
        setErrors({});
        setShowPassword(false);
        setFocusedField(null);
        setSuccess(false);
        setLoading(false);
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
                    {/* Botón de cerrar */}
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
                            {/* Ícono de usuario */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
                                Crear nuevo usuario
                            </h2>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Completa la información para agregar un nuevo usuario al sistema
                            </p>

                            {/* Error general del servidor */}
                            {errors.submit && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-700">{errors.submit}</p>
                                </div>
                            )}

                            {/* Formulario */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Campo Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ej: Juan Pérez"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            errors.name 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Campo Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="correo@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            errors.email 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Campo Contraseña */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            disabled={loading}
                                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                                errors.password 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Campo Rol */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rol del usuario
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('role')}
                                        onBlur={() => setFocusedField(null)}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            errors.role 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    >
                                        <option value="">Selecciona un rol</option>
                                        {roles && roles.map((role) => (
                                            <option key={role.rolId} value={role.rolId}>
                                                {role.rolName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.role}
                                        </p>
                                    )}
                                </div>

                                {/* Botones */}
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
                                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
                                            "Crear Usuario"
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
                            <h2 className="text-2xl font-bold mb-3 text-gray-800">¡Usuario Creado!</h2>
                            <p className="text-gray-600 mb-8">El usuario se ha creado correctamente en el sistema.</p>
                            <button  
                                onClick={handleClose}  
                                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105"
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