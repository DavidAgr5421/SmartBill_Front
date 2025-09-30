import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api/apiClient';
import { useAuth } from "../context/AuthContext";

import ForgotPasswordModal from '../components/modals/forgetPasswordModal';
import ErrorModal from "../components/modals/errorsModal";

const LoginPage = () => {

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState({show: false, message: ""});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    let newErrors = {};

    if (!email) { newErrors.email = "El correo es obligatorio"; }
    if (!password) { newErrors.password = "La contraseña es obligatoria"; }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLoading(true)
      const response = await api.post("/login", { email, password });
      
      //TOKEN DE API
      const jwtToken = response.data.jwttoken;
      const type = response.data.type;

      //ROL 
      const role = response.data.role || "USER";

      login(jwtToken, type, { 
        role: response.data.rolName,
        rolId: response.data.rolId,
        id: response.data.id,
        name: response.data.name
       });

       console.log("TOKEN CREADO PARA LOGIN:")
       console.log(response.data)

      if (role === "ADMIN") {
        navigate("/admin")
      } else {
        navigate("/perfil")
      }


    } catch (err) {
      console.log(err);
      if (err.response) {
        setErrors({
          server: err.response.data.message || "Error en el servidor",
        });
        setErrorModal( { show: true, message: err.response.data?.message || "Tu email o contraseña son incorrectos."});
      } else if (err.request) {
        setErrors({
          network: "No se pudo conectar con el servidor. Intenta de nuevo.",
        });
        setErrorModal({ show: true, message: "No se pudo conectar con el servidor." });
      } else {
        setErrors({
          client: "Ocurrió un error inesperado. Revisa tu configuración.",
        });
        setErrorModal({ show: true, message: "Ocurrió un error inesperado." });
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate 20s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            #1a73e8 0%,
            #0d47a1 50%,
            #1a73e8 100%
          );
          background-size: 1000px 100%;
        }
        
        .delay-1s {
          animation-delay: 1s;
        }
        
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            width: 95%;
            height: auto;
          }
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fbfd' }}>
        <div className="flex w-full max-w-4xl h-auto md:h-[550px] shadow-2xl rounded-3xl overflow-hidden animate-fadeIn">
          {/* Left Side - Image/Branding */}
          <div
            className="flex-1 flex flex-col justify-center items-center text-white p-10 relative overflow-hidden animate-slideInLeft"
            style={{ backgroundColor: '#1a73e8' }}
          >
            {/* Decorative circles with animations */}
            <div
              className="absolute w-72 h-72 rounded-full top-[-100px] left-[-100px] opacity-10 animate-pulse-slow"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            ></div>
            <div
              className="absolute w-48 h-48 rounded-full bottom-[-50px] right-[-50px] opacity-10 animate-pulse-slow delay-1s"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            ></div>
            
            {/* Additional decorative element */}
            <div
              className="absolute w-32 h-32 rounded-full top-1/4 right-10 opacity-5 animate-rotate-slow"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            ></div>

            {/* Floating icon with animation */}
            <div className="text-8xl mb-5 relative z-10 animate-float">
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-20 h-20"
              >
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>

            <h1 className="text-4xl font-bold mb-3 relative z-10">SmartBill</h1>
            <p className="text-center text-lg opacity-90 relative z-10">
              Sistema de facturación inteligente para simplificar tu negocio
            </p>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 bg-white p-12 flex flex-col justify-center animate-slideInRight">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: '#202124' }}>
              Iniciar Sesión
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`block mb-2 text-sm transition-all duration-300 ${
                    focusedField === 'email' ? 'font-semibold' : ''
                  }`}
                  style={{ color: focusedField === 'email' ? '#1a73e8' : '#5f6368' }}
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className={`w-full px-4 py-3 border rounded-lg text-base transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 transform focus:scale-[1.02]
                    ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                    style={{ borderColor: errors.email ? '#ef4444' : '#e0e0e0' }}
                  />
                  {focusedField === 'email' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className={`block mb-2 text-sm transition-all duration-300 ${
                    focusedField === 'password' ? 'font-semibold' : ''
                  }`}
                  style={{ color: focusedField === 'password' ? '#1a73e8' : '#5f6368' }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-lg text-base transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 transform focus:scale-[1.02]
                    ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                    style={{ borderColor: errors.password ? '#ef4444' : '#e0e0e0' }}
                  />
                  {focusedField === 'password' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right mb-6">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-sm hover:underline transition-all duration-300 transform hover:scale-105 inline-block"
                  style={{ color: '#1a73e8' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Modals */}
              <ForgotPasswordModal isOpen={showModal} onClose={() => setShowModal(false)} />
              <ErrorModal
                isOpen={errorModal.show}
                message={errorModal.message}
                onClose={() => setErrorModal({ show: false, message: "" })}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                style={{
                  backgroundColor: '#1a73e8',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#0d47a1';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#1a73e8';
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;