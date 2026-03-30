import { useEffect, useRef } from 'react';

const Popover = ({
  isOpen,
  onOpenChange,
  trigger,
  children,
  className = '',
  panelClassName = '',
  align = 'right',
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onOpenChange]);

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {typeof trigger === 'function'
        ? trigger({
            isOpen,
            toggle: () => onOpenChange(!isOpen),
            open: () => onOpenChange(true),
            close: () => onOpenChange(false),
          })
        : trigger}

      <div
        className={`absolute ${alignmentClass} top-full mt-2 z-[70] origin-top-right transition-all duration-200 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'
        } ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Popover;
