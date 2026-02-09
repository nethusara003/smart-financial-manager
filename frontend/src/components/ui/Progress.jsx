import PropTypes from 'prop-types';

/**
 * Premium Progress Bar Component
 */
const Progress = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  striped = false,
  animated = false,
  showLabel = false,
  label,
  className = '',
}) => {
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  };
  
  const variants = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    danger: 'bg-danger-600',
    warning: 'bg-warning-600',
    gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500',
  };
  
  const stripedPattern = striped
    ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_100%]'
    : '';
  
  const animatedClass = animated ? 'animate-pulse' : '';
  
  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variants[variant]} ${stripedPattern} ${animatedClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

Progress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'gradient']),
  striped: PropTypes.bool,
  animated: PropTypes.bool,
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Circular Progress Component
 */
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  strokeWidth = 8,
  showLabel = true,
  className = '',
}) => {
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 160,
  };
  
  const variants = {
    primary: 'stroke-primary-600',
    secondary: 'stroke-secondary-600',
    success: 'stroke-success-600',
    danger: 'stroke-danger-600',
    warning: 'stroke-warning-600',
  };
  
  const circleSize = sizes[size];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={circleSize} height={circleSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-500 ease-out ${variants[variant]}`}
        />
      </svg>
      
      {showLabel && (
        <span className="absolute text-lg font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

CircularProgress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning']),
  strokeWidth: PropTypes.number,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

export default Progress;
