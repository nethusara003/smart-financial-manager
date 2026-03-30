import { useEffect } from 'react';
import { X } from 'lucide-react';

const InlineEditor = ({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  className = '',
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow || 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[1090] bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (closeOnBackdrop && onClose) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed left-1/2 top-1/2 z-[1100] w-[min(92vw,640px)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-primary dark:bg-dark-surface-primary shadow-2xl p-0 ${className}`}
      >
        <div className="px-5 py-4 border-b border-light-border-default dark:border-dark-border-default flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">{subtitle}</p> : null}
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-light-border-default dark:border-dark-border-default text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </>
  );
};

export default InlineEditor;
