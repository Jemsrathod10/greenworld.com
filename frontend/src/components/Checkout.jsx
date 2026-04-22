import React, { useState } from 'react';
import { useCart } from '../context/CartContext'; 
// ✅ Icons for Toast
import { CheckCircle, FileText, Loader2, CreditCard, Truck, Smartphone, ShoppingBag, AlertTriangle, X } from 'lucide-react';
import './checkout.css'; 

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbOrder, setDbOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    cardName: '', cardNumber: '', expiryDate: '', cvv: '', upiId: ''
  });

  // ✅ State for Custom Toast Notification
  const [toast, setToast] = useState(null);

  // ✅ Helper function to show custom notification
  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    // Auto hide after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculations
  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 50; 
  const tax = subtotal * 0.18; 
  const finalTotal = subtotal + shipping + tax;

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        showNotification('Missing Details', 'Please fill in all Card details.', 'error');
        return false;
      }
    }
    if (paymentMethod === 'upi' && !formData.upiId) {
      showNotification('Missing Details', 'Please enter a UPI ID.', 'error');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) { 
        showNotification('Cart Empty', 'Your cart is empty!', 'error');
        return; 
    }
    if (!validateForm()) return;

    setIsProcessing(true);
    const token = localStorage.getItem('token');

    const orderData = {
      orderItems: cartItems.map(item => ({
        product: item._id, 
        name: item.name, 
        price: item.price, 
        qty: item.qty, 
        image: item.image,
        subtotal: item.price * item.qty
      })),
      paymentMethod: paymentMethod, 
      shippingAddress: {
        address: "Main St", 
        city: "Surat", 
        postalCode: "395007", 
        country: "India", 
        phone: "9999999999",
        firstName: formData.cardName || "Guest", 
        lastName: "User" 
      },
      totalPrice: finalTotal, 
      taxPrice: tax, 
      shippingPrice: shipping
    };

    try {
      // ✅ FIXED: Fetch now dynamically uses the current IP and points to Port 5000
      const apiUrl = `${window.location.origin.replace(':3000', ':5000')}/api/orders/simple`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setDbOrder(result.order);
        setTimeout(() => {
          setIsProcessing(false);
          setOrderPlaced(true);
          clearCart();
        }, 2000);
      } else {
        setIsProcessing(false);
        showNotification('Payment Failed', 'Transaction could not be completed.', 'error');
      }
    } catch (e) {
      setIsProcessing(false);
      console.error(e);
      showNotification('Error', 'Server connection failed.', 'error');
    }
  };

  // 🎨 TOAST STYLES
  const styles = `
    .custom-toast-overlay {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .retro-toast {
      background: #fffcf5;
      border: 2px solid var(--secondary-color, #5d6d36);
      border-left: 8px solid var(--secondary-color, #5d6d36);
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
      color: var(--secondary-color, #5d6d36);
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

  if (orderPlaced) return (
    <div className="success-wrapper">
      <div className="success-card">
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
            <CheckCircle size={80} color="var(--secondary-color)" fill="var(--accent-color)" />
        </div>
        <h1 style={{ fontFamily: 'Fraunces', color: 'var(--text-color)', fontSize:'2.5rem' }}>Order Confirmed!</h1>
        <p style={{ fontSize: '1.2rem', margin:'10px 0', color: '#555' }}>
            Order ID: <strong>{dbOrder?.orderNumber || dbOrder?._id}</strong>
        </p>
        <p>Your plants are getting ready for their new home. 🌱</p>
        
        <button className="btn btn-primary" style={{marginTop:'30px', width:'100%'}} onClick={() => window.location.href='/'}>
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="checkout-container">
      <style>{styles}</style>
      
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

      <div className="checkout-grid">
        <div className="checkout-card">
          <h2 className="section-title"><CreditCard color="var(--primary-color)"/> Payment Method</h2>
          <div className="payment-methods">
             <button className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
               <CreditCard size={28} /> <span>CARD</span>
             </button>
             <button className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>
               <Smartphone size={28} /> <span>UPI</span>
             </button>
             <button className={`method-btn ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
               <Truck size={28} /> <span>COD</span>
             </button>
          </div>

          <div className="form-area">
            {paymentMethod === 'card' && (
              <div className="form-group">
                <input className="checkout-input" style={{marginBottom:'15px'}} name="cardNumber" placeholder="Card Number (16 digits)" maxLength="16" onChange={handleInputChange} />
                <input className="checkout-input" style={{marginBottom:'15px'}} name="cardName" placeholder="Name on Card" onChange={handleInputChange} />
                <div className="input-row">
                  <input className="checkout-input" name="expiryDate" placeholder="MM/YY" maxLength="5" onChange={handleInputChange} />
                  <input className="checkout-input" name="cvv" placeholder="CVV" maxLength="3" type="password" onChange={handleInputChange} />
                </div>
              </div>
            )}
            {paymentMethod === 'upi' && (
              <input className="checkout-input" name="upiId" placeholder="Enter UPI ID (e.g. name@bank)" onChange={handleInputChange} />
            )}
            {paymentMethod === 'cod' && (
              <div style={{ padding: '20px', background: '#fbf8e8', border: '2px dashed var(--accent-color)', borderRadius: '15px', textAlign: 'center', fontWeight:'bold', color: 'var(--text-color)' }}>
                  Pay with Cash when your plants arrive! 🚚
              </div>
            )}
          </div>
          
          <button className="btn-pay" onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="animate-spin" /> : `Pay ₹${finalTotal.toFixed(2)}`}
          </button>
        </div>

        <div className="checkout-card" style={{ height: 'fit-content' }}>
          <h3 className="section-title"><FileText color="var(--primary-color)"/> Order Summary</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight:'5px' }}>
            {cartItems.length > 0 ? cartItems.map((item, i) => (
              <div key={i} className="summary-item">
                <span>{item.name} <span style={{color:'var(--accent-color)', fontWeight:'bold'}}>x{item.qty}</span></span>
                <span>₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            )) : <p>Cart is empty</p>}
          </div>
          <div className="breakdown-section">
            <div className="summary-item"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="summary-item"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
            <div className="summary-item"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="total-row"><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}