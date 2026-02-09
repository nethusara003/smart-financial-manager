import { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Toast Context for managing toasts globally
 */
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      variant: toast.variant || 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 5000,
      dismissible: toast.dismissible !== false,
    };
    
    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
    
    if (newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
    
    return id;
  };
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  // Helper functions
  const toast = {
    success: (message, title = 'Success', options = {}) =>
      addToast({ variant: 'success', title, message, ...options }),
    error: (message, title = 'Error', options = {}) =>
      addToast({ variant: 'danger', title, message, ...options }),
    warning: (message, title = 'Warning', options = {}) =>
      addToast({ variant: 'warning', title, message, ...options }),
    info: (message, title = 'Info', options = {}) =>
      addToast({ variant: 'info', title, message, ...options }),
    custom: (options) => addToast(options),
  };
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']),
  maxToasts: PropTypes.number,
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, position, onRemove }) => {
  const positions = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };
  
  return (
    <div className={`fixed z-[9999] flex flex-col gap-2 ${positions[position]} max-w-md w-full pointer-events-none`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  position: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };
  
  const variants = {
    success: {
      container: 'bg-success-50 border-success-200 dark:bg-success-900/90 dark:border-success-800',
      icon: 'text-success-600 dark:text-success-400',
      text: 'text-success-900 dark:text-success-100',
      iconElement: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    danger: {
      container: 'bg-danger-50 border-danger-200 dark:bg-danger-900/90 dark:border-danger-800',
      icon: 'text-danger-600 dark:text-danger-400',
      text: 'text-danger-900 dark:text-danger-100',
      iconElement: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 dark:bg-warning-900/90 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      text: 'text-warning-900 dark:text-warning-100',
      iconElement: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/90 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      iconElement: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };
  
  const currentVariant = variants[toast.variant];
  
  return (
    <div
      className={`pointer-events-auto rounded-lg border shadow-lg p-4 backdrop-blur-sm transition-all duration-300 ${
        currentVariant.container
      } ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${currentVariant.icon}`}>
          {currentVariant.iconElement}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className={`text-sm font-semibold ${currentVariant.text}`}>
              {toast.title}
            </p>
          )}
          {toast.message && (
            <p className={`text-sm ${toast.title ? 'mt-1' : ''} ${currentVariant.text}`}>
              {toast.message}
            </p>
          )}
        </div>
        {toast.dismissible && (
          <button
            type="button"
            onClick={handleRemove}
            className={`flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${currentVariant.icon}`}
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    variant: PropTypes.string.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    dismissible: PropTypes.bool,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};
