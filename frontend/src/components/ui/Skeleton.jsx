import PropTypes from 'prop-types';

/**
 * Premium Skeleton Loading Component
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  circle = false,
  count = 1,
  className = '',
  animated = true,
}) => {
  
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';
  const animationStyles = animated ? 'animate-pulse' : '';
  
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    heading: 'h-8 rounded',
    button: 'h-10 rounded-lg',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-64 rounded-xl',
    rectangle: 'rounded-lg',
  };
  
  const shapeStyles = circle ? 'rounded-full' : variants[variant];
  const widthStyle = width ? { width } : 'w-full';
  const heightStyle = height ? { height } : '';
  
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseStyles} ${shapeStyles} ${animationStyles} ${className}`}
      style={{ ...widthStyle, ...heightStyle }}
    />
  ));
  
  return count > 1 ? (
    <div className="space-y-3">
      {skeletons}
    </div>
  ) : (
    skeletons[0]
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'title', 'heading', 'button', 'avatar', 'card', 'rectangle']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  circle: PropTypes.bool,
  count: PropTypes.number,
  className: PropTypes.string,
  animated: PropTypes.bool,
};

/**
 * Card Skeleton Component
 */
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-dark-surface-primary rounded-xl p-6 border border-gray-200 dark:border-dark-border-default ${className}`}>
    <div className="flex items-center mb-4">
      <Skeleton variant="avatar" className="mr-3" />
      <div className="flex-1">
        <Skeleton variant="title" width="60%" className="mb-2" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" count={3} className="mb-2" />
    <Skeleton variant="button" width="30%" />
  </div>
);

CardSkeleton.propTypes = {
  className: PropTypes.string,
};

/**
 * Table Row Skeleton Component
 */
export const TableRowSkeleton = ({ columns = 4, className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    {Array.from({ length: columns }, (_, index) => (
      <Skeleton key={index} variant="text" className="flex-1" />
    ))}
  </div>
);

TableRowSkeleton.propTypes = {
  columns: PropTypes.number,
  className: PropTypes.string,
};

export default Skeleton;
