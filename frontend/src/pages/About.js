import React from 'react';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-section">
        <h1 className="about-title">About PlantShop</h1>
        
        <div className="about-content">
          {/* Story Card */}
          <div className="about-card">
            <h2>Our Story</h2>
            <p>
              Founded in 2020, PlantShop began as a small passion project in Surat, Gujarat. 
              Our love for plants and dedication to bringing nature into people's homes has 
              grown into a thriving business that serves plant enthusiasts across India.
            </p>
          </div>

          {/* Mission Card */}
          <div className="about-card">
            <h2>Our Mission</h2>
            <p>
              We believe that every space deserves the beauty and benefits of plants. Our mission 
              is to make plant ownership accessible, enjoyable, and successful for everyone, 
              whether you're a beginner or an experienced plant parent.
            </p>
          </div>

          {/* Offer Card */}
          <div className="about-card">
            <h2>What We Offer</h2>
            <ul>
              <li>🌿 Wide variety of indoor and outdoor plants</li>
              <li>✨ High-quality plants from trusted growers</li>
              <li>📖 Expert care guides and support</li>
              <li>🚚 Fast and secure delivery</li>
              <li>🏺 Plant accessories and care products</li>
              <li>💡 Personalized plant recommendations</li>
            </ul>
          </div>

          {/* Values Card */}
          <div className="about-card">
            <h2>Our Values</h2>
            <div className="about-values">
              <div className="value-item">
                <strong>🌱 Sustainability</strong> 
                <p>We promote eco-friendly practices and sustainable growing.</p>
              </div>
              <div className="value-item">
                <strong>💚 Quality</strong> 
                <p>Every plant is carefully selected and inspected before shipping.</p>
              </div>
              <div className="value-item">
                <strong>🤝 Customer Care</strong> 
                <p>Your success with plants is our success. We're here to help.</p>
              </div>
              <div className="value-item">
                <strong>📚 Education</strong> 
                <p>We believe in empowering our customers with knowledge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 RETRO CSS STYLES */}
      <style>{`
        .about-container {
          padding: 4rem 1rem;
          background: var(--bg-color); /* Cream */
          min-height: 100vh;
          font-family: 'Quicksand', sans-serif;
          color: var(--text-color);
        }

        .about-section {
          max-width: 900px;
          margin: 0 auto;
        }

        .about-title {
          text-align: center;
          font-family: 'Fraunces', serif;
          font-size: 3rem;
          margin-bottom: 3rem;
          color: var(--accent-color); /* Mustard Yellow */
          text-shadow: 3px 3px 0px #3e2723; /* Retro Shadow */
          letter-spacing: -1px;
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .about-card {
          background: white;
          padding: 2.5rem;
          border-radius: var(--border-radius);
          /* Retro Look: Solid Border + Block Shadow */
          border: 2px solid var(--secondary-color);
          box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.2);
          transition: transform 0.2s ease;
        }

        .about-card:hover {
          transform: translateY(-5px);
        }

        .about-card h2 {
          color: var(--secondary-color); /* Olive Green */
          margin-bottom: 1rem;
          font-size: 1.8rem;
          font-family: 'Fraunces', serif;
          border-bottom: 2px dashed var(--accent-color);
          padding-bottom: 10px;
          display: inline-block;
        }

        .about-card p {
          line-height: 1.8;
          font-size: 1.1rem;
          color: #555;
        }

        .about-card ul {
          padding-left: 1.5rem;
          list-style: none; /* Remove default bullets */
        }

        .about-card li {
          margin-bottom: 0.8rem;
          font-size: 1.1rem;
          color: #555;
        }

        .about-values {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .value-item {
          background: var(--bg-color);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--accent-color);
        }

        .value-item strong {
          display: block;
          font-size: 1.2rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          font-family: 'Fraunces', serif;
        }

        .value-item p {
          font-size: 0.95rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default About;