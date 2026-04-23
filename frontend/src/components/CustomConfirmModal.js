import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

const CustomConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = true }) => {
  if (!isOpen) return null;

  // 🎨 GREENWORLDS RETRO THEME STYLES
  const styles = `
    /* OVERLAY - Blur Effect */
    .confirm-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(93, 109, 54, 0.4); /* Greenish Tint */
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    }

    /* CARD - Cream Background + Green Border + Retro Shadow */
    .confirm-card {
      background: #fffcf5;
      border: 3px solid var(--secondary-color, #5d6d36);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      width: 90%;
      max-width: 420px;
      text-align: center;
      box-shadow: 12px 12px 0px rgba(93, 109, 54, 0.25);
      position: relative;
      animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* ICON CIRCLE */
    .icon-wrapper {
      width: 70px;
      height: 70px;
      background: ${isDanger ? '#ffe5e5' : '#e6f4ea'};
      border: 3px solid ${isDanger ? '#e74c3c' : '#27ae60'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem auto;
      color: ${isDanger ? '#e74c3c' : '#27ae60'};
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    /* TYPOGRAPHY */
    .confirm-title {
      font-family: 'Fraunces', serif;
      font-size: 1.8rem;
      color: var(--secondary-color, #5d6d36);
      margin-bottom: 0.8rem;
      line-height: 1.2;
    }

    .confirm-msg {
      font-family: 'Quicksand', sans-serif;
      color: #666;
      margin-bottom: 2rem;
      font-size: 1.05rem;
      line-height: 1.6;
    }

    /* BUTTONS */
    .btn-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-modal {
      padding: 12px 24px;
      border-radius: 50px;
      font-weight: 700;
      cursor: pointer;
      font-size: 1rem;
      font-family: 'Quicksand', sans-serif;
      transition: all 0.2s ease;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* "NO" BUTTON (Green Outline) */
    .btn-cancel {
      background: transparent;
      border: 2px solid var(--secondary-color, #5d6d36);
      color: var(--secondary-color, #5d6d36);
    }
    
    .btn-cancel:hover {
      background: var(--secondary-color, #5d6d36);
      color: white;
      transform: translateY(-2px);
    }

    /* "YES" BUTTON (Red or Green based on action) */
    .btn-confirm {
      background: ${isDanger ? '#e74c3c' : '#27ae60'};
      border: 2px solid ${isDanger ? '#e74c3c' : '#27ae60'};
      color: white;
      box-shadow: 0 4px 0px ${isDanger ? '#c0392b' : '#219150'}; /* 3D Click Effect */
    }
    
    .btn-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0px ${isDanger ? '#c0392b' : '#219150'};
    }
    
    .btn-confirm:active {
      transform: translateY(2px);
      box-shadow: 0 0px 0px ${isDanger ? '#c0392b' : '#219150'};
    }

    /* ANIMATIONS */
    @keyframes popUp {
      from { transform: scale(0.8) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  return (
    <div className="confirm-overlay">
      <style>{styles}</style>
      <div className="confirm-card">
        
        {/* Icon */}
        <div className="icon-wrapper">
          {isDanger ? <AlertTriangle size={36} /> : <Check size={36} />}
        </div>

        {/* Text */}
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-msg">{message}</p>
        
        {/* Buttons */}
        <div className="btn-group">
          <button className="btn-modal btn-cancel" onClick={onClose}>
            <X size={18} /> No, Cancel
          </button>
          <button className="btn-modal btn-confirm" onClick={onConfirm}>
            {isDanger ? 'Yes, Delete' : 'Yes, Confirm'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomConfirmModal;
