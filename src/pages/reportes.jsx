import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Save, X, Filter, 
  TrendingUp, Package, AlertTriangle, Calendar, DollarSign,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function ReportManagement() {
  const { id: currentUserId } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Formulario de creación
  const [formData, setFormData] = useState({
    userId: currentUserId || '',
    observation: '',
    onLowStockValue: ''
  });

  // Formulario de edición
  const [editObservation, setEditObservation] = useState('');

  // Filtros
  const [filters, setFilters] = useState({
    userId: '',
    totalSales: '',
    monthSales: '',
    productsOnStock: '',
    productOnLowStock: ''
  });

  useEffect(() => {
    loadReports();
  }, [currentPage]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/report/v1/api', {
        params: {
          page: currentPage,
          size: pageSize
        }
      });
      
      if (response.data.content) {
        setReports(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setReports(response.data);
      }
    } catch (error) {
      showAlert('Error al cargar reportes', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchReports = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await api.post('/report/v1/api/search', cleanFilters, {
        params: {
          page: currentPage,
          size: pageSize
        }
      });

      if (response.data.content) {
        setReports(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setReports(response.data);
      }
      showAlert('Búsqueda completada');
    } catch (error) {
      showAlert('Error en la búsqueda', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    if (!formData.userId || !formData.onLowStockValue) {
      showAlert('Usuario y valor de stock bajo son requeridos', 'error');
      return;
    }

    try {
      const payload = {
        userId: parseInt(formData.userId),
        observation: formData.observation || null,
        onLowStockValue: parseInt(formData.onLowStockValue)
      };

      await api.post('/report/v1/api/save', payload);
      showAlert('Reporte creado exitosamente');
      setIsCreating(false);
      setFormData({
        userId: currentUserId || '',
        observation: '',
        onLowStockValue: ''
      });
      loadReports();
    } catch (error) {
      showAlert('Error al crear reporte', 'error');
      console.error('Error:', error);
    }
  };

  const updateReport = async (reportId) => {
    try {
      await api.put(`/report/v1/api/${reportId}`, {
        observation: editObservation
      });
      showAlert('Reporte actualizado exitosamente');
      setIsEditing(false);
      setSelectedReport(null);
      setEditObservation('');
      loadReports();
    } catch (error) {
      showAlert('Error al actualizar reporte', 'error');
      console.error('Error:', error);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return;

    try {
      await api.delete(`/report/v1/api/${reportId}`);
      showAlert('Reporte eliminado exitosamente');
      loadReports();
    } catch (error) {
      showAlert('Error al eliminar reporte', 'error');
      console.error('Error:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      totalSales: '',
      monthSales: '',
      productsOnStock: '',
      productOnLowStock: ''
    });
    setCurrentPage(0);
    loadReports();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestión de Reportes</h1>
                  <p className="text-purple-100 text-sm">Administra y genera reportes del sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`mx-6 mt-4 p-4 rounded-lg ${
              alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {alert.message}
            </div>
          )}

          {/* Filters Section */}
          {showFilters && (
            <div className="border-b border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Usuario
                  </label>
                  <input
                    type="number"
                    value={filters.userId}
                    onChange={(e) => setFilters({...filters, userId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ventas Totales (min)
                  </label>
                  <input
                    type="number"
                    value={filters.totalSales}
                    onChange={(e) => setFilters({...filters, totalSales: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ventas del Mes (min)
                  </label>
                  <input
                    type="number"
                    value={filters.monthSales}
                    onChange={(e) => setFilters({...filters, monthSales: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto en Stock
                  </label>
                  <input
                    type="text"
                    value={filters.productsOnStock}
                    onChange={(e) => setFilters({...filters, productsOnStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto Stock Bajo
                  </label>
                  <input
                    type="text"
                    value={filters.productOnLowStock}
                    onChange={(e) => setFilters({...filters, productOnLowStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={searchReports}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Create Report Section */}
            <div className="mb-6">
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Generar Nuevo Reporte
                </button>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Reporte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Usuario *
                      </label>
                      <input
                        type="number"
                        value={formData.userId}
                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Umbral Stock Bajo *
                      </label>
                      <input
                        type="number"
                        value={formData.onLowStockValue}
                        onChange={(e) => setFormData({...formData, onLowStockValue: e.target.value})}
                        placeholder="Ej: 100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observación
                      </label>
                      <input
                        type="text"
                        value={formData.observation}
                        onChange={(e) => setFormData({...formData, observation: e.target.value})}
                        placeholder="Opcional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={createReport}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Generar Reporte
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setFormData({
                          userId: currentUserId || '',
                          observation: '',
                          onLowStockValue: ''
                        });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Reports List */}
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No hay reportes disponibles</p>
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div
                        key={report.createdAt}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
                      >
                        {/* Header del reporte */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                              <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Usuario ID: {report.userId?.id || report.userId}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setEditObservation(report.observation || '');
                                setIsEditing(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteReport(report.createdAt)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ventas Totales</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(report.totalSales)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ventas del Mes</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(report.monthSales)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Inventario */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-gray-600" />
                              <h4 className="font-medium text-gray-900">Productos en Stock</h4>
                              <span className="text-xs text-gray-500">
                                ({report.productOnStock?.length || 0})
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded p-2 max-h-24 overflow-y-auto">
                              {report.productOnStock?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {report.productOnStock.map((product, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                                    >
                                      {product}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Sin productos</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <h4 className="font-medium text-gray-900">Stock Bajo</h4>
                              <span className="text-xs text-gray-500">
                                (&lt; {report.onLowStockValue})
                              </span>
                            </div>
                            <div className="bg-orange-50 rounded p-2 max-h-24 overflow-y-auto">
                              {report.productOnLowStock?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {report.productOnLowStock.map((product, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-white border border-orange-200 rounded text-xs text-orange-700"
                                    >
                                      {product}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Sin productos</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Observación */}
                        {isEditing && selectedReport?.createdAt === report.createdAt ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editObservation}
                              onChange={(e) => setEditObservation(e.target.value)}
                              placeholder="Observación"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => updateReport(report.createdAt)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setSelectedReport(null);
                                setEditObservation('');
                              }}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : report.observation ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm font-medium text-yellow-900">Observación:</p>
                            <p className="text-sm text-yellow-800">{report.observation}</p>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Página {currentPage + 1} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}