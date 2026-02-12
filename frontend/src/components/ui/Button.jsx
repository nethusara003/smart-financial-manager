import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Button Component
 * Supports multiple variants, sizes, states, and loading indicator
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles with premium dark mode
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 dark:bg-dark-accent-blue dark:hover:bg-blue-500 dark:shadow-glow-blue dark:focus:ring-dark-accent-blue',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 active:bg-secondary-800 dark:bg-dark-accent-purple dark:hover:bg-purple-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 active:bg-success-800 dark:bg-dark-accent-emerald dark:hover:bg-emerald-400',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 active:bg-danger-800 dark:bg-red-500 dark:hover:bg-red-400',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 active:bg-warning-800 dark:bg-dark-accent-gold dark:hover:bg-yellow-400',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:border-dark-accent-blue dark:text-dark-accent-blue dark:hover:bg-dark-surface-hover',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover dark:focus:ring-dark-accent-blue',
    link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500 dark:text-dark-accent-blue dark:hover:text-dark-accent-cyan',
  };
  
  // Size styles
  const sizes = {
    xs: 'text-xs px-2.5 py-1.5 rounded gap-1',
    sm: 'text-sm px-3 py-2 rounded-md gap-1.5',
    md: 'text-base px-4 py-2.5 rounded-lg gap-2',
    lg: 'text-lg px-6 py-3 rounded-lg gap-2',
    xl: 'text-xl px-8 py-4 rounded-xl gap-2.5',
  };
  
  const width = fullWidth ? 'w-full' : '';
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`;
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={combinedClassName}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'ghost', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};

export default Button;
