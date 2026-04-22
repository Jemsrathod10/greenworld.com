import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ✅ Fetch Wishlist on Load
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/user/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setWishlist(data.wishlist);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    if(user) fetchWishlist();
  }, [user]);

  // ✅ Function to remove item from UI state immediately
  const handleRemoveFromUI = (productId) => {
    setWishlist(prevWishlist => prevWishlist.filter(item => item._id !== productId));
  };

  // 🎨 RETRO WISHLIST STYLES
  const styles = `
    .wishlist-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 1rem;
      min-height: 80vh;
      font-family: 'Quicksand', sans-serif;
      background: var(--bg-color);
    }

    .wishlist-header {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
    }

    .wishlist-title {
      font-family: 'Fraunces', serif;
      font-size: 3rem;
      color: var(--secondary-color);
      display: inline-flex;
      align-items: center;
      gap: 15px;
      text-shadow: 3px 3px 0px var(--accent-color);
    }

    .wishlist-subtitle {
      color: #666;
      font-size: 1.1rem;
      margin-top: 10px;
    }

    /* GRID LAYOUT */
    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 3rem;
    }

    /* EMPTY STATE */
    .empty-wishlist {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      border: 3px solid var(--secondary-color);
      box-shadow: 10px 10px 0px rgba(93, 109, 54, 0.2);
      max-width: 600px;
      margin: 2rem auto;
    }

    .empty-title {
      font-family: 'Fraunces', serif;
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .btn-explore {
      background: var(--primary-color);
      color: white;
      padding: 12px 30px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.1rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 20px;
      transition: 0.3s;
      box-shadow: 0 4px 10px rgba(211, 84, 0, 0.3);
    }

    .btn-explore:hover {
      background: #b34500;
      transform: translateY(-3px);
    }

    .loading-state {
      text-align: center;
      padding: 5rem;
      color: var(--secondary-color);
    }
  `;

  if (loading) return (
    <div className="wishlist-container">
       <style>{styles}</style>
       <div className="loading-state">
         <Loader2 size={48} className="animate-spin" style={{margin:'0 auto 20px'}} />
         <h2 style={{fontFamily:'Fraunces'}}>Loading your favorites...</h2>
       </div>
    </div>
  );

  return (
    <div className="wishlist-container">
      <style>{styles}</style>
      
      <div className="wishlist-header">
        <h1 className="wishlist-title">
          <Heart size={40} fill="#e91e63" color="#e91e63" /> My Wishlist
        </h1>
        <p className="wishlist-subtitle">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <Heart size={64} color="#ddd" style={{ marginBottom: '20px' }} />
          <h3 className="empty-title">Your wishlist is empty 💔</h3>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Found something you love? Tap the heart icon to save it here!
          </p>
          <Link to="/products" className="btn-explore">
            <ShoppingBag size={20} /> Explore Plants
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onDelete={handleRemoveFromUI} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;