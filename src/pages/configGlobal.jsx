import React, { useState, useEffect } from 'react';

const ConfigGlobal = () => {
  const [config, setConfig] = useState({
    id: null,
    name: 'Configuración Principal',
    companyName: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
    tax: '',
    invoiceFooter: ''
  });

  const [savedConfigs, setSavedConfigs] = useState([]);
  const [activeConfigId, setActiveConfigId] = useState(null);
  const [showConfigList, setShowConfigList] = useState(false);
  const [configNameInput, setConfigNameInput] = useState('');
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = () => {
    try {
      const configs = JSON.parse(window.localStorage.getItem('smartbill_configs') || '[]');
      const activeId = window.localStorage.getItem('smartbill_active_config');
      
      setSavedConfigs(configs); 
      
      if (activeId && configs.length > 0) {
        const activeConfig = configs.find(c => c.id === activeId);
        if (activeConfig) {
          setConfig(activeConfig);
          setActiveConfigId(activeId);
        } else if (configs.length > 0) {
          setConfig(configs[0]);
          setActiveConfigId(configs[0].id);
          window.localStorage.setItem('smartbill_active_config', configs[0].id);
        }
      } else if (configs.length > 0) {
        setConfig(configs[0]);
        setActiveConfigId(configs[0].id);
        window.localStorage.setItem('smartbill_active_config', configs[0].id);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      showNotification('error', 'Error al cargar las configuraciones');
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

    const requiredFields = ['companyName', 'taxId', 'address', 'phone', 'email', 'tax'];
    
    requiredFields.forEach(field => {
      if (!config[field] || !config[field].toString().trim()) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (config.email && !emailRegex.test(config.email)) {
      newErrors.email = true;
      isValid = false;
    }

    if (config.tax && (config.tax < 0 || config.tax > 100)) {
      newErrors.tax = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      saveConfiguration();
    } else {
      showNotification('error', 'Por favor complete todos los campos requeridos correctamente');
    }
  };

  const saveConfiguration = () => {
    try {
      let configs = [...savedConfigs];
      let configToSave = { ...config };

      if (configToSave.id) {
        const index = configs.findIndex(c => c.id === configToSave.id);
        if (index !== -1) {
          configs[index] = configToSave;
        } else {
          configs.push(configToSave);
        }
      } else {
        configToSave.id = Date.now().toString();
        configs.push(configToSave);
      }

      window.localStorage.setItem('smartbill_configs', JSON.stringify(configs));
      window.localStorage.setItem('smartbill_active_config', configToSave.id);
      
      setSavedConfigs(configs);
      setActiveConfigId(configToSave.id);
      setConfig(configToSave);
      
      showNotification('success', 'Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification('error', 'Error al guardar la configuración');
    }
  };

  const handleSaveAs = () => {
    if (!configNameInput.trim()) {
      showNotification('error', 'Por favor ingrese un nombre para la configuración');
      return;
    }

    if (!validateForm()) {
      showNotification('error', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    try {
      const newConfig = {
        ...config,
        id: Date.now().toString(),
        name: configNameInput
      };

      const configs = [...savedConfigs, newConfig];
      
      window.localStorage.setItem('smartbill_configs', JSON.stringify(configs));
      window.localStorage.setItem('smartbill_active_config', newConfig.id);
      
      setSavedConfigs(configs);
      setActiveConfigId(newConfig.id);
      setConfig(newConfig);
      setShowSaveAsDialog(false);
      setConfigNameInput('');
      
      showNotification('success', `Configuración "${configNameInput}" guardada exitosamente`);
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification('error', 'Error al guardar la configuración');
    }
  };

  const loadConfiguration = (configId) => {
    const selectedConfig = savedConfigs.find(c => c.id === configId);
    if (selectedConfig) {
      setConfig(selectedConfig);
      setActiveConfigId(configId);
      window.localStorage.setItem('smartbill_active_config', configId);
      setShowConfigList(false);
      showNotification('success', `Configuración "${selectedConfig.name}" cargada`);
    }
  };

  const deleteConfiguration = (configId) => {
    if (savedConfigs.length === 1) {
      showNotification('error', 'No puedes eliminar la única configuración');
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar esta configuración?')) {
      const configs = savedConfigs.filter(c => c.id !== configId);
      
      window.localStorage.setItem('smartbill_configs', JSON.stringify(configs));
      
      if (activeConfigId === configId) {
        const newActive = configs[0];
        setConfig(newActive);
        setActiveConfigId(newActive.id);
        window.localStorage.setItem('smartbill_active_config', newActive.id);
      }
      
      setSavedConfigs(configs);
      showNotification('success', 'Configuración eliminada');
    }
  };

  const handleNewConfig = () => {
    setConfig({
      id: null,
      name: 'Nueva Configuración',
      companyName: '',
      taxId: '',
      address: '',
      phone: '',
      email: '',
      tax: '19',
      invoiceFooter: ''
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
              >
                <span>📋</span>
                Mis Configuraciones ({savedConfigs.length})
              </button>
              <button
                onClick={handleNewConfig}
                className="bg-green-500 text-white px-4 py-2 rounded transition-colors duration-300 text-sm font-semibold hover:bg-green-600 flex items-center gap-2"
              >
                <span>➕</span>
                Nueva
              </button>
            </div>
          </div>

          {showConfigList && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-800">Configuraciones Guardadas:</h3>
              <div className="space-y-2">
                {savedConfigs.map(cfg => (
                  <div
                    key={cfg.id}
                    className={`flex justify-between items-center p-3 rounded ${
                      activeConfigId === cfg.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{cfg.name}</div>
                      <div className="text-sm text-gray-600">{cfg.companyName}</div>
                    </div>
                    <div className="flex gap-2">
                      {activeConfigId !== cfg.id && (
                        <button
                          onClick={() => loadConfiguration(cfg.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
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
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-800">Configuración Actual:</span>
              <span className="text-blue-600">{config.name || 'Sin nombre'}</span>
              {activeConfigId && (
                <span className="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded">ACTIVA</span>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Nombre de la Configuración
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Configuración Sede Principal"
                className="w-full px-4 py-3 border border-gray-300 rounded transition-colors duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Nombre de Empresa *
              </label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Ingrese el nombre de su empresa"
                className={getInputClassName('companyName')}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                NIT / RUT *
              </label>
              <input
                type="text"
                value={config.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="Ingrese su NIT o RUT"
                className={getInputClassName('taxId')}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Dirección de Empresa *
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ingrese la dirección de su empresa"
                className={getInputClassName('address')}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Teléfono Empresa *
              </label>
              <input
                type="tel"
                value={config.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ingrese el teléfono de contacto"
                className={getInputClassName('phone')}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Correo Empresa *
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ingrese el correo electrónico"
                className={getInputClassName('email')}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                IVA (Impuesto) *
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={config.tax}
                  onChange={(e) => handleInputChange('tax', e.target.value)}
                  placeholder="19"
                  min="0"
                  max="100"
                  className={`${getInputClassName('tax')} w-32 mr-3`}
                />
                <span className="text-lg font-semibold">%</span>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Pie de Página para Factura
              </label>
              <textarea
                value={config.invoiceFooter}
                onChange={(e) => handleInputChange('invoiceFooter', e.target.value)}
                placeholder="Ingrese el texto para el pie de página de sus facturas (términos y condiciones, notas, etc.)"
                className="w-full px-4 py-3 border border-gray-300 rounded transition-colors duration-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500 resize-vertical min-h-24"
                rows="4"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setShowSaveAsDialog(true)}
                className="bg-purple-500 text-white px-6 py-3 rounded transition-colors duration-300 text-base font-semibold hover:bg-purple-600"
              >
                Guardar Como...
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-6 py-3 rounded transition-colors duration-300 text-base font-semibold hover:bg-blue-600"
              >
                {config.id ? 'Actualizar Configuración' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSaveAsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Guardar Como Nueva Configuración</h3>
            <input
              type="text"
              value={configNameInput}
              onChange={(e) => setConfigNameInput(e.target.value)}
              placeholder="Nombre de la configuración"
              className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveAsDialog(false);
                  setConfigNameInput('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAs}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

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
        }
      `}</style>
    </div>
  );
};

export default ConfigGlobal;