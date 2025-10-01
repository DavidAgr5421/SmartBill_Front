// src/config/config.js

const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  apiKey: process.env.REACT_APP_API_KEY || '',
  apiTimeout: process.env.REACT_APP_API_TIMEOUT || 30000,
  
  // Environment
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // App Configuration
  appName: process.env.REACT_APP_NAME || 'Mi Aplicación',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',
  
  // External Services
  googleMapsKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
  stripeKey: process.env.REACT_APP_STRIPE_KEY || '',
  
  // Feature Flags
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  enableDebug: process.env.REACT_APP_ENABLE_DEBUG === 'true',
  
  // URLs
  baseUrl: process.env.REACT_APP_BASE_URL || window.location.origin,
  assetsUrl: process.env.REACT_APP_ASSETS_URL || '/assets',
};

// Validación opcional en desarrollo
if (config.isDevelopment) {
  console.log('🔧 Configuración cargada:', config);
  
  // Advertir sobre variables faltantes
  if (!config.apiKey) {
    console.warn('⚠️ REACT_APP_API_KEY no está definida');
  }
}

// Congelar el objeto para evitar modificaciones accidentales
export default Object.freeze(config);