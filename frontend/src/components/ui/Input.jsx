import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Input Component
 * Supports labels, errors, helper text, icons, and various states
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  
  const baseInputStyles = 'block px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-900';
  
  const stateStyles = error
    ? 'border-danger-500 text-danger-900 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-400 dark:text-danger-400'
    : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-200 dark:border-gray-700 dark:text-gray-100 dark:focus:border-primary-400';
  
  const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
  const width = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${width} ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 ${labelClassName}`}>
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseInputStyles} ${stateStyles} ${iconPadding} ${width} ${inputClassName}`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default Input;
