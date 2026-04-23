import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import { Search, Filter, ArrowLeft, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// ✅ IMPORT CUSTOM MODAL
import CustomConfirmModal from '../../components/CustomConfirmModal';

const ManageProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Toast State
  const [toast, setToast] = useState(null);

  // ✅ NEW: Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user || !user.isAdmin) window.location.href = '/';
    fetchProducts();
    fetchCategories();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://greenworld-com.onrender.com/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://greenworld-com.onrender.com/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ 1. Trigger Modal (Replaces window.confirm)
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
      await axios.delete(`https://greenworld-com.onrender.com/api/products/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== deleteId));
      showNotification('Product Deleted', 'Product deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Error', err.response?.data?.error || 'Failed to delete product', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      stock: product.stock?.quantity || 0,
      image: product.images?.[0]?.url || '',
      category: product.category?._id || product.category,
    });
  };

  const handleEditChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditingProduct({ ...editingProduct, [e.target.name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...editingProduct,
        stock: { quantity: Number(editingProduct.stock) },
        images: [{ url: editingProduct.image || 'https://via.placeholder.com/400', isPrimary: true }],
      };

      const res = await axios.put(`https://greenworld-com.onrender.com/api/products/${editingProduct._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.map((p) => (p._id === editingProduct._id ? res.data.product : p)));
      setEditingProduct(null);
      showNotification('Product Updated', 'Product updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Update Failed', err.response?.data?.error || 'Failed to update product', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || (p.category?._id || p.category) === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 🎨 RETRO MANAGE STYLES (UNCHANGED)
  const styles = `
    .manage-page {
      padding: 3rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .page-title {
      font-family: 'Fraunces', serif;
      font-size: 2.5rem;
      color: var(--secondary-color);
      text-align: center;
      margin-bottom: 2rem;
    }

    /* CONTROLS */
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
    }

    .search-input, .filter-select {
      flex: 1;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 50px;
      font-size: 1rem;
      font-family: 'Quicksand', sans-serif;
      outline: none;
      background: #fafafa;
    }

    .search-input:focus, .filter-select:focus {
      border-color: var(--primary-color);
      background: white;
    }

    /* GRID */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      color: var(--secondary-color);
      font-weight: bold;
      cursor: pointer;
      margin-bottom: 1.5rem;
      font-size: 1rem;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    .modal-content {
      background: white;
      padding: 2.5rem;
      width: 90%;
      max-width: 500px;
      border-radius: var(--border-radius);
      border: 3px solid var(--secondary-color);
      box-shadow: 10px 10px 0px var(--accent-color);
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-title {
      font-family: 'Fraunces', serif;
      font-size: 1.8rem;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .modal-input, .modal-textarea {
      width: 100%;
      padding: 10px;
      margin-bottom: 1rem;
      border: 2px solid #ddd;
      border-radius: 10px;
      font-family: 'Quicksand', sans-serif;
    }

    .btn-update {
      width: 100%;
      background: var(--primary-color);
      color: white;
      padding: 12px;
      border-radius: 50px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      margin-top: 1rem;
    }

    .btn-close {
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      cursor: pointer;
      color: #999;
    }

    /* ✅ RETRO TOAST STYLES */
    .custom-toast-overlay {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .retro-toast {
      background: #fffcf5;
      border: 2px solid var(--secondary-color);
      border-left: 8px solid var(--secondary-color);
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 6px 6px 0px rgba(45, 90, 39, 0.15);
      display: flex;
      align-items: center;
      gap: 15px;
      min-width: 320px;
      max-width: 450px;
    }

    .retro-toast.error {
      border-color: #e74c3c;
      border-left-color: #e74c3c;
      box-shadow: 6px 6px 0px rgba(231, 76, 60, 0.15);
    }

    .toast-content h4 {
      margin: 0;
      font-family: 'Fraunces', serif;
      color: var(--secondary-color);
      font-size: 1.1rem;
    }

    .retro-toast.error .toast-content h4 { color: #c0392b; }

    .toast-content p {
      margin: 4px 0 0 0;
      font-family: 'Quicksand', sans-serif;
      color: #555;
      font-size: 0.95rem;
    }

    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading products...</div>;

  return (
    <div className="manage-page">
      <style>{styles}</style>
      
      {/* ✅ RENDER CONFIRM MODAL */}
      <CustomConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      {/* Custom Toast */}
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

      <button onClick={() => navigate('/admin')} className="back-btn">
        <ArrowLeft size={20} /> Back to Admin
      </button>

      <h1 className="page-title">Manage Inventory</h1>

      {/* Controls */}
      <div className="controls-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="products-grid">
        {filteredProducts.map((p) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            isAdmin={true} 
            onEdit={() => handleEdit(p)} 
            // ✅ CHANGED: Call trigger function instead of inline delete
            onDelete={() => handleDeleteClick(p._id)} 
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn-close" onClick={() => setEditingProduct(null)}>
              <X size={24}/>
            </button>
            
            <h3 className="modal-title">Quick Edit</h3>
            
            <form onSubmit={handleUpdate}>
              <input className="modal-input" name="name" value={editingProduct.name} onChange={handleEditChange} placeholder="Name" required />
              <textarea className="modal-textarea" name="description" value={editingProduct.description} onChange={handleEditChange} placeholder="Description" required rows="3" />
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input className="modal-input" type="number" name="price" value={editingProduct.price} onChange={handleEditChange} placeholder="Price" required />
                <input className="modal-input" type="number" name="stock" value={editingProduct.stock} onChange={handleEditChange} placeholder="Stock" required />
              </div>

              <input className="modal-input" name="image" value={editingProduct.image} onChange={handleEditChange} placeholder="Image URL" />
              
              <label style={{display:'flex', alignItems:'center', gap:'10px', fontWeight:'bold', color:'var(--secondary-color)'}}>
                <input type="checkbox" name="featured" checked={editingProduct.featured} onChange={handleEditChange} />
                Featured Product
              </label>

              <button type="submit" className="btn-update">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
