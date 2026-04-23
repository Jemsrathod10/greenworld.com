import React from 'react';

function OrderStatusUpdate({ currentStatus, onChange, disabled }) {
  
  const styles = `
    .retro-select {
      padding: 10px 15px;
      border: 2px solid var(--secondary-color, #556b2f);
      border-radius: 12px;
      background-color: white;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      color: var(--text-color, #333);
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      min-width: 150px;
    }
    .retro-select:disabled {
      background-color: #e9ecef;
      border-color: #ced4da;
      color: #6c757d;
      cursor: not-allowed;
      opacity: 0.8;
    }
  `;

  // લોજિક: કયા સ્ટેટસ પછી કયા ઓપ્શન દેખાવા જોઈએ
  const getAvailableOptions = () => {
    const status = currentStatus?.toLowerCase();
    
    // જો આ સ્ટેટસ હોય તો એડમિન કશું બદલી ન શકે
    if (['delivered', 'cancelled', 'refunded', 'returned'].includes(status)) {
      return [];
    }

    switch (status) {
      case 'pending':
        return [
          { value: 'pending', label: '⏳ Pending' },
          { value: 'confirmed', label: '✅ Confirmed' },
          { value: 'cancelled', label: '❌ Cancel' }
        ];
      case 'confirmed':
        return [
          { value: 'confirmed', label: '✅ Confirmed' },
          { value: 'processing', label: '⚙️ Processing' },
          { value: 'cancelled', label: '❌ Cancel' }
        ];
      case 'processing':
        return [
          { value: 'processing', label: '⚙️ Processing' },
          { value: 'shipped', label: '🚚 Shipped' }
        ];
      case 'shipped':
        return [
          { value: 'shipped', label: '🚚 Shipped' },
          { value: 'out_for_delivery', label: '📦 Out for Delivery' }
        ];
      case 'out_for_delivery':
        return [
          { value: 'out_for_delivery', label: '📦 Out for Delivery' },
          { value: 'delivered', label: '🎉 Delivered' }
        ];
      default:
        return [{ value: status, label: status }];
    }
  };

  const options = getAvailableOptions();
  const isFinalStatus = options.length === 0;

  return (
    <>
      <style>{styles}</style>
      <select
        className="retro-select"
        value={currentStatus || ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || isFinalStatus}
      >
        {/* જો ફાઈનલ સ્ટેટસ હોય તો ફક્ત તે જ બતાવવું */}
        {isFinalStatus ? (
          <option value={currentStatus}>{currentStatus.toUpperCase()}</option>
        ) : (
          options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))
        )}
      </select>
      {isFinalStatus && <p style={{fontSize: '11px', color: 'red', marginTop: '5px'}}>Final status cannot be changed.</p>}
    </>
  );
}

export default OrderStatusUpdate;
