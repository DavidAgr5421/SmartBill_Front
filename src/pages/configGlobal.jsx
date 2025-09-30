import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, List, RefreshCw, Trash2, Check, X, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await api.get('config/v1/api');
      const configs = response.data.content || [];
      
      setSavedConfigs(configs);
      
      if (configs.length === 0) {
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
        localStorage.removeItem('smartbill_active_config_id');
        return;
      }

      const savedActiveId = localStorage.getItem('smartbill_active_config_id');
      let activeConfig = savedActiveId 
        ? configs.find(c => c.id?.toString() === savedActiveId)
        : configs[0];

      if (!activeConfig) {
        activeConfig = configs[0];
      }

      setConfig(activeConfig);
      setActiveConfigId(activeConfig.id);
      localStorage.setItem('smartbill_active_config_id', activeConfig.id?.toString() || '');

    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      showNotification('error', 'Error al cargar las configuraciones desde el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    if (config.id) {
      updateConfiguration();
    } else {
      saveConfiguration();
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      const payload = {
        configName: config.configName,
        contact: config.contact,
        nit: config.nit,
        footer: config.footer || '',
        paperWidth: config.paperWidth,
        fontSize: config.fontSize,
        logoType: config.logoType,
        qrType: config.qrType
      };

      const response = await api.post('config/v1/api', payload);
      const savedConfig = response.data;
      
      await loadConfigurations();
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
      const payload = {
        configName: config.configName,
        contact: config.contact,
        nit: config.nit,
        footer: config.footer,
        paperWidth: config.paperWidth,
        fontSize: config.fontSize,
        logoType: config.logoType,
        qrType: config.qrType
      };

      await api.put(`config/v1/api/${config.id}`, payload);
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
      await api.delete(`config/v1/api/${configId}`);
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
    }, 4000);
  };

  const getInputClassName = (field) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg transition-all duration-200 text-base focus:outline-none focus:ring-2";
    return errors[field] 
      ? `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50`
      : `${baseClass} border-gray-300 focus:border-blue-500 focus:ring-blue-200`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Configuración Global</h1>
              <p className="text-blue-100 text-sm">Gestiona las configuraciones de tu sistema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-fade-in">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <List className="h-4 w-4" />
              <span className="font-medium">{savedConfigs.length} configuraciones guardadas</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfigList(!showConfigList)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105 shadow-md"
                disabled={loading}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Configuraciones</span>
                <span className="sm:hidden">Ver</span>
              </button>
              <button
                onClick={handleNewConfig}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-md"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva</span>
              </button>
              <button
                onClick={loadConfigurations}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-md"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {showConfigList && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <List className="h-5 w-5 text-blue-600" />
                Configuraciones Guardadas
              </h3>
              <button
                onClick={() => setShowConfigList(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Cargando...</p>
              </div>
            ) : savedConfigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No hay configuraciones guardadas</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {savedConfigs.map((cfg, index) => (
                  <div
                    key={cfg.id}
                    className={`group p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md animate-fade-in ${
                      activeConfigId === cfg.id 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{cfg.configName}</h4>
                          {activeConfigId === cfg.id && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Activa
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">NIT: {cfg.nit}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cfg.createdAt && new Date(cfg.createdAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {activeConfigId !== cfg.id && (
                          <button
                            onClick={() => loadConfiguration(cfg)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                            disabled={loading}
                          >
                            Cargar
                          </button>
                        )}
                        <button
                          onClick={() => deleteConfiguration(cfg.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={loading}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeConfigId && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Configuración Actual</p>
                <p className="text-lg font-bold text-green-700">{config.configName || 'Sin nombre'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b-2 border-blue-500">
                Información Básica
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la Configuración <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.configName}
                  onChange={(e) => handleInputChange('configName', e.target.value)}
                  placeholder="Ej: Configuración Sede Principal"
                  className={getInputClassName('configName')}
                  disabled={loading}
                />
                {errors.configName && (
                  <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-3 w-3" />
                    Este campo es requerido
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    NIT / RUT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                    placeholder="Ingrese su NIT o RUT"
                    className={getInputClassName('nit')}
                    disabled={loading}
                  />
                  {errors.nit && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" />
                      Este campo es requerido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email de Contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={config.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="contacto@ejemplo.com"
                    className={getInputClassName('contact')}
                    disabled={loading}
                  />
                  {errors.contact && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" />
                      Ingrese un email válido
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pie de Página para Factura
                </label>
                <textarea
                  value={config.footer}
                  onChange={(e) => handleInputChange('footer', e.target.value)}
                  placeholder="Texto que aparecerá al final de tus facturas"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 resize-vertical min-h-24"
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b-2 border-blue-500">
                Configuración de Impresión
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                  <p className="text-xs text-gray-500">Rango: 58mm - 80mm</p>
                  {errors.paperWidth && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" />
                      Valor debe estar entre 58 y 80
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tamaño de Fuente (px)
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
                  <p className="text-xs text-gray-500">Rango: 8px - 16px</p>
                  {errors.fontSize && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" />
                      Valor debe estar entre 8 y 16
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Logo
                  </label>
                  <select
                    value={config.logoType}
                    onChange={(e) => handleInputChange('logoType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
                    disabled={loading}
                  >
                    <option value="IMAGE">Imagen</option>
                    <option value="TEXT">Texto</option>
                    <option value="NONE">Ninguno</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Código QR
                  </label>
                  <select
                    value={config.qrType}
                    onChange={(e) => handleInputChange('qrType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
                    disabled={loading}
                  >
                    <option value="PAYMENT">Pago</option>
                    <option value="INVOICE">Factura</option>
                    <option value="NONE">Ninguno</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleNewConfig}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium hover:bg-gray-700 hover:scale-105 shadow-md"
                disabled={loading}
              >
                Limpiar Formulario
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium hover:bg-blue-700 hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {config.id ? 'Actualizar Configuración' : 'Guardar Configuración'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {notification.show && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-lg font-semibold text-white z-50 shadow-2xl animate-slide-in-right flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfigGlobal;