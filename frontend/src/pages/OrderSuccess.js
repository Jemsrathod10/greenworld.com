import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Package, Clock, CheckCircle, XCircle, FileText, ShoppingBag, Truck, AlertTriangle, X } from 'lucide-react';
import CustomConfirmModal from '../components/CustomConfirmModal';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      setLoading(false);
    } catch {
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const initiateCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirm(true);
  };

  const executeCancelOrder = async () => {
    setShowConfirm(false); 
    if (!selectedOrderId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/orders/${selectedOrderId}/cancel`,
        { reason: 'Customer requested cancellation' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification('Order Cancelled', 'Your order has been successfully cancelled.', 'success');
        fetchOrders(); 
      } else {
        showNotification('Cancellation Failed', response.data.message || 'Failed to cancel order', 'error');
      }
    } catch (error) {
      showNotification('Error', error.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { bg: '#fff3cd', color: '#856404', icon: <Clock size={16}/> };
      case 'confirmed': return { bg: '#d1ecf1', color: '#0c5460', icon: <CheckCircle size={16}/> };
      case 'processing': return { bg: '#e2e3e5', color: '#383d41', icon: <Package size={16}/> };
      case 'shipped': return { bg: '#d4edda', color: '#155724', icon: <Truck size={16}/> }; 
      case 'delivered': return { bg: '#c3e6cb', color: '#155724', icon: <CheckCircle size={16}/> };
      case 'cancelled': return { bg: '#f8d7da', color: '#721c24', icon: <XCircle size={16}/> };
      default: return { bg: '#f8f9fa', color: '#666', icon: <Package size={16}/> };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const resolveImageUrl = (item) => {
    if (item.image && typeof item.image === 'string') return item.image;
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const img = item.images[0];
      return typeof img === 'object' ? (img.url || img.secure_url) : img;
    }
    if (item.product?.image) return item.product.image;
    if (item.product?.images?.[0]) {
      const pImg = item.product.images[0];
      return typeof pImg === 'object' ? (pImg.url || pImg.secure_url) : pImg;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Plant')}&background=79ac78&color=fff`;
  };

  // Improved Base64 Loader with proper error handling
  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null); // Return null if image fails
      img.src = url;
    });
  };

  const generateInvoice = async (order) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    const orderItems = order.items || [];
    
    // PRE-LOAD ALL IMAGES BEFORE CREATING TABLE
    const imagePromises = orderItems.map(item => getBase64ImageFromURL(resolveImageUrl(item)));
    const loadedImages = await Promise.all(imagePromises);

    const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gstAmount = subtotal * 0.18; 
    const discount = Number(order.pricing?.discount || 0);
    const shipping = Number(order.pricing?.shippingCost || 0);
    const grandTotal = subtotal + gstAmount + shipping - discount;

    // Header logic
    doc.setFillColor(76, 92, 45); 
    doc.rect(0, 0, pageWidth, 100, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("GREEN WORLDS", margin, 55); 
    doc.setFontSize(10);
    doc.text("Premium Indoor & Outdoor Plants", margin, 75);

    doc.setFontSize(9);
    doc.text("Email: info@greenworlds.com", pageWidth - margin, 45, { align: 'right' });
    doc.text("Phone: +91 98765 43210", pageWidth - margin, 60, { align: 'right' });
    doc.text("www.greenworlds.com", pageWidth - margin, 75, { align: 'right' });

    doc.setTextColor(76, 92, 45);
    doc.setFontSize(22);
    doc.text("INVOICE", margin, 140);

    // Invoice details boxes
    doc.setFillColor(248, 249, 245);
    doc.rect(margin, 160, (pageWidth / 2) - margin - 10, 115, 'F'); 
    doc.rect(pageWidth / 2 + 10, 160, (pageWidth / 2) - margin - 10, 115, 'F'); 

    doc.setTextColor(76, 92, 45);
    doc.setFontSize(11);
    doc.text("INVOICE DETAILS", margin + 10, 175);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No:   ${order.orderNumber || order._id.slice(-8).toUpperCase()}`, margin + 10, 195);
    doc.text(`Order Date:  ${formatDate(order.createdAt)}`, margin + 10, 210);
    doc.text(`Payment:      ${order.payment?.method?.toUpperCase() || 'COD'}`, margin + 10, 225);
    doc.text(`Status:        ${order.status?.toUpperCase() || 'PENDING'}`, margin + 10, 240);

    const billToX = pageWidth / 2 + 20;
    doc.setTextColor(76, 92, 45);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", billToX, 175);
    const b = order.billing || {};
    const fullName = `${b.firstName || ''} ${b.lastName || ''}`.trim().replace(/\s*user$/i, '') || 'Customer';

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Name:   ${fullName}`, billToX, 195);
    doc.setFont("helvetica", "normal");
    doc.text(`Email:   ${b.email || 'N/A'}`, billToX, 210);

    const addr = b.address || {};
    const fullAddress = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ');
    doc.text("Address:", billToX, 225);
    doc.text(fullAddress || 'N/A', billToX, 237, { maxWidth: 180 });

    const tableData = orderItems.map((item, i) => [
      i + 1,
      '', // Space for image
      item.name || 'Plant',
      item.quantity || 1,
      `Rs ${Number(item.price).toFixed(2)}`,
      `Rs ${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 295,
      head: [["#", "Img", "Item Description", "Qty", "Price", "Total"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [240, 242, 235], textColor: [76, 92, 45], lineColor: [0, 0, 0], lineWidth: 0.5 },
      styles: { fontSize: 9, cellPadding: 8, minCellHeight: 50, valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.5 },
      columnStyles: { 1: { cellWidth: 60 }, 5: { halign: 'right' } },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const imgBase64 = loadedImages[data.row.index];
          if (imgBase64) {
            doc.addImage(imgBase64, 'PNG', data.cell.x + 5, data.cell.y + 5, 50, 40);
          }
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    const totalX = pageWidth - margin;
    doc.setFontSize(10);
    doc.text("Subtotal:", totalX - 160, finalY);
    doc.text(`Rs ${subtotal.toFixed(2)}`, totalX, finalY, { align: 'right' });
    doc.text("GST (18%):", totalX - 160, finalY + 20);
    doc.text(`Rs ${gstAmount.toFixed(2)}`, totalX, finalY + 20, { align: 'right' });
    doc.setTextColor(200, 0, 0);
    doc.text(`Discount: - Rs ${discount.toFixed(2)}`, totalX, finalY + 40, { align: 'right' });

    doc.setDrawColor(0, 0, 0);
    doc.line(totalX - 220, finalY + 55, totalX, finalY + 55);
    doc.setFontSize(14);
    doc.setTextColor(76, 92, 45);
    doc.text("GRAND TOTAL:", totalX - 220, finalY + 80);
    doc.text(`Rs ${grandTotal.toFixed(2)}`, totalX, finalY + 80, { align: 'right' });

    doc.save(`Invoice_${order.orderNumber || order._id}.pdf`);
  };

  const styles = `
    .orders-container { max-width: 1000px; margin: 0 auto; padding: 4rem 1rem; font-family: 'Quicksand', sans-serif; background: var(--bg-color); }
    .page-title { font-family: 'Fraunces', serif; font-size: 2.5rem; text-align: center; margin-bottom: 3rem; }
    .order-card { background: white; border: 2px solid var(--secondary-color); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15); }
    .order-header { display: flex; justify-content: space-between; border-bottom: 2px dashed #eee; padding-bottom: 1rem; margin-bottom: 1rem; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 30px; font-weight: bold; font-size: 0.85rem; }
    .order-items { background: #f9f9f9; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; }
    .item-row { display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .item-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #ddd; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; }
    .total-price { font-family: 'Fraunces', serif; font-size: 1.4rem; color: var(--primary-color); }
    .btn-action { padding: 8px 16px; border-radius: 50px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .btn-invoice { background: var(--secondary-color); color: white; border: none; }
    .btn-cancel { background: white; color: #e74c3c; border: 2px solid #e74c3c; margin-left: 10px; }
  `;

  if (loading) return <div style={{textAlign:'center', padding:'4rem'}}>Loading Orders...</div>;

  return (
    <div className="orders-container">
      <style>{styles}</style>
      <CustomConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={executeCancelOrder} title="Cancel Order?" message="Are you sure you want to cancel this order?" />
      <h1 className="page-title">My Order History</h1>
      {orders.length === 0 ? (
        <div style={{textAlign:'center', padding:'3rem'}}>No orders found</div>
      ) : (
        <div>
          {orders.map((order) => {
            const statusStyle = getStatusColor(order.status);
            const subtotal = (order.items || []).reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const displayTotal = subtotal + (subtotal * 0.18) + (order.pricing?.shippingCost || 0) - (order.pricing?.discount || 0);
            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3 style={{fontFamily:'Fraunces', margin:0}}>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h3>
                    <p style={{fontSize:'0.9rem', color:'#666'}}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                    {statusStyle.icon} {order.status}
                  </div>
                </div>
                <div className="order-items">
                  {order.items?.map((item, i) => (
                    <div key={i} className="item-row">
                      <img src={resolveImageUrl(item)} alt={item.name} className="item-img" />
                      <div>
                        <h4 style={{margin:0}}>{item.name}</h4>
                        <p style={{margin:0, fontSize:'0.9rem', color:'#666'}}>{item.quantity} x ₹{item.price}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>₹{(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Grand Total (Incl. 18% GST)</span>
                    <div className="total-price">₹{displayTotal.toFixed(2)}</div>
                  </div>
                  <div>
                    <button onClick={() => generateInvoice(order)} className="btn-action btn-invoice"><FileText size={16}/> Invoice</button>
                    {(order.status === 'pending') && (
                      <button onClick={() => initiateCancelOrder(order._id)} className="btn-action btn-cancel">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;