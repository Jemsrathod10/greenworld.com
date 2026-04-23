import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Footer = () => {
  const { user } = useAuth();

  // 🛠️ ૧. એડમિન માટેનું સિમ્પલ ફૂટર
  if (user?.role === 'admin') {
    return (
      <footer style={{
        backgroundColor: '#2c3e50', // Dark Grey for Admin
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        fontSize: '0.9rem',
        fontFamily: 'Quicksand, sans-serif',
        borderTop: '4px solid var(--accent-color)'
      }}>
        <p>© 2026 🛡️ Admin Panel - PlantShop Control Center</p>
      </footer>
    );
  }

  // 🎨 ૨. યુઝર માટેનું રેટ્રો ફૂટર (તમારો અગાઉનો કોડ)
  const styles = `
    .footer {
      background-color: var(--secondary-color);
      color: var(--bg-color);
      padding: 60px 20px 20px;
      margin-top: auto;
      border-top: 8px solid var(--accent-color);
    }
    .footer .container { max-width: 1200px; margin: auto; }
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 40px;
      margin-bottom: 40px;
    }
    .footer-section h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.6rem;
      color: var(--accent-color);
      margin-bottom: 20px;
    }
    .footer-section p {
      font-family: 'Quicksand', sans-serif;
      margin-bottom: 12px;
      line-height: 1.6;
      color: rgba(251, 248, 232, 0.85);
    }
    .footer-section a {
      color: var(--bg-color);
      text-decoration: none;
      transition: all 0.3s ease;
      display: inline-block;
    }
    .footer-section a:hover {
      color: var(--accent-color);
      transform: translateX(5px);
    }
    .footer-bottom {
      text-align: center;
      border-top: 2px dashed rgba(238, 198, 67, 0.3);
      padding-top: 20px;
      font-size: 0.9rem;
      font-weight: bold;
      color: var(--accent-color);
      font-family: 'Fraunces', serif;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🌱 PlantShop</h3>
              <p>Bringing the retro vibes and fresh greens straight to your living room.</p>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <p><Link to="/">Home</Link></p>
              <p><Link to="/products">Shop Plants</Link></p>
              <p><Link to="/about">Our Story</Link></p>
              <p><Link to="/contact">Get in Touch</Link></p>
            </div>
            
            <div className="footer-section">
              <h3>Collections</h3>
              <p><Link to="/products">Indoor Vibes</Link></p>
              <p><Link to="/products">Outdoor Greens</Link></p>
            </div>
            
            <div className="footer-section">
              <h3>Visit Us</h3>
              <p>📧 hello@plantshop.com</p>
              <p>📞 +91 98765 43210</p>
              <p>📍 Surat, Gujarat, India</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 PlantShop. Designed with 🧡</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
