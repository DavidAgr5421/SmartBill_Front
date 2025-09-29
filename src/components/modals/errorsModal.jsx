import React from "react";

export default function ErrorModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          animation: slideDown 0.4s ease-out;
        }
        
        .error-icon {
          animation: shake 0.5s ease-out, pulse 2s ease-in-out infinite 0.5s;
        }
      `}</style>

      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="modal-content bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all">
          {/* Error Icon */}
          <div className="error-icon flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3 text-gray-800">¡Ups! Algo salió mal</h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    </>
  );
}