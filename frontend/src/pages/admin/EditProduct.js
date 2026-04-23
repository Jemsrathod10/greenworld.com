import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Save, ArrowLeft, Edit3, CheckCircle, AlertTriangle, X } from 'lucide-react';

const EditProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const productRes = await axios.get(
          `/products/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const p = productRes.data.product;
        setProduct({
          ...p,
          stock: p.stock?.quantity || 0,
          image: p.images?.[0]?.url || '',
        });

        const categoriesRes = await axios.get('/categories');
        setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        console.error(err);
        showNotification('Error', err.response?.data?.message || 'Failed to load product or categories', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProduct({ ...product, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const payload = {
        name: product.name,
        description: product.description,
        category: product.category,
        price: Number(product.price),
        stock: { quantity: Number(product.stock), trackInventory: true },
        images: [{ url: product.image || '', isPrimary: true }],
        featured: Boolean(product.featured),
        shortDescription: product.shortDescription,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        discount: product.discount ? Number(product.discount) : undefined,
        specifications: product.specifications,
        benefits: product.benefits,
        tags: product.tags,
      };

      await axios.put(`/products/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification('Product Updated', 'Product updated successfully', 'success');
      
      setTimeout(() => {
          navigate('/admin/manage-products');
      }, 1500);
      
    } catch (err) {
      console.error(err);
      showNotification('Update Failed', err.response?.data?.message || 'Failed to update product', 'error');
    }
  };

  const styles = `
    .edit-page {
      padding: 3rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .form-container {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.2);
    }

    .page-title {
      font-family: 'Fraunces', serif;
      font-size: 2.2rem;
      color: var(--secondary-color);
      text-align: center;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--secondary-color);
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 12px;
      font-size: 1rem;
      font-family: 'Quicksand', sans-serif;
      background: #fafafa;
      transition: all 0.3s;
      outline: none;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary-color);
      background: white;
      box-shadow: 0 0 0 4px rgba(211, 84, 0, 0.1);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fdf8e4;
      padding: 15px;
      border-radius: 12px;
      border: 1px dashed var(--accent-color);
      cursor: pointer;
    }

    .checkbox-input {
      width: 20px;
      height: 20px;
      accent-color: var(--primary-color);
    }

    .btn-submit {
      width: 100%;
      background: var(--primary-color);
      color: white;
      padding: 14px;
      font-size: 1.1rem;
      font-weight: bold;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: 0.3s;
      box-shadow: 0 4px 10px rgba(211, 84, 0, 0.3);
    }

    .btn-submit:hover {
      background: #b34500;
      transform: translateY(-2px);
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      color: var(--secondary-color);
      font-weight: bold;
      margin-bottom: 1.5rem;
      cursor: pointer;
      background: none;
      border: none;
      font-size: 1rem;
    }

    .btn-back:hover {
      color: var(--primary-color);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 600px) {
      .grid-2 { grid-template-columns: 1fr; }
    }

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

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Product...</div>;
  if (!product) return <div style={{textAlign:'center', padding:'50px'}}>Product not found</div>;

  return (
    <div className="edit-page">
      <style>{styles}</style>
      
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

      <button onClick={() => navigate('/admin/manage-products')} className="btn-back">
        <ArrowLeft size={20}/> Back to List
      </button>

      <div className="form-container">
        <h1 className="page-title"><Edit3 size={32}/> Edit Product</h1>
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              className="form-input" 
              type="text" 
              name="name" 
              value={product.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              name="description" 
              value={product.description} 
              onChange={handleChange} 
              rows="4" 
              required 
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select" 
                name="category" 
                value={product.category} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input 
                className="form-input" 
                type="number" 
                name="price" 
                value={product.price} 
                onChange={handleChange} 
                min="0" 
                required 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input 
                className="form-input" 
                type="number" 
                name="stock" 
                value={product.stock} 
                onChange={handleChange} 
                min="0" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input 
                className="form-input" 
                type="url" 
                name="image" 
                value={product.image} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-group">
              <input 
                className="checkbox-input" 
                type="checkbox" 
                name="featured" 
                checked={product.featured} 
                onChange={handleChange} 
              />
              <span>Mark as Featured Product</span>
            </label>
          </div>

          <button type="submit" className="btn-submit">
            <Save size={20}/> Update Product
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
