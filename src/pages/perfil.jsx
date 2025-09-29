import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

// Componente de Toast personalizado
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <div className="toast-notification fixed top-4 right-4 z-50 animate-slideIn">
            <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
                <div className="flex-shrink-0">{icon}</div>
                <p className="flex-1">{message}</p>
                <button onClick={onClose} className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded p-1 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default function Profile() {
    const { id, token } = useAuth(); // Obtener también el token del contexto
    const [user, setUser] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [focusedField, setFocusedField] = useState(null);
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                showToast("No hay sesión activa", "error");
                return;
            }

            try {
                const response = await api.get(`/users/v1/api/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
                if (error.response?.status === 403) {
                    showToast("No tienes permisos para ver este perfil", "error");
                } else if (error.response?.status === 401) {
                    showToast("Sesión expirada. Por favor inicia sesión nuevamente", "error");
                } else {
                    showToast("Error al cargar el perfil", "error");
                }
            }
        };
        fetchUser();
    }, [id, token]);

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const handleUpdateProfile = async () => {
        if (!token) {
            showToast("No hay sesión activa", "error");
            return;
        }

        try {
            setLoading(true);
            await api.put(`/users/v1/api/${id}`, {
                name: user.name,
                email: user.email,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showToast("Perfil actualizado correctamente", "success");
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.response?.status === 403) {
                showToast("No tienes permisos para actualizar este perfil", "error");
            } else if (error.response?.status === 401) {
                showToast("Sesión expirada. Por favor inicia sesión nuevamente", "error");
            } else {
                showToast(error.response?.data?.message || "Error al actualizar el perfil", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z0-9]/.test(pass)) strength++;

        const levels = [
            { strength: 1, label: 'Débil', color: 'bg-red-500' },
            { strength: 2, label: 'Regular', color: 'bg-yellow-500' },
            { strength: 3, label: 'Buena', color: 'bg-blue-500' },
            { strength: 4, label: 'Excelente', color: 'bg-green-500' }
        ];

        return levels[strength - 1] || { strength: 0, label: '', color: '' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleChangePassword = async () => {
        if (!token) {
            showToast("No hay sesión activa", "error");
            return;
        }

        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast("Todos los campos son obligatorios", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast("La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Las contraseñas no coinciden", "error");
            return;
        }

        try {
            setLoading(true);
            await api.put(`/users/v1/api/${id}`, {
                password: newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showToast("Contraseña cambiada con éxito", "success");
            setOpenModal(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswords({ old: false, new: false, confirm: false });
        } catch (error) {
            console.error("Error changing password:", error);
            if (error.response?.status === 403) {
                showToast("No tienes permisos para cambiar la contraseña", "error");
            } else if (error.response?.status === 401) {
                showToast("Contraseña actual incorrecta", "error");
            } else {
                showToast(error.response?.data?.message || "Error al cambiar la contraseña", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .field-group {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 animate-fadeIn">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
                        <p className="text-gray-600 mt-2">Administra tu información personal</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white shadow-2xl rounded-2xl p-8 animate-slideUp">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Información Personal</h2>

                        <div className="space-y-5">
                            {/* Name Field */}
                            <div className="field-group">
                                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${focusedField === 'name' ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    Nombre completo
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02]"
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Tu nombre completo"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="field-group">
                                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02]"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="tu@email.com"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Role Field (Readonly) */}
                            <div className="field-group">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Rol</label>
                                <div className="relative">
                                    <input
                                        className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                                        value={user.rolId.rolName}
                                        disabled
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Creation Date (Readonly) */}
                            <div className="field-group">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha de creación</label>
                                <div className="relative">
                                    <input
                                        className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                                        value={new Date(user.creationDate).toLocaleString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        disabled
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Active Status (Readonly) */}
                            <div className="field-group">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Estado</label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className={`w-3 h-3 rounded-full ${user.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className={`font-medium ${user.active ? 'text-green-700' : 'text-red-700'}`}>
                                        {user.active ? "Cuenta Activa" : "Cuenta Inactiva"}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Guardando...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Guardar cambios
                                        </>
                                    )}
                                </button>
                                <button
                                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-300 hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                                    onClick={() => setOpenModal(true)}
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    Cambiar contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de cambio de contraseña */}
            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 px-4 animate-fadeIn">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Cambiar contraseña</h3>
                            <button
                                onClick={() => setOpenModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:rotate-90 hover:scale-110"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Contraseña actual</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.old ? "text" : "password"}
                                        className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Ingresa tu contraseña actual"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPasswords.old ? (
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
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Nueva contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPasswords.new ? (
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

                                {/* Password Strength */}
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600">Fortaleza:</span>
                                            <span className={`text-xs font-semibold ${passwordStrength.strength === 1 ? 'text-red-500' :
                                                passwordStrength.strength === 2 ? 'text-yellow-500' :
                                                    passwordStrength.strength === 3 ? 'text-blue-500' :
                                                        'text-green-500'
                                                }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`}
                                                style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Confirmar nueva contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirma tu contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPasswords.confirm ? (
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

                                {/* Match Indicator */}
                                {confirmPassword && newPassword && (
                                    <div className="mt-2 flex items-center gap-2">
                                        {newPassword === confirmPassword ? (
                                            <>
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-xs text-green-600">Las contraseñas coinciden</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span className="text-xs text-red-600">Las contraseñas no coinciden</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                    onClick={() => {
                                        setOpenModal(false);
                                        setOldPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setShowPasswords({ old: false, new: false, confirm: false });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Guardando...</span>
                                        </div>
                                    ) : (
                                        'Guardar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}