import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// ✅ ADDED: Eye and EyeOff icons
import { User, Lock, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // ✅ ADDED: State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Dynamic IP logic added without changing existing logic
      const API_URL = `https://greenworld-com.onrender.com`;
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);

      // ✅ Save token + user globally
      login(response.data.user, response.data.token);

      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 RETRO LOGIN STYLES
  const styles = `
    .login-page {
      min-height: 80vh; /* Reduced height since navbar takes space */
      background: var(--bg-color);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
      font-family: 'Quicksand', sans-serif;
    }

    .login-card {
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

    /* Decorative Element */
    .leaf-icon {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent-color);
      color: var(--secondary-color);
      padding: 10px;
      border-radius: 50%;
      border: 3px solid var(--secondary-color);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .login-title {
      font-family: 'Fraunces', serif;
      font-weight: 700;
      font-size: 2.2rem;
      color: var(--secondary-color);
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      color: #666;
      font-size: 1rem;
    }

    /* Input Groups with Icons */
    .input-group {
      position: relative;
      margin-bottom: 1.5rem;
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

    .login-input {
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

    .login-input:focus {
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

    .btn-login {
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
    }

    .btn-login:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-login:hover:not(:disabled) {
      background: #b34500;
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(211, 84, 0, 0.5);
    }

    .register-text {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
      font-weight: 500;
    }

    .register-link {
      color: var(--primary-color);
      font-weight: 700;
      text-decoration: none;
      position: relative;
    }

    .register-link::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: var(--primary-color);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .register-link:hover::after {
      transform: scaleX(1);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-card">
          
          {/* Decorative Leaf Icon */}
          <div className="leaf-icon">
            <Leaf size={28} />
          </div>

          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Email Field */}
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input 
                className="login-input"
                id="email" 
                type="email" 
                name="email" 
                placeholder="Enter your email"
                value={formData.email} 
                onChange={handleChange} 
                required 
                autoComplete="email" 
              />
            </div>

            {/* Password Field */}
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input 
                className="login-input"
                id="password" 
                // ✅ CHANGED: Dynamic type based on showPassword state
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Enter your password"
                value={formData.password} 
                onChange={handleChange} 
                required 
                autoComplete="current-password" 
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

            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Logging in...' : (
                <>
                  Login <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="register-text">
            Don't have an account? <Link to="/register" className="register-link">Register here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
