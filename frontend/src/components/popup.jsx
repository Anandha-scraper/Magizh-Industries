import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import '../styles/componentStyles/popup.css';
// Delete Master popup component
const Popup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info', // 'info', 'warning', 'danger'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={48} className="popup-icon danger" />;
      case 'warning':
        return <AlertTriangle size={48} className="popup-icon warning" />;
      default:
        return <ShieldCheck size={48} className="popup-icon info" />;
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="popup-header">
            <h2 className="popup-title">{title}</h2>
          </div>
        )}

        <div className="popup-content">
          {message && <p className="popup-message">{message}</p>}
          {children}
        </div>

        <div className="popup-actions">
          <button
            className="popup-btn popup-btn-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`popup-btn popup-btn-confirm ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

//Master Creation popup component
const MaterialCreated = () => {
  return (
    <div className="material-created-overlay">
      <div className="material-created-container">
        
        {/* Animated Material Icon */}
        <div className="material-loader">
          <div className="cube">
            <div className="side front"></div>
            <div className="side top"></div>
            <div className="side right"></div>
          </div>
          
          {/* Success Checkmark Circle */}
          <div className="success-ring">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', color: 'white' }}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Status Text */}
        <div className="material-status-text">
          <h2>Material Master Created Successfully!</h2>
        </div>
      </div>
    </div>
  );
};

// Stock Entry popup component
const StockEntryStatus = () => {
  return (
    <div className="stock-overlay">
      <div className="stock-card">
        
        {/* Status Text */}
        <div className="stock-status-text">
          <h2 className="stock-title">Stock Entry Created Successfully!</h2>
        </div>

        {/* Progress Bar */}
        <div className="stock-progress-container">
          <div className="stock-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export { MaterialCreated, StockEntryStatus };
export default Popup;
