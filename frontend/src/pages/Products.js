import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// ✅ IMPORT CUSTOM MODAL
import CustomConfirmModal from '../components/CustomConfirmModal';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Toast State
  const [toast, setToast] = useState(null);

  // ✅ NEW: Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // ✅ CHANGED: Use simple path because baseURL is set in App.js
      const response = await axios.get('/products');
      let productsData = Array.isArray(response.data)
        ? response.data
        : response.data?.products;
      if (!Array.isArray(productsData)) {
        productsData = [];
      }
      setProducts(productsData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to server'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      // ✅ CHANGED: Use simple path
      const response = await axios.get('/categories');
      let categoriesData = Array.isArray(response.data)
        ? response.data
        : response.data?.categories;
      if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err.message);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleEdit = (product) => {
    navigate(`/admin/edit-product/${product._id}`);
  };

  // ✅ 1. Trigger Modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // ✅ 2. Execute Delete
  const executeDelete = async () => {
    setShowConfirm(false); // Close modal
    if (!deleteId) return;

    try {
      const token = localStorage.getItem('token');
      // ✅ CHANGED: Use simple path
      await axios.delete(`/products/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProducts(products.filter((p) => p._id !== deleteId));
      showNotification('Product Deleted', 'The product was successfully removed.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Delete Failed', err.response?.data?.error || 'Could not delete product.', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const matchesSearch =
      searchTerm === '' ||
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === 'All' ||
      (p.category?._id || p.category) === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // 🎨 RETRO PRODUCTS STYLES (UNCHANGED)
  const styles = `
    .products-page {
      padding: 4rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .products-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-title {
      font-family: 'Fraunces', serif;
      font-size: 3rem;
      color: var(--secondary-color);
      text-shadow: 3px 3px 0px var(--accent-color);
      margin-bottom: 1rem;
    }

    .page-desc {
      font-size: 1.1rem;
      color: #666;
    }

    /* CONTROLS BAR */
    .controls-bar {
      max-width: 900px;
      margin: 0 auto 3rem auto;
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.2);
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-group {
      flex: 2;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .filter-group {
      flex: 1;
      position: relative;
    }

    .control-input {
      width: 100%;
      padding: 12px 12px 12px 45px;
      border: 2px solid #ddd;
      border-radius: 50px;
      font-size: 1rem;
      outline: none;
      transition: 0.3s;
      font-family: 'Quicksand', sans-serif;
    }

    .control-select {
      width: 100%;
      padding: 12px 12px 12px 45px;
      border: 2px solid #ddd;
      border-radius: 50px;
      font-size: 1rem;
      outline: none;
      transition: 0.3s;
      font-family: 'Quicksand', sans-serif;
      appearance: none;
      background: white url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 15px center;
      background-size: 12px;
    }

    .control-input:focus, .control-select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1);
    }

    /* GRID */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-count {
      text-align: center;
      margin-bottom: 2rem;
      color: #666;
      font-weight: bold;
    }

    /* STATES */
    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      border: 2px dashed #ddd;
      max-width: 600px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .controls-bar { flex-direction: column; }
    }
  `;

  if (loading) {
    return (
      <div className="products-page">
        <style>{styles}</style>
        <div className="loading-state">
          <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
          <h2 style={{fontFamily:'Fraunces', marginTop:'20px'}}>Gathering Plants...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <style>{styles}</style>
        <div className="empty-state">
          <h2 style={{color:'#c0392b'}}>Oops! Something went wrong.</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary" style={{marginTop:'20px'}}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <style>{styles}</style>
      
      {/* ✅ RENDER CONFIRM MODAL */}
      <CustomConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      {/* Toast Notification */}
      {toast && (
        <div className="custom-toast-overlay">
          <div className={`retro-toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle size={32} color="#2d5a27" />
            ) : (
              <AlertTriangle size={32} color="#e74c3c" />
            )}
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
            <button 
                onClick={() => setToast(null)} 
                style={{background:'none', border:'none', cursor:'pointer', marginLeft:'auto'}}>
                <X size={18} color="#999" />
            </button>
          </div>
        </div>
      )}

      <div className="products-header">
        <h1 className="page-title">Our Collection</h1>
        <p className="page-desc">Explore our wide variety of retro-inspired greenery.</p>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-group">
          <Search size={20} className="search-icon"/>
          <input
            type="text"
            placeholder="Search for plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="control-input"
          />
        </div>
        
        <div className="filter-group">
          <Filter size={20} className="search-icon"/>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="control-select"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'plant' : 'plants'}
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product._id || product.id} 
              product={product}
              onEdit={handleEdit}
              // ✅ CHANGED: Trigger modal
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No plants found 🌱</h3>
          <p>Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default Products;