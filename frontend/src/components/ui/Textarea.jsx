import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Textarea Component
 */
const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  fullWidth = false,
  maxLength,
  showCount = false,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  value = '',
  ...props
}, ref) => {
  
  const baseTextareaStyles = 'block px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-y bg-white dark:bg-gray-900';
  
  const stateStyles = error
    ? 'border-danger-500 text-danger-900 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-400 dark:text-danger-400'
    : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-200 dark:border-gray-700 dark:text-gray-100 dark:focus:border-primary-400';
  
  const width = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${width} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`${baseTextareaStyles} ${stateStyles} ${width} ${textareaClassName}`}
        {...props}
      />
      
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

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  rows: PropTypes.number,
  fullWidth: PropTypes.bool,
  maxLength: PropTypes.number,
  showCount: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  textareaClassName: PropTypes.string,
  value: PropTypes.string,
};

export default Textarea;
