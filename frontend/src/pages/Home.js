import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Smile } from 'lucide-react'; // Added icons

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/products');
      if (response.data && response.data.products) {
        const products = response.data.products;
        // Sort by newest
        const sortedProducts = products.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
        setFeaturedProducts(sortedProducts.slice(0, 3));
      } else {
        setFeaturedProducts([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // 🎨 RETRO THEME STYLES
  const styles = `
    .home-container {
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
      background: var(--bg-color); /* Cream Background */
      min-height: 100vh;
    }
    
    /* 🍌 RETRO BANNER */
    .banner {
      position: relative;
      /* Darker overlay to make yellow text pop */
      background: linear-gradient(rgba(44, 62, 80, 0.7), rgba(93, 109, 54, 0.8)), url('https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1650&q=80') center center/cover no-repeat;
      height: 500px;
      margin-bottom: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      border-bottom: 8px solid var(--accent-color); /* Chunky Yellow Border */
    }

    .banner-content {
      max-width: 800px;
      padding: 0 1rem;
      animation: fadeIn 1s ease-in;
    }

    .banner-title {
      font-family: 'Fraunces', serif; /* Retro Font */
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--accent-color); /* Mustard Yellow */
      text-shadow: 4px 4px 0px #3e2723; /* Retro Block Shadow */
      letter-spacing: -1px;
    }

    .banner-text {
      font-size: 1.4rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      color: #fbf8e8;
      font-weight: 500;
    }

    .btn-banner {
      background-color: var(--primary-color); /* Burnt Orange */
      color: white;
      font-weight: 700;
      padding: 1.2rem 3rem;
      font-size: 1.2rem;
      border-radius: 50px; /* Pill Shape */
      text-decoration: none;
      transition: all 0.3s ease;
      display: inline-block;
      box-shadow: 0 6px 15px rgba(211, 84, 0, 0.4);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-banner:hover {
      background-color: #b34500;
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(211, 84, 0, 0.6);
    }

    section {
      padding: 4rem 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    section h2 {
      text-align: center;
      font-family: 'Fraunces', serif;
      font-size: 2.5rem;
      color: var(--text-color);
      margin-bottom: 3rem;
      position: relative;
      display: inline-block;
      width: 100%;
    }
    
    /* Decorative line under headings */
    section h2::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: var(--primary-color);
      margin: 10px auto 0;
      border-radius: 2px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2.5rem;
    }

    /* 🍌 RETRO FEATURE CARDS */
    .feature-card {
      background-color: white;
      padding: 2.5rem;
      border-radius: var(--border-radius);
      text-align: center;
      /* The Retro Look: Solid Border + Solid Shadow */
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.2); 
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      margin-bottom: 15px;
      color: var(--primary-color);
    }

    .feature-card h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--secondary-color);
    }

    .feature-card p {
      font-size: 1rem;
      color: #666;
      line-height: 1.6;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .banner-title { font-size: 2.5rem; }
      .banner-text { font-size: 1.1rem; }
    }
  `;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--primary-color)', fontSize: '1.5rem', fontFamily:'Fraunces, serif' }}>Loading Greenery...</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="home-container">
        {/* Banner */}
        <section className="banner">
          <div className="banner-content">
            <h1 className="banner-title">Bring Nature Home</h1>
            <p className="banner-text">
              Transform your space into a retro green paradise. 
              Fresh plants, vintage vibes, and happiness delivered.
            </p>
            <Link to="/products" className="btn-banner">
              Shop Collection
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <h2>Fresh Arrivals</h2>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section style={{ marginBottom: '4rem' }}>
          <h2>Why PlantShop?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck size={48} /></div>
              <h3>Fresh Quality</h3>
              <p>Hand-picked, healthy plants grown with love and delivered fresh to your door.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Truck size={48} /></div>
              <h3>Fast Delivery</h3>
              <p>Safe, secure, and speedy shipping to ensure your green friends arrive happy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Smile size={48} /></div>
              <h3>Plant Support</h3>
              <p>Our experts are here 24/7 to help you keep your jungle thriving.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;