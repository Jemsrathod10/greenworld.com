import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, Users, PlusCircle, List, Star, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const res = await axios.get('https://greenworld-com.onrender.com/api/stats/dashboard', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = res.data; 
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }

      const validatedData = {
        counts: {
          totalRevenue: result.counts?.totalRevenue || 0,
          totalOrders: result.counts?.totalOrders || 0,
          totalProducts: result.counts?.totalProducts || 0,
          totalUsers: result.counts?.totalUsers || 0
        },
        charts: {
          monthlySales: Array.isArray(result.charts?.monthlySales) 
            ? result.charts.monthlySales 
            : []
        }
      };
      
      setData(validatedData);
      
    } catch (error) {
      console.error("Dashboard Error:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const styles = `
    .admin-container {
      padding: 3rem 1rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Quicksand', sans-serif;
      min-height: 100vh;
      background: var(--bg-color);
    }

    .admin-header {
      background-color: var(--secondary-color);
      padding: 3rem 2rem;
      border-radius: 24px;
      text-align: center;
      margin-bottom: 3rem;
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.2);
      color: #fffcf5;
      position: relative;
      overflow: hidden;
    }

    .admin-title {
      font-family: 'Fraunces', serif;
      font-size: 3.5rem;
      color: #fffcf5;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 0px rgba(0,0,0,0.2);
    }

    .admin-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .error-alert {
      background: #ffe5e5;
      border: 2px solid #ff4444;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      box-shadow: 4px 4px 0px rgba(255, 68, 68, 0.2);
    }

    .error-icon {
      color: #ff4444;
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;
    }

    .error-title {
      font-weight: bold;
      color: #cc0000;
      margin-bottom: 0.5rem;
    }

    .error-message {
      color: #666;
      margin-bottom: 1rem;
    }

    .retry-btn {
      background: #ff4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: 0.2s;
    }

    .retry-btn:hover {
      background: #cc0000;
      transform: translateY(-2px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15);
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      gap: 1rem;
      overflow: hidden; /* Prevent text from escaping card */
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--bg-color);
      border: 2px solid var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      flex-shrink: 0; /* Icon won't shrink if text is long */
    }

    .stat-info {
      flex: 1;
      min-width: 0; /* Crucial for text overflow within flex */
    }

    .stat-info h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem; /* Reduced base size */
      margin: 0;
      color: var(--text-color);
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis; /* Adds ... if text is too long */
      white-space: nowrap;
    }

    .stat-info p {
      margin: 5px 0 0 0;
      font-size: 0.8rem;
      color: #666;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .chart-section {
      background: white;
      padding: 2rem;
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15);
      margin-bottom: 3rem;
    }

    .chart-title {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
      color: var(--secondary-color);
      margin-bottom: 2rem;
      border-bottom: 2px dashed var(--accent-color);
      padding-bottom: 10px;
      display: inline-block;
    }

    .no-data-message {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-style: italic;
    }

    .actions-grid {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .btn-action {
      background: var(--primary-color);
      color: white;
      padding: 14px 28px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: 0.3s;
      box-shadow: 0 4px 10px rgba(211, 84, 0, 0.2);
    }

    .btn-action:hover {
      background: #b34500;
      transform: translateY(-2px);
    }

    .btn-outline {
      background: transparent;
      color: var(--secondary-color);
      border: 2px solid var(--secondary-color);
    }

    .btn-outline:hover {
      background: var(--secondary-color);
      color: white;
    }

    .loading-container {
      padding: 50px;
      text-align: center;
      color: var(--primary-color);
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <div className="loading-container">
        <style>{styles}</style>
        <RefreshCw size={40} className="spin" />
        <p>Crunching Numbers... </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <style>{styles}</style>
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="error-alert">
          <AlertCircle className="error-icon" size={24} />
          <div className="error-content">
            <div className="error-title">Oops! Something went wrong</div>
            <div className="error-message">{error}</div>
            <button onClick={fetchStats} className="retry-btn">
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <style>{styles}</style>
      
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Welcome back, <strong>{user?.name}</strong>! Here is your shop's heartbeat.</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon={<DollarSign size={24} />}
          label="Total Revenue" 
          value={`₹${(data?.counts?.totalRevenue || 0).toLocaleString()}`} 
        />
        <StatCard 
          icon={<ShoppingBag size={24} />}
          label="Total Orders" 
          value={data?.counts?.totalOrders || 0} 
        />
        <StatCard 
          icon={<Package size={24} />}
          label="Total Products" 
          value={data?.counts?.totalProducts || 0} 
        />
        <StatCard 
          icon={<Users size={24} />}
          label="Total Users" 
          value={data?.counts?.totalUsers || 0} 
        />
      </div>

      <div className="chart-section">
        <h3 className="chart-title">Sales Overview</h3>
        {data?.charts?.monthlySales && data.charts.monthlySales.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.charts.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#666'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill:'#666'}} />
              <Tooltip 
                contentStyle={{ borderRadius:'10px', border:'2px solid var(--secondary-color)' }}
                cursor={{fill: 'rgba(238, 198, 67, 0.1)'}}
              />
              <Bar dataKey="sales" fill="#d35400" radius={[10, 10, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">
            No sales data available for the last 6 months
          </div>
        )}
      </div>

      <div className="actions-grid">
        <Link to="/admin/add-product" className="btn-action">
          <PlusCircle size={20}/> Add Product
        </Link>
        <Link to="/admin/orders" className="btn-action btn-outline">
          <List size={20}/> Manage Orders
        </Link>
        <Link to="/admin/reviews" className="btn-action btn-outline">
          <Star size={20}/> Manage Reviews
        </Link>
        <Link to="/admin/contacts" className="btn-action btn-outline">
              <Mail size={24} />
              <span>Contact Messages</span>
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">
      {icon}
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export default AdminDashboard;
