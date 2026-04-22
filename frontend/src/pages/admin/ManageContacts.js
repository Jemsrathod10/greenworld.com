import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, Trash2, CheckCircle, Clock, Archive, ArrowLeft, RefreshCw, Filter, AlertTriangle, X } from 'lucide-react';
// ✅ IMPORT CUSTOM MODAL
import CustomConfirmModal from '../../components/CustomConfirmModal';

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
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

  useEffect(() => {
    fetchContacts();
  }, [filterStatus]);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all' 
        ? '/contact'
        : `/contact?status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts || []);
        setStats(data.stats || {});
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        fetchContacts();
        if (selectedContact?._id === id) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      } else {
        showNotification('Update Failed', 'Failed to update status', 'error');
      }
    } catch (err) {
      showNotification('Error', 'Error updating status', 'error');
    }
  };

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
      const response = await fetch(`/contact/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Message Deleted', 'Message deleted successfully', 'success');
        fetchContacts();
        if (selectedContact?._id === deleteId) {
          setSelectedContact(null);
        }
      } else {
        showNotification('Error', 'Failed to delete message', 'error');
      }
    } catch (err) {
      showNotification('Error', 'Error deleting message', 'error');
    }
  };

  const handleViewDetails = async (contact) => {
    setSelectedContact(contact);
    
    // Mark as read if unread
    if (contact.status === 'unread') {
      await handleStatusUpdate(contact._id, 'read');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return { bg: '#fff3cd', color: '#856404', icon: <Mail size={16}/> };
      case 'read': return { bg: '#d1ecf1', color: '#0c5460', icon: <Eye size={16}/> };
      case 'replied': return { bg: '#d4edda', color: '#155724', icon: <CheckCircle size={16}/> };
      case 'archived': return { bg: '#e2e3e5', color: '#383d41', icon: <Archive size={16}/> };
      default: return { bg: '#f8f9fa', color: '#666', icon: <Mail size={16}/> };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // 🎨 STYLES (UNCHANGED)
  const styles = `
    .contacts-page {
      padding: 3rem 1rem;
      background: var(--bg-color);
      min-height: 100vh;
      font-family: 'Quicksand', sans-serif;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-family: 'Fraunces', serif;
      font-size: 2.2rem;
      color: var(--secondary-color);
      margin: 0;
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
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .refresh-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: 0.3s;
    }

    .refresh-btn:hover {
      background: #b34500;
      transform: translateY(-2px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid var(--secondary-color);
      box-shadow: 4px 4px 0px rgba(93, 109, 54, 0.15);
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
    }

    .stat-card .count {
      font-family: 'Fraunces', serif;
      font-size: 2rem;
      color: var(--primary-color);
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.6rem 1.2rem;
      border-radius: 30px;
      border: 2px solid var(--secondary-color);
      background: white;
      color: var(--secondary-color);
      font-weight: bold;
      cursor: pointer;
      transition: 0.2s;
    }

    .filter-btn.active {
      background: var(--secondary-color);
      color: white;
    }

    .filter-btn.active:hover {
      background: var(--secondary-color);
      color: white;
    }

    .filter-btn:hover {
      background: var(--accent-color);
      color: var(--text-color);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
    }

    .contacts-list {
      background: white;
      border-radius: 16px;
      border: 2px solid var(--secondary-color);
      padding: 1.5rem;
      max-height: 600px;
      overflow-y: auto;
    }

    .contact-item {
      padding: 1rem;
      border-radius: 10px;
      border: 2px solid #eee;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: 0.2s;
    }

    .contact-item:hover {
      border-color: var(--accent-color);
      background: #fbf8e8;
    }

    .contact-item.active {
      border-color: var(--primary-color);
      background: #fff3cd;
    }

    .contact-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.5rem;
    }

    .contact-name {
      font-weight: bold;
      color: var(--text-color);
      margin: 0;
    }

    .contact-email {
      font-size: 0.85rem;
      color: #666;
    }

    .contact-subject {
      font-weight: 600;
      color: var(--secondary-color);
      margin: 0.5rem 0;
    }

    .contact-preview {
      font-size: 0.9rem;
      color: #888;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .contact-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #999;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .detail-panel {
      background: white;
      border-radius: 16px;
      border: 2px solid var(--secondary-color);
      padding: 2rem;
      box-shadow: 8px 8px 0px rgba(93, 109, 54, 0.15);
    }

    .detail-panel h2 {
      font-family: 'Fraunces', serif;
      color: var(--secondary-color);
      margin-bottom: 1.5rem;
    }

    .detail-row {
      margin-bottom: 1rem;
    }

    .detail-label {
      font-weight: bold;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.3rem;
    }

    .detail-value {
      color: var(--text-color);
    }

    .message-box {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 10px;
      border: 1px solid #ddd;
      margin: 1rem 0;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 0.6rem 1.2rem;
      border-radius: 30px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: 0.2s;
    }

    .btn-replied {
      background: #28a745;
      color: white;
    }

    .btn-archive {
      background: #6c757d;
      color: white;
    }

    .btn-delete {
      background: #dc3545;
      color: white;
    }

    .btn-action:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
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

  if (loading) {
    return (
      <div className="contacts-page">
        <style>{styles}</style>
        <div style={{textAlign:'center', padding:'4rem'}}>
          <h2 style={{fontFamily:'Fraunces', color:'var(--secondary-color)'}}>Loading messages...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <style>{styles}</style>
      
      {/* ✅ RENDER CONFIRM MODAL */}
      <CustomConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Message?"
        message="Are you sure you want to delete this message? This action cannot be undone."
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

      <button onClick={() => navigate('/admin')} className="back-btn">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Messages</h1>
        </div>
        <button onClick={fetchContacts} className="refresh-btn">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Messages</h3>
          <p className="count">{contacts.length}</p>
        </div>
        <div className="stat-card">
          <h3>Unread</h3>
          <p className="count">{stats.unread || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Replied</h3>
          <p className="count">{stats.replied || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Archived</h3>
          <p className="count">{stats.archived || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Messages
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'unread' ? 'active' : ''}`}
          onClick={() => setFilterStatus('unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'read' ? 'active' : ''}`}
          onClick={() => setFilterStatus('read')}
        >
          Read
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'replied' ? 'active' : ''}`}
          onClick={() => setFilterStatus('replied')}
        >
          Replied
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'archived' ? 'active' : ''}`}
          onClick={() => setFilterStatus('archived')}
        >
          Archived
        </button>
      </div>

      {error && (
        <div style={{background:'#f8d7da', color:'#721c24', padding:'1rem', borderRadius:'8px', marginBottom:'1rem'}}>
          {error}
        </div>
      )}

      <div className="content-grid">
        {/* Messages List */}
        <div className="contacts-list">
          {contacts.length === 0 ? (
            <div className="empty-state">
              <Mail size={48} />
              <p>No messages found</p>
            </div>
          ) : (
            contacts.map((contact) => {
              const statusStyle = getStatusColor(contact.status);
              return (
                <div 
                  key={contact._id} 
                  className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                  onClick={() => handleViewDetails(contact)}
                >
                  <div className="contact-header">
                    <div>
                      <h3 className="contact-name">{contact.name}</h3>
                      <p className="contact-email">{contact.email}</p>
                    </div>
                    <div className="status-badge" style={{backgroundColor: statusStyle.bg, color: statusStyle.color}}>
                      {statusStyle.icon} {contact.status}
                    </div>
                  </div>
                  <p className="contact-subject">{contact.subject}</p>
                  <p className="contact-preview">{contact.message}</p>
                  <div className="contact-meta">
                    <span>{formatDate(contact.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="detail-panel">
          {selectedContact ? (
            <>
              <h2>Message Details</h2>
              
              <div className="detail-row">
                <div className="detail-label">From</div>
                <div className="detail-value">
                  <strong>{selectedContact.name}</strong>
                  <br />
                  {selectedContact.email}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Subject</div>
                <div className="detail-value">{selectedContact.subject}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Date</div>
                <div className="detail-value">{formatDate(selectedContact.createdAt)}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className="status-badge" style={{
                    backgroundColor: getStatusColor(selectedContact.status).bg,
                    color: getStatusColor(selectedContact.status).color
                  }}>
                    {getStatusColor(selectedContact.status).icon} {selectedContact.status}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Message</div>
                <div className="message-box">{selectedContact.message}</div>
              </div>

              <div className="actions">
                {selectedContact.status !== 'replied' && (
                  <button 
                    className="btn-action btn-replied"
                    onClick={() => handleStatusUpdate(selectedContact._id, 'replied')}
                  >
                    <CheckCircle size={16} /> Mark as Replied
                  </button>
                )}
                
                {selectedContact.status !== 'archived' && (
                  <button 
                    className="btn-action btn-archive"
                    onClick={() => handleStatusUpdate(selectedContact._id, 'archived')}
                  >
                    <Archive size={16} /> Archive
                  </button>
                )}

                <button 
                  className="btn-action btn-delete"
                  // ✅ CHANGED: Use Trigger Function
                  onClick={() => handleDeleteClick(selectedContact._id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Mail size={64} color="#ddd" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageContacts;