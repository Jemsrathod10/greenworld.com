import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    .contact-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 1rem;
      font-family: 'Quicksand', sans-serif;
      min-height: 80vh;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-top: 3rem;
    }

    .contact-form-section {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15);
    }

    .section-title {
      font-family: 'Fraunces', serif;
      font-size: 2rem;
      color: var(--secondary-color);
      margin-bottom: 1rem;
      position: relative;
      display: inline-block;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--accent-color);
      border-radius: 2px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 0.8rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-family: 'Quicksand', sans-serif;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: 0.3s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #b34500;
      transform: translateY(-2px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-message {
      background: #d4edda;
      border: 2px solid #28a745;
      color: #155724;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideDown 0.3s ease;
    }

    .error-message {
      background: #f8d7da;
      border: 2px solid #dc3545;
      color: #721c24;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .contact-info-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15);
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-content h3 {
      margin: 0 0 0.5rem 0;
      color: var(--secondary-color);
      font-family: 'Fraunces', serif;
      font-size: 1.2rem;
    }

    .info-content p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }

    .quick-help-card {
      background: #fdf8e4;
      padding: 2rem;
      border-radius: 16px;
      border: 2px solid var(--accent-color);
    }

    .quick-help-title {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .help-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .help-list li {
      padding: 0.5rem 0;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .help-list li::before {
      content: '🌿';
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `;

  return (
    <div className="contact-container">
      <style>{styles}</style>

      <h1 style={{ 
        fontFamily: 'Fraunces, serif', 
        fontSize: '2.5rem', 
        textAlign: 'center', 
        color: 'var(--text-color)',
        marginBottom: '1rem'
      }}>
        Get in Touch
      </h1>
      <p style={{ textAlign: 'center', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
        Have questions about our plants? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </p>

      <div className="contact-grid">
        {/* Contact Form */}
        <div className="contact-form-section">
          <h2 className="section-title">Send us a Message</h2>

          {success && (
            <div className="success-message">
              <CheckCircle size={24} />
              <span>Message sent successfully! We'll get back to you soon.</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@example.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className="form-textarea"
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="contact-info-section">
          <div className="info-card">
            <h2 className="section-title">Contact Info</h2>

            <div className="info-item">
              <div className="info-icon">
                <MapPin size={24} color="var(--secondary-color)" />
              </div>
              <div className="info-content">
                <h3>Visit Us</h3>
                <p>123 Green Street<br />Surat, Gujarat - 395007</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone size={24} color="var(--secondary-color)" />
              </div>
              <div className="info-content">
                <h3>Call Us</h3>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Mail size={24} color="var(--secondary-color)" />
              </div>
              <div className="info-content">
                <h3>Email Us</h3>
                <p>info@plantshop.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Clock size={24} color="var(--secondary-color)" />
              </div>
              <div className="info-content">
                <h3>Opening Hours</h3>
                <p>Mon - Sat: 9:00 AM - 7:00 PM<br />Sun: 10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="quick-help-card">
            <h3 className="quick-help-title">Need Quick Help?</h3>
            <ul className="help-list">
              <li>Track your order status</li>
              <li>Plant care instructions</li>
              <li>Return & exchange policy</li>
              <li>Shipping information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;