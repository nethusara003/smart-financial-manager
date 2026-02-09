import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Toggle/Switch Component
 */
const Toggle = forwardRef(({
  label,
  description,
  disabled = false,
  srLabel,
  className = '',
  ...props
}, ref) => {
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
      
      <button
        type="button"
        role="switch"
        ref={ref}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          props.checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-label={srLabel || label}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            props.checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
});

Toggle.displayName = 'Toggle';

Toggle.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  srLabel: PropTypes.string,
  className: PropTypes.string,
};

export default Toggle;
