import { useState, useEffect } from 'react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import PrintBill from '../components/printBill';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColorMap = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    const bgColor = bgColorMap[type] || 'bg-gray-500';
    return (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
            <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
                <span className="flex-1">{message}</span>
                <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded p-1">×</button>
            </div>
        </div>
    );
};

const ObservationModal = ({ isOpen, onClose, observation, onSave }) => {
    const [tempObservation, setTempObservation] = useState(observation || '');

    useEffect(() => {
        setTempObservation(observation || '');
    }, [observation]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-xl">
                    <h3 className="text-xl font-bold">Editar Observación</h3>
                </div>
                <div className="p-6">
                    <textarea
                        value={tempObservation}
                        onChange={(e) => setTempObservation(e.target.value)}
                        placeholder="Ingrese observaciones del producto..."
                        className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onSave(tempObservation);
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function NewBill() {
    const { token } = useAuth();
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedUser, setSelectedUser] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const [billDetails, setBillDetails] = useState([]);
    const [newDetail, setNewDetail] = useState({
        productId: '',
        amount: '',
        unitPrice: '',
        observation: ''
    });

    const [showObservationModal, setShowObservationModal] = useState(false);
    const [editingDetailIndex, setEditingDetailIndex] = useState(null);

    const [showPrintModal, setShowPrintModal] = useState(false);
    const [lastSavedBill, setLastSavedBill] = useState(null);
    const [lastSavedDetails, setLastSavedDetails] = useState(null);

    const [savedOrders, setSavedOrders] = useState([]);
    const [showOrdersModal, setShowOrdersModal] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchClients();
        fetchProducts();
        loadSavedOrders();
    }, []);

    const loadSavedOrders = () => {
        const orders = JSON.parse(localStorage.getItem('savedOrders') || '[]');
        setSavedOrders(orders);
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/v1/api', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Error al cargar usuarios', 'error');
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('/client/v1/api', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showToast('Error al cargar clientes', 'error');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/product/v1/api/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Error al cargar productos', 'error');
        }
    };

    const showToast = (message, type) => setToast({ message, type });

    const handleProductChange = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (product) {
            setNewDetail(prev => ({
                ...prev,
                productId: productId,
                unitPrice: product.price || ''
            }));
        } else {
            setNewDetail(prev => ({ ...prev, productId: '', unitPrice: '' }));
        }
    };

    const calculateSubtotal = (amount, unitPrice) => {
        return parseFloat(amount || 0) * parseFloat(unitPrice || 0);
    };

    const addDetail = () => {
        const { productId, amount, unitPrice } = newDetail;
        
        if (!productId || !amount || !unitPrice) {
            showToast('Complete todos los campos del detalle', 'error');
            return;
        }

        if (parseFloat(amount) <= 0) {
            showToast('La cantidad debe ser mayor a 0', 'error');
            return;
        }

        const product = products.find(p => p.id === parseInt(productId));
        const subtotal = calculateSubtotal(amount, unitPrice);

        const detail = {
            productId: parseInt(productId),
            productName: product.name,
            amount: parseFloat(amount),
            unitPrice: parseFloat(unitPrice),
            subTotal: subtotal,
            observation: newDetail.observation || ''
        };

        setBillDetails(prev => [...prev, detail]);
        setNewDetail({ productId: '', amount: '', unitPrice: '', observation: '' });
        showToast('Detalle agregado', 'success');
    };

    const removeDetail = (index) => {
        setBillDetails(prev => prev.filter((_, i) => i !== index));
        showToast('Detalle eliminado', 'info');
    };

    const openObservationModal = (index) => {
        setEditingDetailIndex(index);
        setShowObservationModal(true);
    };

    const saveObservation = (observation) => {
        if (editingDetailIndex !== null) {
            setBillDetails(prev => prev.map((detail, i) => 
                i === editingDetailIndex ? { ...detail, observation } : detail
            ));
            showToast('Observación actualizada', 'success');
        }
    };

    const calculateTotal = () => {
        return billDetails.reduce((sum, detail) => sum + detail.subTotal, 0);
    };

    const handleSave = async () => {
        if (!selectedUser || !selectedClient || !paymentMethod) {
            showToast('Complete los datos de la factura (Usuario, Cliente, Método de Pago)', 'error');
            return;
        }

        if (billDetails.length === 0) {
            showToast('Agregue al menos un detalle a la factura', 'error');
            return;
        }

        try {
            setSaving(true);

            // 1. Crear la factura
            const billData = {
                user_id: parseInt(selectedUser),
                client_id: parseInt(selectedClient),
                total: calculateTotal(),
                payment_method: paymentMethod
            };

            const billResponse = await api.post('/bill/v1/api/new', billData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const savedBill = billResponse.data;
            const billId = savedBill.id;

            // 2. Crear los detalles de la factura
            const savedDetails = [];
            for (const detail of billDetails) {
                const detailData = {
                    billId: billId,
                    productId: detail.productId,
                    amount: detail.amount,
                    unitPrice: detail.unitPrice,
                    subTotal: detail.subTotal,
                    observation: detail.observation || 'Null'
                };

                const detailResponse = await api.post('/bill/detail', detailData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                savedDetails.push(detailResponse.data);
            }

            // Guardar los datos para impresión
            setLastSavedBill(savedBill);
            setLastSavedDetails(savedDetails);

            showToast('Factura guardada exitosamente', 'success');
            
            // Preguntar si desea imprimir
            setTimeout(() => {
                if (window.confirm('¿Desea imprimir la factura?')) {
                    setShowPrintModal(true);
                } else {
                    clearForm();
                }
            }, 1000);

        } catch (error) {
            console.error('Error saving bill:', error);
            showToast('Error al guardar la factura', 'error');
        } finally {
            setSaving(false);
        }
    };

    const clearForm = () => {
        setSelectedUser('');
        setSelectedClient('');
        setPaymentMethod('');
        setBillDetails([]);
        setNewDetail({ productId: '', amount: '', unitPrice: '', observation: '' });
    };

    const saveOrder = () => {
        if (!selectedUser || !selectedClient || !paymentMethod || billDetails.length === 0) {
            showToast('Complete todos los datos antes de guardar el pedido', 'error');
            return;
        }

        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            userId: parseInt(selectedUser),
            clientId: parseInt(selectedClient),
            paymentMethod,
            details: billDetails,
            total: calculateTotal()
        };

        const orders = JSON.parse(localStorage.getItem('savedOrders') || '[]');
        orders.push(order);
        localStorage.setItem('savedOrders', JSON.stringify(orders));
        
        setSavedOrders(orders);
        showToast('Pedido guardado correctamente', 'success');
        clearForm();
    };

    const loadOrder = (order) => {
        setSelectedUser(order.userId.toString());
        setSelectedClient(order.clientId.toString());
        setPaymentMethod(order.paymentMethod);
        setBillDetails(order.details);
        setShowOrdersModal(false);
        showToast('Pedido cargado', 'info');
    };

    const deleteOrder = (orderId) => {
        if (!window.confirm('¿Está seguro de eliminar este pedido?')) return;

        const orders = savedOrders.filter(o => o.id !== orderId);
        localStorage.setItem('savedOrders', JSON.stringify(orders));
        setSavedOrders(orders);
        showToast('Pedido eliminado', 'info');
    };

    const printCurrentOrder = () => {
        if (!selectedUser || !selectedClient || !paymentMethod || billDetails.length === 0) {
            showToast('Complete todos los datos para imprimir', 'error');
            return;
        }

        // Crear estructura temporal para impresión
        const user = users.find(u => u.id === parseInt(selectedUser));
        const client = clients.find(c => c.id === parseInt(selectedClient));

        const tempBill = {
            id: 'BORRADOR',
            userId: user,
            clientId: client,
            paymentMethod,
            total: calculateTotal(),
            creationDate: new Date().toISOString()
        };

        const tempDetails = billDetails.map(detail => ({
            productId: products.find(p => p.id === detail.productId),
            amount: detail.amount,
            unitPrice: detail.unitPrice,
            subTotal: detail.subTotal,
            observation: detail.observation
        }));

        setLastSavedBill(tempBill);
        setLastSavedDetails(tempDetails);
        setShowPrintModal(true);
    };

    const handleCancel = () => {
        if (window.confirm('¿Está seguro de cancelar? Se perderán los datos ingresados.')) {
            setSelectedUser('');
            setSelectedClient('');
            setPaymentMethod('');
            setBillDetails([]);
            setNewDetail({ productId: '', amount: '', unitPrice: '', observation: '' });
            showToast('Operación cancelada', 'info');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
            `}</style>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ObservationModal
                isOpen={showObservationModal}
                onClose={() => {
                    setShowObservationModal(false);
                    setEditingDetailIndex(null);
                }}
                observation={editingDetailIndex !== null ? billDetails[editingDetailIndex]?.observation : ''}
                onSave={saveObservation}
            />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Nueva Factura</h1>
                            <p className="text-gray-600">Crea una nueva factura y sus detalles</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button
                                onClick={() => setShowOrdersModal(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Pedidos ({savedOrders.length})
                            </button>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Fecha</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {new Date().toLocaleDateString('es-ES')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {/* Datos de la factura */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usuario <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cliente <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Método de Pago <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar método</option>
                                    <option value="CASH">💵 Efectivo</option>
                                    <option value="CREDIT_CARD">💳 Tarjeta</option>
                                    <option value="TRANSFER">🏦 Transferencia</option>
                                </select>
                            </div>
                        </div>

                        {/* Agregar detalles */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Detalles de Factura</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                                    <select
                                        value={newDetail.productId}
                                        onChange={(e) => handleProductChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar producto</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                    <input
                                        type="number"
                                        value={newDetail.amount}
                                        onChange={(e) => setNewDetail(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unit.</label>
                                    <input
                                        type="number"
                                        value={newDetail.unitPrice}
                                        onChange={(e) => setNewDetail(prev => ({ ...prev, unitPrice: e.target.value }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={addDetail}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Agregar
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Observación (opcional)</label>
                                <input
                                    type="text"
                                    value={newDetail.observation}
                                    onChange={(e) => setNewDetail(prev => ({ ...prev, observation: e.target.value }))}
                                    placeholder="Observaciones del producto..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Tabla de detalles */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles de la Factura</h3>
                            
                            {billDetails.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500">No hay detalles agregados</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Precio Unit.</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Observación</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {billDetails.map((detail, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{detail.productName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{detail.amount}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(detail.unitPrice)}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(detail.subTotal)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                            {detail.observation || '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => openObservationModal(index)}
                                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                                    title="Editar observación"
                                                                >
                                                                    📝
                                                                </button>
                                                                <button
                                                                    onClick={() => removeDetail(index)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                                                    title="Eliminar detalle"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Total */}
                                    <div className="mt-6 flex justify-end">
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 min-w-[300px]">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold text-gray-700">Total:</span>
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {formatCurrency(calculateTotal())}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={saveOrder}
                                disabled={billDetails.length === 0}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Guardar Pedido
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancelar
                                </button>

                                <button
                                    onClick={printCurrentOrder}
                                    disabled={billDetails.length === 0}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimir
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving || billDetails.length === 0}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            Guardar Factura
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Pedidos Guardados */}
                {showOrdersModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                                <h2 className="text-2xl font-bold">Pedidos Guardados ({savedOrders.length})</h2>
                                <button
                                    onClick={() => setShowOrdersModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                {savedOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">No hay pedidos guardados</p>
                                        <p className="text-gray-400 text-sm mt-2">Guarda pedidos para procesarlos más tarde</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {savedOrders.map(order => {
                                            const user = users.find(u => u.id === order.userId);
                                            const client = clients.find(c => c.id === order.clientId);
                                            
                                            return (
                                                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-sm font-semibold text-gray-500">Pedido #{order.id}</span>
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                                                                    {order.paymentMethod}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Cliente: </span>
                                                                    <span className="font-semibold text-gray-900">{client?.name || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Usuario: </span>
                                                                    <span className="font-semibold text-gray-900">{user?.name || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Fecha: </span>
                                                                    <span className="text-gray-900">{new Date(order.date).toLocaleString('es-ES')}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Items: </span>
                                                                    <span className="text-gray-900">{order.details.length}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <span className="text-lg font-bold text-blue-600">{formatCurrency(order.total)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => loadOrder(order)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                                                title="Cargar pedido"
                                                            >
                                                                📋 Cargar
                                                            </button>
                                                            <button
                                                                onClick={() => deleteOrder(order.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                                                title="Eliminar pedido"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Detalles del pedido */}
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">PRODUCTOS:</p>
                                                        <div className="space-y-1">
                                                            {order.details.map((detail, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <span className="text-gray-700">{detail.productName} x{detail.amount}</span>
                                                                    <span className="text-gray-900 font-semibold">{formatCurrency(detail.subTotal)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowOrdersModal(false)}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Impresión */}
                {showPrintModal && lastSavedBill && (
                    <PrintBill
                        bill={lastSavedBill}
                        billDetails={lastSavedDetails}
                        onClose={() => {
                            setShowPrintModal(false);
                            clearForm();
                        }}
                    />
                )}
            </div>
        </>
    );
}