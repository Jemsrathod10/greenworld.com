import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// ✅ ADDED: Eye and EyeOff icons
import { User, Mail, Lock, ArrowRight, Sun, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ ADDED: States to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setFormData({...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // ✅ Dynamic IP logic added without changing existing logic
      const API_URL = `https://greenworld-com.onrender.com`;
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 RETRO REGISTER STYLES
  const styles = `
    .register-page {
      min-height: 80vh;
      background: var(--bg-color);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem 1rem;
      font-family: 'Quicksand', sans-serif;
    }

    .register-card {
      background: white;
      padding: 3rem;
      max-width: 450px;
      width: 100%;
      border-radius: var(--border-radius);
      /* Retro Border & Shadow */
      border: 3px solid var(--secondary-color);
      box-shadow: 12px 12px 0px var(--accent-color);
      position: relative;
    }

    /* Decorative Sun Icon */
    .sun-icon {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary-color);
      color: white;
      padding: 10px;
      border-radius: 50%;
      border: 3px solid var(--secondary-color);
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-title {
      font-family: 'Fraunces', serif;
      font-weight: 700;
      font-size: 2.2rem;
      color: var(--secondary-color);
      margin-bottom: 0.5rem;
    }

    .register-subtitle {
      color: #666;
      font-size: 1rem;
    }

    .input-group {
      position: relative;
      margin-bottom: 1.2rem;
    }

    .input-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--secondary-color);
    }

    /* ✅ ADDED: Password Toggle Styling */
    .password-toggle {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--secondary-color);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .register-input {
      width: 100%;
      padding: 14px 45px 14px 45px; /* Added right padding for eye icon */
      font-size: 1rem;
      border-radius: 12px;
      border: 2px solid #ddd;
      background: #fafafa;
      font-family: 'Quicksand', sans-serif;
      transition: all 0.3s ease;
      outline: none;
    }

    .register-input:focus {
      border-color: var(--primary-color);
      background: white;
      box-shadow: 0 0 0 4px rgba(211, 84, 0, 0.1);
    }

    .error-message {
      background: #fee2e2;
      color: #c53030;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 1.5rem;
      font-weight: 600;
      border: 1px solid #fecaca;
    }

    .btn-register {
      width: 100%;
      background: var(--primary-color);
      padding: 14px 0;
      border-radius: 50px;
      border: none;
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(211, 84, 0, 0.3);
      margin-top: 1rem;
    }

    .btn-register:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-register:hover:not(:disabled) {
      background: #b34500;
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(211, 84, 0, 0.5);
    }

    .login-text {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
      font-weight: 500;
    }

    .login-link {
      color: var(--primary-color);
      font-weight: 700;
      text-decoration: none;
      position: relative;
    }

    .login-link:hover {
      text-decoration: underline;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="register-page">
        <div className="register-card">
          
          <div className="sun-icon">
            <Sun size={28} />
          </div>

          <div className="register-header">
            <h2 className="register-title">Join the Family</h2>
            <p className="register-subtitle">Start your green journey today 🌱</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Name */}
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input 
                className="register-input"
                id="name" type="text" name="name" 
                placeholder="Full Name" 
                value={formData.name} onChange={handleChange} required 
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input 
                className="register-input"
                id="email" type="email" name="email" 
                placeholder="Email Address" 
                value={formData.email} onChange={handleChange} required 
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input 
                className="register-input"
                id="password" 
                // ✅ CHANGED: Dynamic type
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Create Password" 
                value={formData.password} onChange={handleChange} required minLength={6}
              />
              {/* ✅ ADDED: Toggle Button */}
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input 
                className="register-input"
                id="confirmPassword" 
                // ✅ CHANGED: Dynamic type
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword} onChange={handleChange} required 
              />
              {/* ✅ ADDED: Toggle Button */}
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-register" disabled={loading}>
              {loading ? 'Creating Account...' : (
                <>
                  Register <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="login-text">
            Already have an account? <Link to="/login" className="login-link">Login here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
