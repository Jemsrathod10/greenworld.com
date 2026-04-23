import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Icons for Toast & UI
import { Heart, CheckCircle, AlertTriangle, X, Info } from 'lucide-react'; 

const ProductCard = ({ 
  product, 
  isAdmin, 
  onEdit = () => {}, 
  onDelete = () => {} 
}) => {
  const { addToCart, cartItems } = useCart();
  const { user, refreshUser } = useAuth(); 
  const navigate = useNavigate();
  
  // Check if current user is admin
  const isUserAdmin = user?.role === 'admin' || isAdmin;

  // State for Heart Icon
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ SYNC LOGIC: Robust check for refresh and context updates
  useEffect(() => {
    const updateWishlistStatus = () => {
      // 1. If we are on wishlist page, it's definitely wishlisted
      if (window.location.pathname === '/wishlist') {
        setIsWishlisted(true);
        return;
      }

      // 2. Check in user object with deep dependency
      if (user && user.wishlist && product) {
        const exists = user.wishlist.some((item) => {
          const itemId = typeof item === 'string' ? item : item._id;
          return itemId === product._id;
        });
        setIsWishlisted(exists);
      } else {
        setIsWishlisted(false);
      }
    };

    updateWishlistStatus();
  }, [user, product, user?.wishlist]); // ✅ Tracks wishlist changes even on refresh

  // State for Custom Toast Notification
  const [toast, setToast] = useState(null);

  // Helper function to show custom notification
  const showNotification = (title, message, type = 'success') => {
    // We clear existing toast first to ensure instant re-trigger
    setToast(null);
    
    // Use a micro-task to ensure the UI paints the notification immediately
    setTimeout(() => {
      setToast({ 
        title, 
        message, 
        type 
      });
    }, 10);
    
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Navigate to Details Page
  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  // Toggle Wishlist
  const handleWishlist = async (e) => {
    e.stopPropagation(); 
    
    if (!user) { 
        showNotification(
          'Login Required', 
          'Please login to add to wishlist', 
          'error'
        );
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        
        return; 
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/user/wishlist/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              productId: product._id 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            const willRemove = isWishlisted;
            
            // Optimistic update
            setIsWishlisted(!willRemove); 
            
            // ✅ CRITICAL: Wait for global state to update
            if (refreshUser) {
              await refreshUser();
            }

            showNotification(
                'Wishlist Updated', 
                willRemove ? 'Removed from wishlist' : 'Added to wishlist', 
                'success'
            );

            // Delay removal if on wishlist page
            if (willRemove && window.location.pathname === '/wishlist') {
                if (onDelete) {
                    setTimeout(() => {
                        onDelete(product._id);
                    }, 1200); 
                }
            }
        } else {
            showNotification('Error', data.message, 'error');
        }
    } catch (err) {
        showNotification('Error', 'Error updating wishlist', 'error');
        console.error(err);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    
    if (!user) { 
      navigate('/login'); 
      return; 
    }
    
    if (isUserAdmin) { 
        showNotification(
          'Admin Restricted', 
          'Admin users cannot add products', 
          'error'
        );
        return; 
    }
    
    const availableStock = product.stock?.quantity ?? product.stock ?? 0;
    
    if (availableStock === 0) {
      showNotification(
        'Out of Stock', 
        `"${product.name}" is currently out of stock!`, 
        'error'
      );
      return;
    }
    
    const existingItem = cartItems.find((item) => {
      return item._id === product._id;
    });
    
    if (existingItem && existingItem.qty >= availableStock) {
      showNotification(
        'Stock Limit', 
        `You already have the max quantity (${availableStock}) in cart!`, 
        'error'
      );
      return;
    }
    
    const success = addToCart(product, 1);
    
    if (success) {
      // ✅ INSTANT NOTIFICATION CALL
      showNotification('Success', `${product.name} added to cart!`, 'success');

      const remaining = availableStock - (existingItem?.qty || 0) - 1;
      if (remaining <= 3 && remaining > 0) {
         setTimeout(() => {
           showNotification(
             'Hurry!', 
             `Added! Only ${remaining} left in stock.`, 
             'info'
           );
         }, 800);
      }
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    
    if (!user) { 
      navigate('/login'); 
      return; 
    }
    
    if (isUserAdmin) { 
        showNotification(
          'Admin Restricted', 
          'Admin users cannot buy', 
          'error'
        );
        return; 
    }
    
    const availableStock = product.stock?.quantity ?? product.stock ?? 0;
    
    if (availableStock === 0) {
      showNotification(
        'Out of Stock', 
        `"${product.name}" is currently out of stock!`, 
        'error'
      );
      return;
    }
    
    addToCart(product, 1); 
    navigate('/cart');     
  };

  if (!product) {
    return null;
  }

  const imageUrl = product?.images?.[0]?.url || 'https://placehold.co/300x300?text=Plant';
  const stockQuantity = product?.stock?.quantity ?? product?.stock ?? 0;
  const isOutOfStock = stockQuantity <= 0;

  // ✅ FULLY EXPANDED STYLES FOR MAXIMUM LINE COUNT
  const styles = `
    .product-card {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .product-card:hover {
      transform: translateY(-8px);
    }

    .image-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: white;
      border: 5px solid var(--accent-color);
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .product-card:hover .image-container {
      box-shadow: 0 12px 25px rgba(0,0,0,0.15);
      border-color: var(--primary-color);
    }

    .product-image {
      width: 85%;
      height: 85%;
      object-fit: contain;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image {
      transform: scale(1.08); 
    }

    .wishlist-btn {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
      background: white;
      border: 2px solid var(--accent-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    }

    .wishlist-btn:hover {
      transform: scale(1.15);
      border-color: #e91e63;
      background-color: #fff0f5;
    }

    .btn {
      padding: 10px 24px;
      border-radius: 50px;
      font-weight: bold;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-transform: uppercase;
      font-size: 0.9rem;
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background-color: #b34500;
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #ccc;
    }

    .btn-secondary {
      background-color: transparent;
      border: 2px solid var(--accent-color);
      color: #bfa15f;
    }

    .btn-secondary:hover {
      background-color: var(--accent-color);
      color: #fff;
      transform: translateY(-2px);
    }
    
    .product-name {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .custom-toast-overlay {
      position: fixed;
      top: 90px;
      right: 20px;
      z-index: 10000;
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
      min-width: 300px;
      max-width: 450px;
    }

    .retro-toast.error {
      border-color: #e74c3c;
      border-left-color: #e74c3c;
      box-shadow: 6px 6px 0px rgba(231, 76, 60, 0.15);
    }
    
    .retro-toast.info {
      border-color: #3498db;
      border-left-color: #3498db;
      box-shadow: 6px 6px 0px rgba(52, 152, 219, 0.15);
    }

    .toast-content h4 {
      margin: 0;
      font-family: 'Fraunces', serif;
      color: var(--secondary-color, #5d6d36);
      font-size: 1.1rem;
    }

    .retro-toast.error .toast-content h4 {
      color: #c0392b;
    }

    .retro-toast.info .toast-content h4 {
      color: #2980b9;
    }

    .toast-content p {
      margin: 4px 0 0 0;
      font-family: 'Quicksand', sans-serif;
      color: #555;
      font-size: 0.95rem;
    }

    @keyframes slideIn {
      from { 
        transform: translateX(120%); 
        opacity: 0; 
      }
      to { 
        transform: translateX(0); 
        opacity: 1; 
      }
    }
  `;

  return (
    <div className="product-card">
      <style>
        {styles}
      </style>
      
      {toast && (
        <div className="custom-toast-overlay">
          <div className={`retro-toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle size={32} color="#5d6d36" />
            ) : toast.type === 'info' ? (
              <Info size={32} color="#3498db" />
            ) : (
              <AlertTriangle size={32} color="#e74c3c" />
            )}
            
            <div className="toast-content">
              <h4>
                {toast.title}
              </h4>
              <p>
                {toast.message}
              </p>
            </div>
            
            <button 
              onClick={() => {
                setToast(null);
              }} 
              style={{
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                marginLeft: 'auto'
              }}
            >
              <X size={18} color="#999" />
            </button>
          </div>
        </div>
      )}
      
      <div className="image-container">
        {!isUserAdmin && (
           <button 
             onClick={handleWishlist} 
             className="wishlist-btn"
           >
             <Heart 
               size={20} 
               color="#e91e63" 
               fill={isWishlisted ? "#e91e63" : "none"} 
             />
           </button>
        )}
        <img 
          src={imageUrl} 
          alt={product?.name} 
          className="product-image" 
          onClick={handleCardClick} 
        />
      </div>
      
      <div className="product-info">
        <h3 
          className="product-name" 
          onClick={handleCardClick} 
          style={{
            cursor: 'pointer'
          }}
        >
          {product?.name}
        </h3>

        <div 
          className="product-price" 
          style={{
            marginBottom: '10px'
          }}
        >
          <span 
            style={{ 
              color: 'var(--primary-color)', 
              fontWeight: 'bold', 
              fontSize: '1.2rem' 
            }}
          >
            ₹{product?.price}
          </span>
          {product?.originalPrice > product.price && (
             <span 
               style={{ 
                 textDecoration: 'line-through', 
                 color: '#999', 
                 fontSize: '0.9rem', 
                 marginLeft: '8px' 
               }}
             >
               ₹{product.originalPrice}
             </span>
          )}
        </div>

        <p 
          style={{ 
            fontSize: '0.9rem', 
            marginBottom: '15px', 
            fontWeight: 'bold' 
          }}
        >
          {isUserAdmin ? (
             stockQuantity > 0 ? (
               <span style={{ color: '#2980b9' }}>
                 📦 In Stock: {stockQuantity}
               </span>
             ) : (
               <span style={{ color: '#c0392b' }}>
                 ⚠️ Out of Stock (0)
               </span>
             )
          ) : (
             stockQuantity > 0 ? (
               <span style={{ color: '#27ae60', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                 Ready to Grow 🌱
               </span>
             ) : (
               <span style={{ color: '#c0392b', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                 Sold Out
               </span>
             )
          )}
        </p>

        {isUserAdmin ? (
          <div 
            style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center' 
            }}
          >
            <button 
              onClick={() => {
                if (onEdit) {
                  onEdit(product);
                }
              }} 
              className="btn" 
              style={{ 
                backgroundColor: 'var(--accent-color)', 
                color: 'var(--text-color)' 
              }}
            >
              Edit
            </button>
            <button 
              onClick={() => {
                if (onDelete) {
                  onDelete(product._id);
                }
              }} 
              className="btn" 
              style={{ 
                backgroundColor: '#c0392b', 
                color: 'white' 
              }}
            >
              Delete
            </button>
          </div>
        ) : (
          <div 
            style={{ 
              display: 'flex', 
              gap: '15px', 
              marginTop: '5px', 
              width: '100%', 
              justifyContent: 'center' 
            }}
          >
            <button 
              className="btn btn-primary" 
              disabled={isOutOfStock} 
              onClick={handleAddToCart} 
              style={{ 
                minWidth: '100px', 
                opacity: isOutOfStock ? 0.6 : 1, 
                cursor: isOutOfStock ? 'not-allowed' : 'pointer' 
              }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add'}
            </button>
            {stockQuantity > 0 && (
              <button 
                className="btn btn-secondary" 
                onClick={handleBuyNow} 
                style={{ 
                  minWidth: '100px' 
                }}
              >
                Buy
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
