import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// ✅ ADDED: Icons for Toast
import { RefreshCcw, Eye, ArrowLeft, Archive, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ NEW: State for Custom Toast Notification
  const [toast, setToast] = useState(null);

  // ✅ NEW: Helper function to show custom notification
  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    // Auto hide after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/orders', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setError('');
      } else {
        setOrders([]);
        setError(data.message || 'Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Failed to fetch orders: ' + err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // 🛡️ START: Added Sequence Validation Logic
    const currentOrder = orders.find(o => o._id === orderId);
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

    if (currentOrder && newStatus.toLowerCase() !== 'cancelled') {
      const currentRank = statusRank[currentOrder.status?.toLowerCase()] || 0;
      const newRank = statusRank[newStatus.toLowerCase()] || 0;
      
      if (newRank !== 0 && newRank < currentRank) {
        showNotification('Invalid Action', `Cannot move back from ${currentOrder.status} to ${newStatus}`, 'error');
        return;
      }
    }
    // 🛡️ END: Added Sequence Validation Logic

    // ✅ ADDED LOGIC: Prevent update if order is already finished
    const finalStatuses = ['delivered', 'cancelled', 'refunded', 'returned'];
    if (currentOrder && finalStatuses.includes(currentOrder.status?.toLowerCase())) {
      showNotification('Action Denied', 'This order is already finalized and cannot be changed.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders(); // Refresh
        // ✅ CHANGED: Use Toast instead of alert
        showNotification('Status Updated', 'Order status has been successfully updated.', 'success');
      } else {
        const errorData = await response.json();
        // ✅ CHANGED: Use Toast instead of alert
        showNotification('Update Failed', errorData.message || 'Could not update status', 'error');
      }
    } catch (error) {
      // ✅ CHANGED: Use Toast instead of alert
      showNotification('Error', error.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f39c12'; // Orange
      case 'confirmed': return '#3498db'; // Blue
      case 'processing': return '#9b59b6'; // Purple
      case 'shipped': return '#27ae60'; // Green
      case 'out for delivery': return '#e67e22'; // Dark Orange
      case 'delivered': return '#2d5a27'; // Dark Green
      case 'cancelled': return '#c0392b'; // Red
      case 'returned': return '#7f8c8d'; // Grey
      case 'refunded': return '#95a5a6'; // Grey
      default: return '#7f8c8d'; // Grey
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  // 🎨 RETRO ADMIN TABLE STYLES
  const styles = `
    .admin-orders-page {
      padding: 3rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-family: 'Fraunces', serif;
      font-size: 2.2rem;
      color: var(--secondary-color);
      margin: 0;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      color: var(--secondary-color);
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
    }

    .refresh-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: 0.3s;
      box-shadow: 0 4px 10px rgba(211, 84, 0, 0.2);
    }

    .refresh-btn:hover {
      background: #b34500;
      transform: translateY(-2px);
    }

    .table-card {
      background: white;
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15); /* Retro Shadow */
      overflow: hidden; /* For rounded corners on table */
    }

    .table-container {
      overflow-x: auto;
    }

    .retro-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
    }

    .retro-table th {
      background: var(--secondary-color);
      color: white;
      padding: 1rem;
      text-align: left;
      font-family: 'Fraunces', serif;
      font-size: 1.1rem;
    }

    .retro-table td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
      color: #555;
      font-weight: 500;
    }

    .retro-table tr:hover {
      background-color: #fbf8e8; /* Light Cream Hover */
    }

    .status-select {
      padding: 6px 12px;
      border-radius: 20px;
      border: none;
      font-weight: bold;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      appearance: none;
      text-align: center;
    }

    .user-info strong {
      display: block;
      color: var(--text-color);
    }
    
    .user-email {
      font-size: 0.85rem;
      color: #888;
    }

    .view-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid var(--secondary-color);
      color: var(--secondary-color);
      border-radius: 20px;
      text-decoration: none;
      font-weight: bold;
      font-size: 0.9rem;
      transition: 0.2s;
    }

    .view-btn:hover {
      background: var(--secondary-color);
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      border: 2px dashed #ddd;
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
      box-shadow: 6px 6px 0px rgba(45, 90, 39, 0.15);
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

  if (loading) return (
    <div style={{textAlign:'center', padding:'50px', background:'var(--bg-color)', minHeight:'100vh'}}>
      <h2 style={{fontFamily:'Fraunces', color:'var(--secondary-color)'}}>Loading Orders...</h2>
    </div>
  );

  if (error) return (
    <div style={{textAlign:'center', padding:'50px', color:'red'}}>
      <h3>Error: {error}</h3>
      <button onClick={fetchOrders}>Retry</button>
    </div>
  );

  return (
    <div className="admin-orders-page">
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

      <div className="page-header">
        <div>
          <button onClick={() => navigate('/admin')} className="back-btn">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h2 className="page-title">Manage Orders ({orders.length})</h2>
        </div>
        <button onClick={fetchOrders} className="refresh-btn">
          <RefreshCcw size={18} /> Refresh List
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Archive size={48} color="#ccc" style={{marginBottom:'15px'}}/>
          <h3>No orders found</h3>
          <p style={{color:'#666'}}>The shop is quiet... for now. 🍃</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-container">
            <table className="retro-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const orderNumber = order.orderNumber || order._id?.slice(-6).toUpperCase();
                  const userName = order.user?.name || order.user?.firstName || 'Guest';
                  const userEmail = order.user?.email || 'N/A';
                  const orderTotal = order.totalPrice || order.pricing?.total || 0;
                  
                  return (
                    <tr key={order._id || index}>
                      <td><strong>#{orderNumber}</strong></td>
                      
                      <td className="user-info">
                        <strong>{userName}</strong>
                        <span className="user-email">{userEmail}</span>
                      </td>
                      
                      <td>{order.items?.length || 0} items</td>
                      
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="status-select"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          
                          {/* ✅ ADDED: Missing Statuses */}
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      
                      <td><strong>₹{Number(orderTotal).toFixed(2)}</strong></td>
                      
                      <td>{formatDate(order.createdAt)}</td>
                      
                      <td>
                        <Link to={`/admin/order/${order._id}`} className="view-btn">
                          <Eye size={16} /> Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;