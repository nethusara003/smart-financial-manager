import PropTypes from 'prop-types';

/**
 * Premium Avatar Component
 */
const Avatar = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  shape = 'circle',
  className = '',
}) => {
  
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };
  
  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };
  
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };
  
  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-danger-500',
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizes[size]} ${shapes[shape]} bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center font-semibold text-white overflow-hidden`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      
      {status && (
        <span
          className={`absolute bottom-0 right-0 block ${statusSizes[size]} ${statusColors[status]} rounded-full ring-2 ring-white dark:ring-gray-900`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
  shape: PropTypes.oneOf(['circle', 'square']),
  className: PropTypes.string,
};

/**
 * Avatar Group Component
 */
export const AvatarGroup = ({ children, max = 5, size = 'md', className = '' }) => {
  const childrenArray = Array.isArray(children) ? children : [children];
  const displayChildren = childrenArray.slice(0, max);
  const remaining = childrenArray.length - max;
  
  const overlaps = {
    xs: '-space-x-2',
    sm: '-space-x-3',
    md: '-space-x-4',
    lg: '-space-x-5',
    xl: '-space-x-6',
    '2xl': '-space-x-8',
  };
  
  return (
    <div className={`flex items-center ${overlaps[size]} ${className}`}>
      {displayChildren.map((child, index) => (
        <div
          key={index}
          className="ring-2 ring-white dark:ring-gray-900 rounded-full"
        >
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <Avatar
          size={size}
          name={`+${remaining}`}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      )}
    </div>
  );
};

AvatarGroup.propTypes = {
  children: PropTypes.node.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
};

export default Avatar;
