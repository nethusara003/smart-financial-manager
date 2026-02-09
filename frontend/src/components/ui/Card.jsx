import PropTypes from 'prop-types';

/**
 * Premium Card Component
 * Supports different variants, hover effects, and dark mode
 */
const Card = ({
  children,
  variant = 'default',
  hover = false,
  padding = 'default',
  className = '',
  onClick,
  ...props
}) => {
  
  const baseStyles = 'rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white dark:bg-dark-surface-primary border border-gray-200 dark:border-dark-border-default shadow-card dark:shadow-card-dark',
    elevated: 'bg-white dark:bg-dark-surface-elevated shadow-elevated dark:shadow-elevated-dark',
    outlined: 'bg-white dark:bg-dark-surface-primary border-2 border-gray-300 dark:border-dark-border-strong',
    gradient: 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const hoverStyles = hover 
    ? 'cursor-pointer hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:scale-[1.02] active:scale-[0.98]'
    : '';
  
  const clickable = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${clickable} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'gradient', 'glass']),
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>
    {children}
  </h3>
);

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Description Component
 */
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
