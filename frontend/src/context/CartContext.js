import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import axios from 'axios'; 
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;
    
    case 'ADD_TO_CART':
      const existItem = state.find(x => x._id === action.payload._id);
      if (existItem) {
        return state.map(x =>
          x._id === existItem._id ? { ...x, qty: x.qty + action.payload.qty } : x
        );
      } else {
        return [...state, action.payload];
      }
    
    case 'REMOVE_FROM_CART':
      return state.filter(x => x._id !== action.payload);
    
    case 'UPDATE_CART_QTY':
      return state.map(x =>
        x._id === action.payload.id ? { ...x, qty: action.payload.qty } : x
      );
    
    case 'CLEAR_CART':
      return [];
    
    default:
      return state;
  }
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const [toast, setToast] = useState(null);

  // ✅ DYNAMIC API URL: Use current hostname (IP) instead of localhost for mobile sync
  const API_URL = `http://${window.location.hostname}:5000/api/cart`;

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };

  const getProductImage = (product) => {
    if (!product) return 'https://ui-avatars.com/api/?name=Plant&background=79ac78&color=fff';
    if (typeof product.image === 'string' && product.image.length > 0) return product.image;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImg = product.images[0];
      return typeof firstImg === 'object' ? (firstImg.url || firstImg.secure_url) : firstImg;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Plant')}&background=79ac78&color=fff`;
  };

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      const saved = localStorage.getItem('cartItems');
      if (saved) dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
      return;
    }

    try {
      // Fetching from DB using Dynamic IP
      const { data } = await axios.get(API_URL, getAuthConfig()); 
      if (data && data.items) {
        const formattedItems = data.items.map(item => ({
          ...item.product,
          qty: item.quantity,
          _id: item.product?._id,
          cartItemId: item._id,
          image: getProductImage(item.product) 
        }));
        dispatch({ type: 'LOAD_CART', payload: formattedItems });
        localStorage.setItem('cartItems', JSON.stringify(formattedItems));
      }
    } catch (error) {
      console.error("❌ Cart Sync Error:", error.message);
      const saved = localStorage.getItem('cartItems');
      if (saved) dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
    }
  }, [API_URL]);

  useEffect(() => {
    fetchCart();
    
    // Refresh cart when window regains focus (switching between apps/tabs)
    window.addEventListener('focus', fetchCart);
    return () => window.removeEventListener('focus', fetchCart);
  }, [fetchCart]);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = async (product, qty = 1) => {
    const stockCount = (product.stock && typeof product.stock === 'object') ? product.stock.quantity : (product.stock || 0);
    if (stockCount === 0) {
      showNotification('Out of Stock', `"${product.name}" is unavailable.`, 'error');
      return false;
    }

    const token = localStorage.getItem('token');
    const newItem = { ...product, qty, image: getProductImage(product) };
    
    // Update local UI first
    dispatch({ type: 'ADD_TO_CART', payload: newItem });

    if (token) {
      try {
        await axios.post(`${API_URL}/add`, { productId: product._id, quantity: qty }, getAuthConfig());
        await fetchCart(); // Re-fetch to confirm DB state
      } catch (error) {
        console.error("❌ Add to DB Failed:", error.message);
      }
    }
    showNotification('Added to Cart', `"${product.name}" added successfully.`, 'success');
    return true; 
  };

  const removeFromCart = async (id) => {
    const token = localStorage.getItem('token');
    const target = cartItems.find(i => i._id === id);
    const dbId = target?.cartItemId || id;

    dispatch({ type: 'REMOVE_FROM_CART', payload: id });

    if (token) {
      try { 
        await axios.delete(`${API_URL}/remove/${dbId}`, getAuthConfig()); 
        fetchCart();
      } catch (e) { 
        console.error("❌ Delete from DB Failed:", e.message); 
      }
    }
  };

  const updateCartQty = async (id, qty) => {
    if (qty < 1) return;
    const token = localStorage.getItem('token');
    const target = cartItems.find(i => i._id === id);
    const dbId = target?.cartItemId || id;

    dispatch({ type: 'UPDATE_CART_QTY', payload: { id, qty } });

    if (token) {
      try { 
        await axios.put(`${API_URL}/update/${dbId}`, { quantity: qty }, getAuthConfig()); 
      } catch (e) { 
        console.error("❌ Qty Update Failed:", e.message); 
      }
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cartItems');
    if (token) {
      try { 
        await axios.delete(`${API_URL}/clear`, getAuthConfig()); 
      } catch (e) { 
        console.error("❌ Clear DB Failed:", e.message); 
      }
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateCartQty, clearCart, fetchCart,
      getCartTotal: () => cartItems.reduce((a, c) => a + (c.discountPrice || c.price) * c.qty, 0),
      getCartItemsCount: () => cartItems.reduce((a, c) => a + c.qty, 0)
    }}>
      <style>{`
        .cart-toast-wrap { position: fixed; top: 100px; right: 20px; z-index: 9999; animation: slideIn 0.3s; }
        .toast-body { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px; border-left: 5px solid #5d6d36; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
      {toast && (
        <div className="cart-toast-wrap">
          <div className="toast-body">
            {toast.type === 'success' ? <CheckCircle color="#5d6d36" /> : <AlertTriangle color="#e74c3c" />}
            <div>
              <p style={{margin:0, fontWeight:'bold'}}>{toast.title}</p>
              <p style={{margin:0, fontSize:'12px', color:'#666'}}>{toast.message}</p>
            </div>
            <X size={16} onClick={() => setToast(null)} style={{cursor:'pointer', marginLeft:'10px'}} />
          </div>
        </div>
      )}
      {children}
    </CartContext.Provider>
  );
};