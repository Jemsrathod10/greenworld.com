import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && !user.isAdmin) {
        const fetchCount = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/user/wishlist', {
                   headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if(data.success) setWishlistCount(data.wishlist.length);
            } catch(err) { console.log(err); }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 2000); 
        return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => { logout(); setIsMobileMenuOpen(false); };

  const navbarStyles = `
    /* --- SHARED & DESKTOP STYLES --- */
    .btn-cart {
        background-color: var(--primary-color);
        color: white;
        display: flex; 
        align-items: center; 
        gap: 8px;
        position: relative;
        padding: 0.6rem 1.2rem !important;
    }
    
    .btn-icon-circle {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        border: 2px solid var(--accent-color);
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: transparent;
        position: relative;
        text-decoration: none;
    }

    .nav-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: #e74c3c;
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex; 
        justify-content: center; 
        align-items: center;
        border: 2px solid var(--secondary-color);
    }

    .btn-logout {
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
        border: 1px solid rgba(255,255,255,0.3);
        background: transparent;
        color: #fbf8e8;
        border-radius: var(--btn-radius);
    }

    .mobile-toggle {
        display: none;
    }

    /* --- 📱 MOBILE SPECIFIC OVERRIDES --- */
    @media (max-width: 992px) {
        .navbar {
            height: 85px !important; /* Increased height for a bigger logo */
            min-height: 85px !important;
            padding: 0 !important;
        }

        .nav-container {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            height: 85px !important;
            padding: 0 15px !important;
        }

        .nav-logo {
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            flex: 1;
        }

        .nav-logo img {
            height: 125px !important; /* SIGNIFICANTLY INCREASED height */
            width: auto !important;
            max-width: 220px !important; /* Allowed more width */
            object-fit: contain;
            transform: scale(1.15); /* Subtly scale up for extra visibility */
            transform-origin: left center;
        }

        .mobile-toggle {
            display: block !important;
            background: transparent;
            border: none;
            color: var(--accent-color);
            z-index: 1100;
            padding: 10px;
        }

        /* The Menu Drawer */
        .nav-menu {
            position: fixed;
            top: 85px; 
            left: 0;
            width: 100%;
            height: auto;
            max-height: ${isMobileMenuOpen ? '100vh' : '0'};
            background: var(--secondary-color);
            flex-direction: column !important;
            overflow: hidden;
            transition: max-height 0.4s ease-in-out;
            z-index: 1000;
            padding: 0;
            border-bottom: ${isMobileMenuOpen ? '4px solid var(--accent-color)' : 'none'};
            display: flex !important;
        }

        .nav-item {
            width: 100%;
            text-align: center;
            padding: 15px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .nav-auth {
            display: ${isMobileMenuOpen ? 'flex' : 'none'} !important;
            flex-direction: column !important;
            width: 100%;
            padding: 20px 0;
            gap: 15px !important;
            align-items: center !important;
            background: var(--secondary-color);
        }

        .btn-cart span:not(.nav-badge) {
            display: inline !important; 
        }
    }
  `;

  return (
    <>
      <style>{navbarStyles}</style>
      <nav className="navbar">
        <div className="nav-container">
          
          {/* LEFT: LOGO */}
          <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo.png" alt="GreenWorlds" />
          </Link>

          {/* RIGHT: TOGGLE (3 Lines) */}
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={35} /> : <Menu size={35} />}
          </button>
          
          {/* HIDDEN MENU FOR MOBILE / NORMAL MENU FOR DESKTOP */}
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {user && user.isAdmin ? (
              <>
                <li className="nav-item"><Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link></li>
                <li className="nav-item"><Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Products</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
                <li className="nav-item"><Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Products</Link></li>
                <li className="nav-item"><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
                <li className="nav-item"><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
                {user && <li className="nav-item"><Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link></li>}
              </>
            )}
            
            <div className="nav-auth">
              {user ? (
                <>
                  {!user.isAdmin && (
                    <>
                      <Link to="/wishlist" className="btn-icon-circle" onClick={() => setIsMobileMenuOpen(false)}>
                          <Heart size={20} color="var(--accent-color)" fill={wishlistCount > 0 ? "var(--accent-color)" : "none"} />
                          {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
                      </Link>
                      <Link to="/cart" className="btn btn-cart" onClick={() => setIsMobileMenuOpen(false)}>
                        <ShoppingCart size={18} />
                        <span>Cart</span>
                        {getCartItemsCount() > 0 && <span className="nav-badge">{getCartItemsCount()}</span>}
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="btn-logout">Logout</button>
                </>
              ) : (
                <div style={{display: 'flex', gap: '10px', flexDirection: 'inherit'}}>
                  <Link to="/login" className="btn btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;