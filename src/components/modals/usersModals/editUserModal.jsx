import React, { useState, useEffect } from "react";
import api from "../../../api/apiClient";

export default function EditUserModal({ isOpen, onClose, onUpdate, roles, token, userData }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        active: ""
    });

    console.log(userData)

    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ✅ Prellenar los campos cuando se abra el modal
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                password: "", // vacío, solo se cambia si el admin escribe algo
                role: userData.rolId?.rolId || "",
                active: userData.active ?? true
            });
        }
    }, [userData]);

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
        
        if (!formData.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }
        
        if (!formData.email.trim()) {
            newErrors.email = "El correo es requerido";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Correo electrónico inválido";
        }

        // 🔹 La contraseña ya NO es obligatoria en edición
        if (formData.password && formData.password.length < 6) {
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
        if (!validateForm()) return;

        setLoading(true);
        setSuccess(false);
        try {
            const response = await api.put(`/users/v1/api/${userData.id}`, 
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password || undefined, // solo si cambia
                    rolId: formData.role,
                    active: formData.active
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log("Usuario actualizado: ", response.data);

            setSuccess(true);
            if (onUpdate) onUpdate(response.data); // refresca lista en Admin
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);

        } catch (error) {
            console.error("Error al actualizar usuario: ", error);

            if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: "Error al actualizar el usuario. Intenta de nuevo." });
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
                    {/* Botón cerrar */}
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
                            <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
                                Editar usuario
                            </h2>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Modifica la información del usuario seleccionado
                            </p>

                            {/* Error general */}
                            {errors.submit && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
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
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg ${
                                            errors.name ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>

                                {/* Campo Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg ${
                                            errors.email ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>

                                {/* Campo Contraseña (opcional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nueva contraseña (opcional)
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg ${
                                            errors.password ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
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
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg ${
                                            errors.role ? "border-red-500" : "border-gray-300"
                                        }`}
                                    >
                                        <option value="">Selecciona un rol</option>
                                        {roles && roles.map((role) => (
                                            <option key={role.rolId} value={role.rolId}>
                                                {role.rolName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                                </div>

                                {/* Campo Active */}
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Estado de Cuenta
                                    </label>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({ ...prev, active: !prev.active }))
                                            }
                                            disabled={loading}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${formData.active ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${formData.active ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>

                                        <p className="text-sm font-medium text-gray-600">
                                            {formData.active ? "Activo" : "Inactivo"}
                                        </p>
                                    </div>
                                </div>
                                {/* Botones */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                                    >
                                        {loading ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <h2 className="text-2xl font-bold mb-3 text-gray-800">¡Usuario actualizado!</h2>
                            <p className="text-gray-600 mb-8">Los cambios se guardaron correctamente.</p>
                            <button  
                                onClick={handleClose}  
                                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
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
