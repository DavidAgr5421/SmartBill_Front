import React from "react";

export default function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
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
        
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .checkmark-circle {
          animation: scaleIn 0.5s ease-out;
        }
        
        .checkmark-path {
          stroke-dasharray: 100;
          animation: checkmark 0.6s ease-out 0.2s forwards;
        }
      `}</style>

      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="modal-content bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="checkmark-circle flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6">
            <svg
              className="w-10 h-10"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="26"
                r="24"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
              />
              <path
                className="checkmark-path"
                d="M14 27l8 8 16-16"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3 text-gray-800">{title}</h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

          {/* Accept Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Aceptar
          </button>
        </div>
      </div>
    </>
  );
}