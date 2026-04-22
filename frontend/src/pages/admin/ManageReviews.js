import React, { useState, useEffect } from 'react';
import { Trash2, Star, MessageSquare, ArrowLeft, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// ✅ IMPORT CUSTOM MODAL
import CustomConfirmModal from '../../components/CustomConfirmModal';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Toast State
  const [toast, setToast] = useState(null);

  // ✅ NEW: Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ 1. Trigger the Modal (Replaces window.confirm)
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // ✅ 2. Execute Delete (Called when user clicks "Yes" in Modal)
  const executeDelete = async () => {
    setShowConfirm(false); // Close modal
    if (!deleteId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/reviews/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        showNotification('Review Deleted', 'The review has been permanently removed.', 'success');
        setReviews(reviews.filter(r => r._id !== deleteId));
      } else {
        showNotification('Error', 'Failed to delete review', 'error');
      }
    } catch (err) {
      showNotification('Error', 'Something went wrong', 'error');
    }
  };

  // 🎨 RETRO REVIEWS STYLES (Unchanged)
  const styles = `
    .reviews-page {
      padding: 3rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
      color: var(--text-color);
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-title {
      font-family: 'Fraunces', serif;
      font-size: 2.5rem;
      color: var(--secondary-color);
      margin-bottom: 0.5rem;
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

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .review-card {
      background: white;
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
      padding: 1.5rem;
      box-shadow: 6px 6px 0px rgba(93, 109, 54, 0.15); /* Retro Shadow */
      transition: transform 0.2s;
      display: flex;
      flex-direction: column;
    }

    .review-card:hover {
      transform: translateY(-3px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 10px;
      border-bottom: 1px dashed #eee;
    }

    .product-name {
      font-family: 'Fraunces', serif;
      font-size: 1.1rem;
      color: var(--primary-color);
      margin: 0;
    }

    .review-meta {
      font-size: 0.85rem;
      color: #666;
      margin-top: 4px;
    }

    .rating-box {
      background: #fff8e1;
      padding: 4px 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: bold;
      color: #f39c12;
      border: 1px solid #f39c12;
    }

    .review-body {
      flex: 1;
      margin-bottom: 1.5rem;
    }

    .review-title {
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
      color: var(--text-color);
    }

    .review-text {
      color: #555;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
    }

    .delete-btn {
      background: #fee2e2;
      color: #c0392b;
      border: none;
      padding: 10px;
      border-radius: 50px;
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: 0.2s;
      width: 100%;
    }

    .delete-btn:hover {
      background: #fcd2d2;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      border: 2px dashed var(--accent-color);
      max-width: 600px;
      margin: 0 auto;
    }

    /* TOAST STYLES */
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
      box-shadow: 6px 6px 0px rgba(93, 109, 54, 0.15);
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

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Reviews...</div>;

  return (
    <div className="reviews-page">
      <style>{styles}</style>
      
      {/* ✅ RENDER CONFIRM MODAL */}
      <CustomConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />

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
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="page-header">
        <h1 className="page-title">Manage Reviews ({reviews.length})</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} color="#ccc" style={{marginBottom:'1rem'}}/>
          <h3>No reviews found</h3>
          <p style={{color:'#666'}}>Wait for customers to share their love! 💚</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              
              <div className="card-header">
                <div>
                  <h3 className="product-name">{review.product?.name || "Deleted Product"}</h3>
                  <div className="review-meta">
                    by <strong>{review.user?.name || "Guest"}</strong> • {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="rating-box">
                  {review.rating} <Star size={14} fill="currentColor" />
                </div>
              </div>

              <div className="review-body">
                <strong className="review-title">{review.title}</strong>
                <p className="review-text">"{review.comment}"</p>
              </div>

              <button 
                // ✅ CHANGED: Call trigger function instead of inline delete
                onClick={() => handleDeleteClick(review._id)} 
                className="delete-btn"
              >
                <Trash2 size={16} /> Delete Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReviews;