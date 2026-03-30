import { MoreVertical } from 'lucide-react';
import Popover from './Popover';

const ContextMenu = ({
  isOpen,
  onOpenChange,
  items = [],
  buttonClassName = '',
  menuClassName = '',
  align = 'right',
  icon = null,
  ariaLabel = 'Open actions menu',
}) => {
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      align={align}
      panelClassName={`w-48 rounded-xl border border-light-border-default dark:border-blue-500/30 bg-light-surface-primary dark:bg-dark-surface-primary shadow-lg py-1.5 ${menuClassName}`}
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          aria-label={ariaLabel}
          className={`p-2 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover transition-colors ${buttonClassName}`}
        >
          {icon || <MoreVertical className="w-4 h-4" />}
        </button>
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            item.onClick();
            onOpenChange(false);
          }}
          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
            item.variant === 'danger'
              ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10'
              : 'text-light-text-primary dark:text-dark-text-primary hover:bg-blue-50 dark:hover:bg-blue-500/10'
          }`}
        >
          {item.label}
        </button>
      ))}
    </Popover>
  );
};

export default ContextMenu;
