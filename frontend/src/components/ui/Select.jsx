import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Select Component
 */
const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  labelClassName = '',
  selectClassName = '',
  ...props
}, ref) => {
  
  const baseSelectStyles = 'block px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-900';
  
  const stateStyles = error
    ? 'border-danger-500 text-danger-900 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-400 dark:text-danger-400'
    : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-200 dark:border-gray-700 dark:text-gray-100 dark:focus:border-primary-400';
  
  const width = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${width} ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 ${labelClassName}`}>
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        disabled={disabled}
        required={required}
        className={`${baseSelectStyles} ${stateStyles} ${width} ${selectClassName}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      
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

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  selectClassName: PropTypes.string,
};

export default Select;
