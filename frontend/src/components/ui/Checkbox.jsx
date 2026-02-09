import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Checkbox Component
 */
const Checkbox = forwardRef(({
  label,
  description,
  disabled = false,
  error,
  className = '',
  labelClassName = '',
  ...props
}, ref) => {
  
  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-primary-500 transition-all cursor-pointer ${
              error ? 'border-danger-500 focus:ring-danger-500' : ''
            }`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer ${labelClassName}`}>
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
};

export default Checkbox;
