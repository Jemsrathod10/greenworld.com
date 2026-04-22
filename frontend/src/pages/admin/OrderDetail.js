import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ✅ ADDED: Icons for Toast
import { ArrowLeft, User, Package, CreditCard, Save, Truck, MapPin, Phone, Mail, CheckCircle, AlertTriangle, X } from 'lucide-react';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NEW: State for Custom Toast Notification
  const [toast, setToast] = useState(null);

  // ✅ NEW: Helper function to show custom notification
  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    // Auto hide after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const res = await fetch(`/orders/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch order`);
      }

      const data = await res.json();
      
      if (data.success && data.order) {
        setOrder(data.order);
        setStatus(data.order.status || 'pending');
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    // 🛡️ START: Added Sequence Validation Logic
    const statusRank = {
      'pending': 1,
      'confirmed': 2,
      'processing': 3,
      'shipped': 4,
      'out for delivery': 5,
      'delivered': 6,
      'cancelled': 0,
      'returned': 0,
      'refunded': 0
    };

    if (order && status.toLowerCase() !== 'cancelled') {
        const currentRank = statusRank[order.status?.toLowerCase()] || 0;
        const newRank = statusRank[status.toLowerCase()] || 0;

        if (newRank !== 0 && newRank < currentRank) {
            showNotification('Action Invalid', `Order already reached ${order.status}, cannot move back to ${status}`, 'error');
            return;
        }
    }
    // 🛡️ END: Added Sequence Validation Logic

    // ✅ ADDED LOGIC: Prevent update if order is already finished
    const finalStatuses = ['delivered', 'cancelled', 'refunded', 'returned'];
    if (order && finalStatuses.includes(order.status?.toLowerCase())) {
      showNotification('Action Denied', 'Completed or Cancelled orders cannot be modified.', 'error');
      return;
    }

    if (!status) {
      // ✅ CHANGED: Use Toast instead of alert
      showNotification('Warning', 'Please select a status', 'error');
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // ✅ CHANGED: Use Toast instead of alert
        showNotification('Status Updated', 'Order status updated successfully', 'success');
        // Refresh the order data
        await fetchOrderDetails();
      } else {
        showNotification('Update Failed', data.message || 'Unknown error', 'error');
      }
    } catch (err) {
      console.error('Status update error:', err);
      showNotification('Error', err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // 🎨 RETRO ORDER DETAIL STYLES
  const styles = `
    .detail-page {
      padding: 3rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: var(--secondary-color);
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
      margin-bottom: 2rem;
      transition: 0.2s;
    }

    .back-btn:hover {
      color: var(--primary-color);
    }

    .detail-card {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: var(--border-radius);
      border: 3px solid var(--secondary-color);
      box-shadow: 10px 10px 0px rgba(93, 109, 54, 0.2);
      padding: 2.5rem;
    }

    .header-section {
      border-bottom: 2px dashed #eee;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    .order-title {
      font-family: 'Fraunces', serif;
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .order-meta {
      color: #666;
      font-size: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
    }

    /* STATUS CONTROL PANEL */
    .status-panel {
      background: #fdf8e4;
      border: 2px solid var(--accent-color);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .panel-label {
      font-weight: bold;
      color: var(--secondary-color);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .control-group {
      display: flex;
      gap: 1rem;
    }

    .status-select {
      flex: 1;
      padding: 10px 15px;
      border: 2px solid #ccc;
      border-radius: 8px;
      font-family: 'Quicksand', sans-serif;
      font-size: 1rem;
      background: white;
      cursor: pointer;
    }

    .btn-update {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: 0.3s;
      white-space: nowrap;
    }

    .btn-update:hover:not(:disabled) {
      background: #b34500;
      transform: translateY(-2px);
    }

    .btn-update:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* SHIPPING INFO */
    .shipping-info {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border-left: 4px solid var(--secondary-color);
    }

    .shipping-info h3 {
      font-family: 'Fraunces', serif;
      color: var(--secondary-color);
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      color: #555;
    }

    /* ITEMS LIST */
    .items-section {
      margin-bottom: 2rem;
    }

    .items-section h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
      color: var(--secondary-color);
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--secondary-color);
      padding-bottom: 5px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
      font-size: 1rem;
    }

    .item-name {
      font-weight: 600;
      color: #333;
    }

    .item-qty {
      color: #666;
      font-size: 0.9rem;
      margin-top: 4px;
    }

    .total-section {
      margin-top: 2rem;
      text-align: right;
      font-family: 'Fraunces', serif;
      font-size: 1.8rem;
      color: var(--primary-color);
      border-top: 2px dashed #ddd;
      padding-top: 1rem;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid #f5c6cb;
    }

    @media (max-width: 600px) {
      .control-group { 
        flex-direction: column; 
      }
      .order-meta {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    /* ✅ RETRO TOAST STYLES */
    .custom-toast-overlay {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .retro-toast {
      background: #fffcf5;
      border: 2px solid var(--secondary-color);
      border-left: 8px solid var(--secondary-color);
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 6px 6px 0px rgba(93, 109, 54, 0.15);
      display: flex;
      align-items: center;
      gap: 15px;
      min-width: 320px;
      max-width: 450px;
    }

    .retro-toast.error {
      border-color: #e74c3c;
      border-left-color: #e74c3c;
      box-shadow: 6px 6px 0px rgba(231, 76, 60, 0.15);
    }

    .toast-content h4 {
      margin: 0;
      font-family: 'Fraunces', serif;
      color: var(--secondary-color);
      font-size: 1.1rem;
    }

    .retro-toast.error .toast-content h4 { color: #c0392b; }

    .toast-content p {
      margin: 4px 0 0 0;
      font-family: 'Quicksand', sans-serif;
      color: #555;
      font-size: 0.95rem;
    }

    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;

  if (loading) {
    return (
      <div style={{textAlign:'center', padding:'50px', background:'var(--bg-color)', minHeight:'100vh'}}>
        <h2 style={{fontFamily:'Fraunces', color:'var(--secondary-color)'}}>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <style>{styles}</style>
        <button onClick={() => navigate('/admin/orders')} className="back-btn">
          <ArrowLeft size={20} /> Back to Orders
        </button>
        <div className="detail-card">
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
          <button onClick={fetchOrderDetails} className="btn-update">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="detail-page">
        <style>{styles}</style>
        <button onClick={() => navigate('/admin/orders')} className="back-btn">
          <ArrowLeft size={20} /> Back to Orders
        </button>
        <div className="detail-card">
          <h2>Order not found</h2>
        </div>
      </div>
    );
  }

  // Calculate total safely
  const orderTotal = order.totalPrice || order.pricing?.total || 
    (order.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0);

  return (
    <div className="detail-page">
      <style>{styles}</style>
      
      {/* ✅ CUSTOM TOAST COMPONENT */}
      {toast && (
        <div className="custom-toast-overlay">
          <div className={`retro-toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle size={32} color="#2d5a27" />
            ) : (
              <AlertTriangle size={32} color="#e74c3c" />
            )}
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
            <button 
                onClick={() => setToast(null)} 
                style={{background:'none', border:'none', cursor:'pointer', marginLeft:'auto'}}>
                <X size={18} color="#999" />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => navigate('/admin/orders')} className="back-btn">
        <ArrowLeft size={20} /> Back to Orders
      </button>

      <div className="detail-card">
        
        {/* Header */}
        <div className="header-section">
          <h2 className="order-title">
            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
          </h2>
          <div className="order-meta">
            <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
              <User size={16}/> {order.user?.name || order.user?.email || 'Guest'}
            </span>
            <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
              <CreditCard size={16}/> {order.paymentMethod || 'Online'}
            </span>
            <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
              📅 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Status Control Panel */}
        <div className="status-panel">
          <label className="panel-label">
            <Truck size={18}/> Update Order Status
          </label>
          <div className="control-group">
            <select 
              className="status-select"
              value={status || ''} 
              onChange={e => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              
              {/* ✅ FIXED: Corrected the Enum Value Here */}
              <option value="Out for Delivery">Out for Delivery</option>
              
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
              <option value="refunded">Refunded</option>
            </select>
            <button className="btn-update" onClick={handleStatusChange} disabled={updating}>
              <Save size={18}/> {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        {/* Shipping Information */}
        {order.shippingAddress && (
          <div className="shipping-info">
            <h3>Shipping Information</h3>
            <div className="info-row">
              <MapPin size={16} />
              <span>
                {order.shippingAddress.fullName || ''}, {order.shippingAddress.address || ''}, 
                {order.shippingAddress.city || ''}, {order.shippingAddress.state || ''} - 
                {order.shippingAddress.pincode || order.shippingAddress.zipCode || ''}
              </span>
            </div>
            {order.shippingAddress.phone && (
              <div className="info-row">
                <Phone size={16} />
                <span>{order.shippingAddress.phone}</span>
              </div>
            )}
            {order.shippingAddress.email && (
              <div className="info-row">
                <Mail size={16} />
                <span>{order.shippingAddress.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="items-section">
          <h3>
            <Package size={20} /> Items Ordered
          </h3>
          <div>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={item._id || index} className="item-row">
                  <div>
                    <div className="item-name">
                      {item.product?.name || item.name || 'Unknown Product'}
                    </div>
                    <div className="item-qty">
                      Qty: {item.quantity || 1} × ₹{Number(item.price || 0).toFixed(2)}
                    </div>
                  </div>
                  <div style={{fontWeight:'bold'}}>
                    ₹{((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p>No items found</p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="total-section">
          Total: ₹{Number(orderTotal).toFixed(2)}
        </div>

      </div>
    </div>
  );
}

export default OrderDetail;