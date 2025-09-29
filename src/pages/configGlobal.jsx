import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';

const ConfigGlobal = () => {
  const [config, setConfig] = useState({
    id: null,
    configName: '',
    nit: '',
    contact: '',
    footer: '',
    paperWidth: 80,
    fontSize: 12,
    logoType: 'IMAGE',
    qrType: 'PAYMENT'
  });

  const [savedConfigs, setSavedConfigs] = useState([]);
  const [activeConfigId, setActiveConfigId] = useState(null);
  const [showConfigList, setShowConfigList] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const API_BASE_URL = 'http://localhost:8080/config/v1/api';

  useEffect(() => {
    loadConfigurations();
  }, []);

  const getAuthToken = () => {
    // Obtener el token de autenticación desde tu contexto o localStorage
    return localStorage.getItem('authToken') || '';
  };

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await api.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 0,
          size: 1000
        }
      });
      const configs = response.data.content || [];
      setSavedConfigs(configs);

      const savedActiveId = localStorage.getItem('smartbill_active_config_id');
      
      if (savedActiveId && configs.length > 0) {
        const activeConfig = configs.find(c => c.id?.toString() === savedActiveId);
        if (activeConfig) {
          setConfig(activeConfig);
          setActiveConfigId(activeConfig.id);
        } else if (configs.length > 0) {
          setConfig(configs[0]);
          setActiveConfigId(configs[0].id);
          localStorage.setItem('smartbill_active_config_id', configs[0].id.toString());
        }
      } else if (configs.length > 0) {
        setConfig(configs[0]);
        setActiveConfigId(configs[0].id);
        localStorage.setItem('smartbill_active_config_id', configs[0].id.toString());
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      showNotification('error', 'Error al cargar las configuraciones desde el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields = ['configName', 'nit', 'contact'];
    
    requiredFields.forEach(field => {
      if (!config[field] || !config[field].toString().trim()) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (config.contact && !emailRegex.test(config.contact)) {
      newErrors.contact = true;
      isValid = false;
    }

    if (config.paperWidth && (config.paperWidth < 58 || config.paperWidth > 80)) {
      newErrors.paperWidth = true;
      isValid = false;
    }

    if (config.fontSize && (config.fontSize < 8 || config.fontSize > 16)) {
      newErrors.fontSize = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    if (config.id) {
      await updateConfiguration();
    } else {
      await saveConfiguration();
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const payload = { ...config };
      delete payload.id;

      const response = await api.post(API_BASE_URL, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const savedConfig = response.data;

      if (!response.ok) {
        throw new Error('Error al guardar la configuración');
      }
      
      // Actualizar lista de configuraciones
      await loadConfigurations();
      
      // Establecer como activa
      setActiveConfigId(savedConfig.id);
      localStorage.setItem('smartbill_active_config_id', savedConfig.id.toString());
      
      showNotification('success', 'Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification('error', 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const payload = { ...config };

      const response = await api.put(`${API_BASE_URL}/${config.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la configuración');
      }

      await loadConfigurations();
      showNotification('success', 'Configuración actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      showNotification('error', 'Error al actualizar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = (selectedConfig) => {
    setConfig(selectedConfig);
    setActiveConfigId(selectedConfig.id);
    localStorage.setItem('smartbill_active_config_id', selectedConfig.id.toString());
    setShowConfigList(false);
    showNotification('success', `Configuración "${selectedConfig.configName}" cargada`);
  };

  const deleteConfiguration = async (configId) => {
    if (savedConfigs.length === 1) {
      showNotification('error', 'No puedes eliminar la única configuración');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar esta configuración?')) {
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await api.delete(`${API_BASE_URL}/${configId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la configuración');
      }

      // Si la configuración eliminada era la activa, cargar otra
      if (activeConfigId === configId) {
        localStorage.removeItem('smartbill_active_config_id');
      }

      await loadConfigurations();
      showNotification('success', 'Configuración eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      showNotification('error', 'Error al eliminar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConfig = () => {
    setConfig({
      id: null,
      configName: '',
      nit: '',
      contact: '',
      footer: '',
      paperWidth: 80,
      fontSize: 12,
      logoType: 'IMAGE',
      qrType: 'PAYMENT'
    });
    setActiveConfigId(null);
    setErrors({});
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const getInputClassName = (field) => {
    const baseClass = "w-full px-4 py-3 border rounded transition-colors duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30";
    return errors[field] 
      ? `${baseClass} border-red-500 focus:border-red-500`
      : `${baseClass} border-gray-300 focus:border-blue-500`;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-blue-500 text-white py-5 mb-10 shadow-md">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">SmartBill</div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-blue-500">
            <h1 className="text-blue-500 text-3xl font-bold">
              Configuración Global
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfigList(!showConfigList)}
                className="bg-purple-500 text-white px-4 py-2 rounded transition-colors duration-300 text-sm font-semibold hover:bg-purple-600 flex items-center gap-2"
                disabled={loading}
              >
                <span>📋</span>
                Mis Configuraciones ({savedConfigs.length})
              </button>
              <button
                onClick={handleNewConfig}
                className="bg-green-500 text-white px-4 py-2 rounded transition-colors duration-300 text-sm font-semibold hover:bg-green-600 flex items-center gap-2"
                disabled={loading}
              >
                <span>➕</span>
                Nueva
              </button>
              <button
                onClick={loadConfigurations}
                className="bg-gray-500 text-white px-4 py-2 rounded transition-colors duration-300 text-sm font-semibold hover:bg-gray-600 flex items-center gap-2"
                disabled={loading}
              >
                <span>🔄</span>
                Recargar
              </button>
            </div>
          </div>

          {showConfigList && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-800">Configuraciones Guardadas:</h3>
              {loading ? (
                <div className="text-center py-4 text-gray-500">Cargando...</div>
              ) : savedConfigs.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No hay configuraciones guardadas</div>
              ) : (
                <div className="space-y-2">
                  {savedConfigs.map(cfg => (
                    <div
                      key={cfg.id}
                      className={`flex justify-between items-center p-3 rounded ${
                        activeConfigId === cfg.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{cfg.configName}</div>
                        <div className="text-sm text-gray-600">NIT: {cfg.nit}</div>
                        <div className="text-xs text-gray-500">
                          {cfg.createdAt && new Date(cfg.createdAt).toLocaleString('es-ES')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {activeConfigId !== cfg.id && (
                          <button
                            onClick={() => loadConfiguration(cfg)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            disabled={loading}
                          >
                            Cargar
                          </button>
                        )}
                        {activeConfigId === cfg.id && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                            ✓ Activa
                          </span>
                        )}
                        <button
                          onClick={() => deleteConfiguration(cfg.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeConfigId && (
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-800">Configuración Actual:</span>
                <span className="text-blue-600">{config.configName || 'Sin nombre'}</span>
                <span className="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded">ACTIVA</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Nombre de la Configuración *
              </label>
              <input
                type="text"
                value={config.configName}
                onChange={(e) => handleInputChange('configName', e.target.value)}
                placeholder="Ej: Configuración Sede Principal"
                className={getInputClassName('configName')}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                NIT / RUT *
              </label>
              <input
                type="text"
                value={config.nit}
                onChange={(e) => handleInputChange('nit', e.target.value)}
                placeholder="Ingrese su NIT o RUT"
                className={getInputClassName('nit')}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Email de Contacto *
              </label>
              <input
                type="email"
                value={config.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Ingrese el correo electrónico"
                className={getInputClassName('contact')}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Pie de Página para Factura
              </label>
              <textarea
                value={config.footer}
                onChange={(e) => handleInputChange('footer', e.target.value)}
                placeholder="Ingrese el texto para el pie de página de sus facturas"
                className="w-full px-4 py-3 border border-gray-300 rounded transition-colors duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500 resize-vertical min-h-24"
                rows="4"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Ancho de Papel (mm)
                </label>
                <input
                  type="number"
                  value={config.paperWidth}
                  onChange={(e) => handleInputChange('paperWidth', parseInt(e.target.value))}
                  placeholder="80"
                  min="58"
                  max="80"
                  className={getInputClassName('paperWidth')}
                  disabled={loading}
                />
                <span className="text-xs text-gray-500">58mm - 80mm</span>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Tamaño de Fuente
                </label>
                <input
                  type="number"
                  value={config.fontSize}
                  onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
                  placeholder="12"
                  min="8"
                  max="16"
                  className={getInputClassName('fontSize')}
                  disabled={loading}
                />
                <span className="text-xs text-gray-500">8px - 16px</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Tipo de Logo
                </label>
                <select
                  value={config.logoType}
                  onChange={(e) => handleInputChange('logoType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded transition-colors duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="IMAGE">Imagen</option>
                  <option value="TEXT">Texto</option>
                  <option value="NONE">Ninguno</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Tipo de QR
                </label>
                <select
                  value={config.qrType}
                  onChange={(e) => handleInputChange('qrType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded transition-colors duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="PAYMENT">Pago</option>
                  <option value="INVOICE">Factura</option>
                  <option value="NONE">Ninguno</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={handleNewConfig}
                className="bg-gray-500 text-white px-6 py-3 rounded transition-colors duration-300 text-base font-semibold hover:bg-gray-600"
                disabled={loading}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded transition-colors duration-300 text-base font-semibold hover:bg-blue-600 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? 'Guardando...' : config.id ? 'Actualizar Configuración' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {notification.show && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded font-semibold text-white z-50 shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .max-w-6xl {
            padding: 0 15px;
          }
          
          .bg-white {
            padding: 20px;
          }
          
          .flex.justify-end {
            flex-direction: column;
          }
          
          .flex.justify-end button {
            width: 100%;
            margin-bottom: 10px;
          }
          
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfigGlobal;