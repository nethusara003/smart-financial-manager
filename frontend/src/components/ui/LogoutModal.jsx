import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LogOut, AlertTriangle, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // Unlock body scroll
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  const handleConfirm = (e) => {
    e?.stopPropagation();
    onConfirm();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose(e);
    } else if (e.key === 'Enter') {
      handleConfirm(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap
      const modal = document.querySelector('[data-modal="logout"]');
      if (modal) {
        modal.focus();
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      data-modal="logout"
      tabIndex={-1}
    >
      {/* Full page backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal container */}
      <div 
        className={`relative w-full max-w-md m-auto transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal card */}
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors group"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Professional Blue Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/20">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Confirm Logout
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Are you sure you want to logout?
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Your session will be ended and you'll need to login again to access your account. All progress data will be permanently lost.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6">
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default LogoutModal;