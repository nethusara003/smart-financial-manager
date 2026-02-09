import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Dropdown Menu Component
 */
const Dropdown = ({
  trigger,
  items,
  position = 'bottom-left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  const positions = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };
  
  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (!item.keepOpen) {
      setIsOpen(false);
    }
  };
  
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${positions[position]} z-50 min-w-[12rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 animate-scale-in`}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={index}
                  className="my-1 border-t border-gray-200 dark:border-gray-700"
                />
              );
            }
            
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : item.danger
                    ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                    {item.badge}
                  </span>
                )}
                {item.shortcut && (
                  <span className="text-xs text-gray-400">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      shortcut: PropTypes.string,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      danger: PropTypes.bool,
      divider: PropTypes.bool,
      keepOpen: PropTypes.bool,
    })
  ).isRequired,
  position: PropTypes.oneOf(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
  className: PropTypes.string,
};

export default Dropdown;
