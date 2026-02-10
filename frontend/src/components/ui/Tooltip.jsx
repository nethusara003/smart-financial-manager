import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Premium Tooltip Component
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
  };
  
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
      });
    }
  };
  
  const handleMouseEnter = () => {
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${className}`}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: position === 'top' ? 'translate(-50%, -100%) translateY(-8px)'
              : position === 'bottom' ? 'translate(-50%, 0) translateY(8px)'
              : position === 'left' ? 'translate(-100%, -50%) translateX(-8px)'
              : 'translate(0, -50%) translateX(8px)',
          }}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowPositions[position]}`}
          />
        </div>,
        document.body
      )}
    </>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  className: PropTypes.string,
};

export default Tooltip;
