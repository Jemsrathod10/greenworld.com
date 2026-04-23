import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// ✅ ADDED: Icons for Toast Notification
import { Trash2, ShoppingBag, ArrowRight, CheckCircle, AlertTriangle, X } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateCartQty, getCartTotal } = useCart();
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

  const handleQuantityChange = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      updateCartQty(id, qty);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = getCartTotal();
  const shippingPrice = subtotal > 1000 ? 0 : 50;
  const taxPrice = subtotal * 0.18;
  const totalPrice = subtotal + shippingPrice + taxPrice;

  // 🎨 RETRO CART STYLES
  const styles = `
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 1rem;
      font-family: 'Quicksand', sans-serif;
      min-height: 80vh;
    }

    .section-title {
      font-family: 'Fraunces', serif;
      font-size: 2.5rem;
      color: var(--text-color);
      margin-bottom: 2rem;
      text-align: center;
      position: relative;
    }

    .section-title::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: var(--primary-color);
      margin: 10px auto 0;
      border-radius: 2px;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    /* ITEM CARD */
    .cart-item {
      background-color: white;
      border: 2px solid #eee;
      border-radius: 16px;
      padding: 1.5rem;
      display: grid;
      grid-template-columns: 100px 1fr auto auto;
      gap: 1.5rem;
      align-items: center;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
    }

    .cart-item:hover {
      border-color: var(--accent-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .cart-item img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 12px;
      border: 2px solid #eee;
    }

    .cart-item-details h3 {
      margin: 0 0 0.5rem 0;
      color: var(--secondary-color);
      font-family: 'Fraunces', serif;
      font-size: 1.2rem;
    }

    .cart-item-details p {
      margin: 0;
      color: #666;
      font-weight: 500;
    }

    /* QTY CONTROLS */
    .qty-controls {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: #f9f9f9;
      padding: 5px 10px;
      border-radius: 30px;
      border: 1px solid #ddd;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: white;
      color: var(--secondary-color);
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: 0.2s;
    }

    .qty-btn:hover {
      background: var(--accent-color);
      color: var(--text-color);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #e0e0e0;
    }

    .item-price-col {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    .price-text {
      font-weight: bold;
      font-size: 1.2rem;
      color: var(--primary-color);
    }

    .btn-remove {
      background: transparent;
      color: #e74c3c;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9rem;
      transition: 0.2s;
    }

    .btn-remove:hover {
      text-decoration: underline;
    }

    /* ORDER SUMMARY */
    .order-summary {
      background-color: white;
      border: 2px solid var(--secondary-color);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.2);
      position: sticky;
      top: 100px;
    }

    .summary-title {
      margin: 0 0 1.5rem 0;
      color: var(--secondary-color);
      font-size: 1.4rem;
      font-family: 'Fraunces', serif;
      border-bottom: 2px dashed var(--accent-color);
      padding-bottom: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      color: #555;
      font-size: 1rem;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #eee;
      font-size: 1.4rem;
      font-weight: bold;
      color: var(--primary-color);
      font-family: 'Fraunces', serif;
    }

    .btn-checkout {
      width: 100%;
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--primary-color);
      color: white;
      font-weight: bold;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: 0.3s;
      font-size: 1.1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }

    .btn-checkout:hover {
      background: #b34500;
      transform: translateY(-2px);
    }

    .btn-continue {
      width: 100%;
      margin-top: 1rem;
      padding: 0.8rem;
      background: transparent;
      color: var(--secondary-color);
      border: 2px solid var(--secondary-color);
      border-radius: 50px;
      text-align: center;
      text-decoration: none;
      display: block;
      font-weight: bold;
      transition: 0.3s;
    }

    .btn-continue:hover {
      background: var(--secondary-color);
      color: white;
    }

    /* EMPTY CART */
    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      border: 2px dashed #ddd;
      max-width: 600px;
      margin: 0 auto;
    }

    .empty-cart h2 {
      font-size: 2rem;
      color: var(--secondary-color);
      font-family: 'Fraunces', serif;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .cart-grid { grid-template-columns: 1fr; }
      .cart-item { grid-template-columns: 80px 1fr; gap: 1rem; }
      .item-price-col { align-items: flex-start; text-align: left; }
    }
  `;

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <style>{styles}</style>
        <div className="empty-cart">
          <ShoppingBag size={64} color="#ddd" style={{ marginBottom: '20px' }} />
          <h2>Your cart is empty</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Looks like you haven't added any green friends yet. 🌱
          </p>
          <Link to="/products" className="btn-checkout" style={{ width: 'auto', display: 'inline-flex' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
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

      <h1 className="section-title">Shopping Cart</h1>
      
      <div className="cart-grid">
        {/* Cart Items List */}
        <div>
          {cartItems.map(item => {
            const availableStock = item.stock?.quantity ?? item.stock ?? 0;
            
            return (
              <div key={item._id} className="cart-item">
                <img
                  src={item.image || 'https://via.placeholder.com/100?text=Plant'}
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Plant'; }}
                />
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price} each</p>
                  {availableStock > 0 && (
                    <p style={{fontSize: '0.85rem', color: '#27ae60', marginTop: '5px'}}>
                      {availableStock} in stock
                    </p>
                  )}
                </div>
                
                <div className="qty-controls">
                  <button 
                    onClick={() => handleQuantityChange(item._id, item.qty - 1)} 
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button
                    onClick={() => {
                      if (item.qty >= availableStock) {
                        // ✅ CHANGED: Use Toast instead of alert
                        showNotification('Stock Limit', `Maximum stock reached! Only ${availableStock} available.`, 'error');
                      } else {
                        handleQuantityChange(item._id, item.qty + 1);
                      }
                    }}
                    className="qty-btn"
                    disabled={item.qty >= availableStock}
                    title={item.qty >= availableStock ? `Only ${availableStock} in stock` : 'Increase quantity'}
                  >
                    +
                  </button>
                </div>
                
                <div className="item-price-col">
                  <span className="price-text">₹{(item.price * item.qty).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item._id)} className="btn-remove">
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>
          
          <div className="summary-row">
            <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingPrice === 0 ? <span style={{color:'green', fontWeight:'bold'}}>Free</span> : `₹${shippingPrice.toFixed(2)}`}</span>
          </div>
          
          <div className="summary-row">
            <span>Tax (18% GST)</span>
            <span>₹{taxPrice.toFixed(2)}</span>
          </div>

          {subtotal < 1000 && (
             <p style={{ fontSize: '0.9rem', color: '#e67e22', fontStyle: 'italic', marginTop:'10px' }}>
                💡 Add ₹{(1000 - subtotal).toFixed(2)} more for <strong>Free Shipping!</strong>
             </p>
          )}

          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          
          <button onClick={handleCheckout} className="btn-checkout">
            Proceed to Checkout <ArrowRight size={20} />
          </button>
          
          <Link to="/products" className="btn-continue">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
