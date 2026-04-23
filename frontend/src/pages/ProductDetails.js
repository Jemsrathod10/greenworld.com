import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductReviews from '../components/ProductReviews'; 
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // ✅ Identify if the current user is an admin
  const isUserAdmin = user?.role === 'admin';

  useEffect(() => {
    fetch(`/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
        } else {
          setProduct(data);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  // Helper to safely get stock count
  const getStockCount = () => {
    if (!product) return 0;
    const qty = product.stock?.quantity ?? product.stock ?? 0;
    return Number(qty);
  };

  const stockQty = getStockCount();
  const isOutOfStock = stockQty <= 0;

  // Handle Add to Cart with direct redirect if not logged in
  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Safety check for admin
    if (isUserAdmin) return;

    addToCart(product, 1);
  };

  // 🎨 RETRO DETAILS STYLES
  const styles = `
    .details-page {
      padding: 4rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--secondary-color);
      font-weight: bold;
      margin-bottom: 2rem;
      transition: 0.3s;
    }

    .back-link:hover {
      transform: translateX(-5px);
      color: var(--primary-color);
    }

    .product-container {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
      margin-bottom: 4rem;
    }

    /* IMAGE STYLING */
    .image-wrapper {
      position: relative;
    }

    .product-img-large {
      width: 100%;
      border-radius: 20px;
      border: 4px solid white;
      outline: 4px solid var(--secondary-color);
      box-shadow: 15px 15px 0px rgba(238, 198, 67, 0.4); 
      background: white;
    }

    /* DETAILS STYLING */
    .product-info h1 {
      font-family: 'Fraunces', serif;
      font-size: 3rem;
      color: var(--secondary-color);
      margin-bottom: 0.5rem;
      line-height: 1.1;
    }

    .product-price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      font-family: 'Fraunces', serif;
    }

    .product-desc {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #555;
      margin-bottom: 2rem;
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      border: 1px dashed #ccc;
    }

    .stock-badge {
      display: inline-block;
      padding: 6px 12px;
      background: #e6f4ea;
      color: #1e7e34;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .out-stock {
      background: #fdecea;
      color: #c0392b;
    }

    .btn-add-cart {
      background: var(--primary-color);
      color: white;
      font-size: 1.2rem;
      padding: 16px 40px;
      border: none;
      border-radius: 50px; 
      cursor: pointer;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 6px 15px rgba(211, 84, 0, 0.3);
    }

    .btn-add-cart:hover:not(:disabled) {
      background: #b34500;
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(211, 84, 0, 0.5);
    }

    /* FEATURES ICONS */
    .features-row {
      display: flex;
      gap: 20px;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #ddd;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #666;
      font-weight: bold;
    }

    @media (max-width: 850px) {
      .product-container { grid-template-columns: 1fr; gap: 2rem; }
      .product-info h1 { font-size: 2.2rem; }
    }
  `;

  if (!product) return (
    <div style={{padding:'100px', textAlign:'center', background:'var(--bg-color)', minHeight:'100vh'}}>
      <h2 style={{fontFamily:'Fraunces', color:'var(--secondary-color)'}}>Loading Plant Details... 🌱</h2>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="details-page">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <Link to="/products" className="back-link">
            <ArrowLeft size={20} /> Back to Shop
          </Link>

          <div className="product-container">
            
            {/* Left: Image */}
            <div className="image-wrapper">
              <img 
                src={product?.images?.[0]?.url || 'https://placehold.co/500x500?text=No+Image'} 
                alt={product?.name}
                className="product-img-large" 
              />
            </div>
            
            {/* Right: Info */}
            <div className="product-info">
              
              {isOutOfStock ? (
                  <span className="stock-badge out-stock">Sold Out</span>
              ) : (
                  <span className="stock-badge">In Stock</span> 
              )}

              <h1>{product.name}</h1>
              <div className="product-price">₹{product.price}</div>
              
              <div className="product-desc">
                {product.description || "No description available for this plant."}
              </div>
              
              {/* ✅ CONDITIONAL RENDERING: Hide Add to Cart for Admin */}
              {!isUserAdmin ? (
                <button 
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                >
                  <ShoppingBag size={24} /> 
                  {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </button>
              ) : (
                <div style={{ color: '#2980b9', fontWeight: 'bold', fontSize: '1rem', padding: '12px 20px', background: '#e1f5fe', borderRadius: '12px', display: 'inline-block', border: '1px solid #b3e5fc' }}>
                  Admin Mode: Shopping Disabled
                </div>
              )}

              <div className="features-row">
                <div className="feature-item">
                  <Truck size={20} color="var(--primary-color)"/> Fast Delivery
                </div>
                <div className="feature-item">
                  <ShieldCheck size={20} color="var(--primary-color)"/> Quality Guarantee
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Pass isUserAdmin to ProductReviews to hide the review option internally */}
          <ProductReviews productId={product._id} isAdmin={isUserAdmin} />
          
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
