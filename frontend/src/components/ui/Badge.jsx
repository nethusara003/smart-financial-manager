import PropTypes from 'prop-types';

/**
 * Premium Badge Component
 * For status indicators, tags, and labels
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  
  const baseStyles = 'inline-flex items-center font-medium transition-all duration-200';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
    info: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
    outline: 'border-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded gap-1',
    md: 'text-sm px-2.5 py-1 rounded-md gap-1.5',
    lg: 'text-base px-3 py-1.5 rounded-lg gap-2',
  };
  
  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-success-500' :
          variant === 'danger' ? 'bg-danger-500' :
          variant === 'warning' ? 'bg-warning-500' :
          variant === 'primary' ? 'bg-primary-500' :
          'bg-gray-500'
        }`} />
      )}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  className: PropTypes.string,
};

export default Badge;
