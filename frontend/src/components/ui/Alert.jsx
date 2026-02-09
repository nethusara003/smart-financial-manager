import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Alert Component
 * For displaying important messages to users
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
  ...props
}) => {
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };
  
  const variants = {
    success: {
      container: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
      icon: 'text-success-600 dark:text-success-400',
      title: 'text-success-800 dark:text-success-300',
      text: 'text-success-700 dark:text-success-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    danger: {
      container: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
      icon: 'text-danger-600 dark:text-danger-400',
      title: 'text-danger-800 dark:text-danger-300',
      text: 'text-danger-700 dark:text-danger-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      title: 'text-warning-800 dark:text-warning-300',
      text: 'text-warning-700 dark:text-warning-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-300',
      text: 'text-blue-700 dark:text-blue-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };
  
  const currentVariant = variants[variant];
  
  return (
    <div
      className={`rounded-lg border-l-4 p-4 animate-slide-in-down ${currentVariant.container} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${currentVariant.icon}`}>
          {icon || currentVariant.defaultIcon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${currentVariant.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''} ${currentVariant.text}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={`ml-3 inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${currentVariant.icon}`}
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info']),
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default Alert;
