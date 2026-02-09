import PropTypes from 'prop-types';

/**
 * Premium Spinner/Loading Component
 */
const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const colors = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-success-600 dark:text-success-400',
    danger: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-600 dark:text-warning-400',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400',
  };
  
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white', 'gray']),
  className: PropTypes.string,
};

/**
 * Full Page Loading Overlay
 */
export const LoadingOverlay = ({ message = 'Loading...', className = '' }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${className}`}>
    <div className="text-center">
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
          {message}
        </p>
      )}
    </div>
  </div>
);

LoadingOverlay.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default Spinner;
