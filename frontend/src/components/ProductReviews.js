import React, { useState, useEffect } from 'react';
// ✅ Icons for Toast
import { Star, User, MessageSquare, CheckCircle, AlertTriangle, X } from 'lucide-react'; 

const ProductReviews = ({ productId, isAdmin }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', title: '' });
  const [submitting, setSubmitting] = useState(false);

  // ✅ State for Custom Toast Notification
  const [toast, setToast] = useState(null);

  // ✅ Helper function to show custom notification
  const showNotification = (title, message, type = 'success') => {
    setToast({ title, message, type });
    // Auto hide after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch(`/reviews/product/${productId}`)
      .then(res => res.json())
      .then(data => { if(data.success) setReviews(data.reviews); })
      .catch(err => console.error(err));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check: Admin should not be able to submit even if form is somehow visible
    if (isAdmin) return;

    const token = localStorage.getItem('token');
    
    if(!token) {
      showNotification('Login Required', 'Please login to write a review', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...newReview, productId: productId })
      });

      const data = await res.json();
      
      if (res.ok) {
        showNotification('Review Submitted', 'Thanks for sharing your thoughts!', 'success');
        setNewReview({ rating: 5, comment: '', title: '' });
        // Refresh reviews
        const refresh = await fetch(`/reviews/product/${productId}`);
        const refreshData = await refresh.json();
        if(refreshData.success) setReviews(refreshData.reviews);
      } else {
        showNotification('Submission Failed', data.message || "Failed to submit", 'error');
      }
    } catch (err) {
      console.error("Submission Error:", err);
      showNotification('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 🎨 RETRO STYLES
  const styles = `
    .reviews-container {
      margin-top: 40px;
      padding: 30px;
      background: var(--bg-color);
      border-radius: var(--border-radius);
      border: 2px solid var(--secondary-color);
    }

    .review-header {
      font-family: 'Fraunces', serif;
      font-size: 1.6rem;
      color: var(--text-color);
      margin-bottom: 20px;
      border-bottom: 3px dashed var(--accent-color);
      padding-bottom: 10px;
      display: flex; align-items: center; gap: 10px;
    }

    .review-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 15px;
      border: 1px solid #eee;
      box-shadow: 4px 4px 0px rgba(93, 109, 54, 0.1);
    }

    .reviewer-name {
      font-weight: 700;
      color: var(--secondary-color);
      display: flex; align-items: center; gap: 6px;
    }

    .star-icon {
      color: var(--primary-color);
    }

    .review-form {
      background: white;
      padding: 25px;
      border-radius: var(--border-radius);
      border: 2px solid var(--accent-color);
      margin-top: 30px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      margin-bottom: 12px;
      border: 2px solid #ddd;
      border-radius: 10px;
      font-family: 'Quicksand', sans-serif;
      outline: none;
    }

    .form-input:focus {
      border-color: var(--primary-color);
    }

    .btn-submit {
      background: var(--secondary-color);
      color: white;
      padding: 12px 25px;
      border: none;
      border-radius: var(--btn-radius);
      cursor: pointer;
      font-weight: bold;
      transition: 0.3s;
    }

    .btn-submit:hover:not(:disabled) {
      background: var(--primary-color);
      transform: translateY(-2px);
    }

    /* RETRO TOAST STYLES */
    .custom-toast-overlay {
      position: fixed;
      top: 90px;
      right: 20px;
      z-index: 10000;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .retro-toast {
      background: #fffcf5;
      border: 2px solid var(--secondary-color, #5d6d36);
      border-left: 8px solid var(--secondary-color, #5d6d36);
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 6px 6px 0px rgba(93, 109, 54, 0.15);
      display: flex;
      align-items: center;
      gap: 15px;
      min-width: 300px;
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
      color: var(--secondary-color, #5d6d36);
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
    <>
      <style>{styles}</style>
      
      {/* CUSTOM TOAST COMPONENT */}
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

      <div className="reviews-container">
        <h3 className="review-header">
            <MessageSquare size={24} color="var(--primary-color)"/> 
            Customer Reviews ({reviews.length})
        </h3>
        
        <div style={{ margin: '20px 0' }}>
          {reviews.length === 0 && <p style={{color:'#666', fontStyle:'italic'}}>No reviews yet for this plant. 🌱</p>}
          
          {reviews.map(rev => (
            <div key={rev._id} className="review-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'8px' }}>
                <strong className="reviewer-name">
                   <User size={16}/>
                   {rev.user?.name || rev.name || "Plant Lover"}
                </strong>

                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className="star-icon"
                      fill={i < rev.rating ? "currentColor" : "none"} 
                    />
                  ))}
                </div>
              </div>
              
              <strong style={{ display:'block', marginBottom:'5px', color:'var(--text-color)' }}>{rev.title}</strong>
              <p style={{ color: '#555', margin: 0, lineHeight:'1.5' }}>{rev.comment}</p>
            </div>
          ))}
        </div>

        {/* ✅ ADMIN CHECK: Only show form if user is NOT an admin */}
        {!isAdmin ? (
          <form onSubmit={handleSubmit} className="review-form">
            <h4 style={{ fontFamily: 'Fraunces', fontSize:'1.2rem', marginBottom:'15px', color:'var(--text-color)' }}>
              Write a Review
            </h4>
            
            <div style={{ marginBottom:'10px' }}>
               <label style={{fontWeight:'bold', marginRight:'10px'}}>Rating:</label>
               <select 
                  className="form-input" 
                  style={{width:'auto', display:'inline-block'}}
                  value={newReview.rating} 
                  onChange={e=>setNewReview({...newReview, rating: Number(e.target.value)})}
               >
                  <option value="5">5 - Excellent 🌟</option>
                  <option value="4">4 - Good 👍</option>
                  <option value="3">3 - Average 😐</option>
                  <option value="2">2 - Poor 👎</option>
                  <option value="1">1 - Terrible 😭</option>
               </select>
            </div>

            <input 
               className="form-input"
               placeholder="Title (e.g. Beautiful Plant!)" 
               value={newReview.title} 
               onChange={e=>setNewReview({...newReview, title: e.target.value})} 
               required 
            />
            
            <textarea 
               className="form-input"
               placeholder="Share your thoughts..." 
               value={newReview.comment} 
               onChange={e=>setNewReview({...newReview, comment: e.target.value})} 
               style={{ minHeight:'80px', resize:'vertical' }} 
               required 
            />
            
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center', border: '1px dashed #ccc' }}>
            <p style={{ color: '#666', margin: 0 }}>Review submission is disabled in Admin mode.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductReviews;
