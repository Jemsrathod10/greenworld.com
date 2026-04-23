import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Save, PlusCircle, ArrowLeft, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');

  const [lightRequirement, setLightRequirement] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');

  const [toast, setToast] = useState(null);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user || !user.isAdmin) window.location.href = '/';

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const payload = {
        name,
        description,
        price: Number(price),
        category,
        stock: { quantity: Number(stock) },
        images: [{ url: image || 'https://via.placeholder.com/400', alt: name, isPrimary: true }],
        featured,
        tags: tags.split(',').map(t => t.trim().toLowerCase()),
        plantCare: {
          lightRequirement,
          wateringFrequency
        }
      };

      await axios.post('/products', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotification('Product Added', 'Product added successfully', 'success');
      
      setName(''); 
      setDescription(''); 
      setPrice(''); 
      setStock(0); 
      setCategory(''); 
      setFeatured(false); 
      setImage(''); 
      setTags('');
      setLightRequirement('');
      setWateringFrequency('');
    } catch (err) {
      console.error(err);
      showNotification('Error', err.response?.data?.error || 'Failed to add product', 'error');
    }
  };

  const styles = `
    .add-product-page {
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

  return (
    <div className="add-product-page">
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

      <button onClick={() => navigate('/admin')} className="btn-back">
        <ArrowLeft size={20}/> Back to Dashboard
      </button>

      <div className="form-container">
        <h1 className="page-title"><PlusCircle size={32}/> Add New Product</h1>
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Monstera Deliciosa"/>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows="4" required placeholder="Describe the plant..."/>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input className="form-input" type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input className="form-input" type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" required />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/image.jpg"/>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-input" type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="indoor, low light, pet friendly"/>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Light Requirement</label>
              <select className="form-select" value={lightRequirement} onChange={e => setLightRequirement(e.target.value)} required>
                <option value="">Select Light</option>
                <option value="Low Light">Low Light</option>
                <option value="Medium Light">Medium Light</option>
                <option value="Bright Indirect">Bright Indirect</option>
                <option value="Direct Sun">Direct Sun</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Watering Frequency</label>
              <select className="form-select" value={wateringFrequency} onChange={e => setWateringFrequency(e.target.value)} required>
                <option value="">Select Frequency</option>
                <option value="Daily">Daily</option>
                <option value="Every 2-3 days">Every 2-3 days</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-group">
              <input className="checkbox-input" type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
              <span>Mark as Featured Product</span>
            </label>
          </div>

          <button type="submit" className="btn-submit">
            <Save size={20}/> Save Product
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
