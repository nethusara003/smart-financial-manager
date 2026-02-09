import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Tabs Component
 */
const Tabs = ({
  tabs,
  defaultTab = 0,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };
  
  const variants = {
    underline: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: 'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
      active: 'border-primary-600 text-primary-600 dark:text-primary-400',
      inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600',
    },
    pills: {
      container: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex gap-1',
      tab: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
      active: 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
    },
    bordered: {
      container: 'border border-gray-200 dark:border-gray-700 rounded-lg p-1 inline-flex gap-1',
      tab: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
      active: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800',
      inactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
    },
  };
  
  const currentVariant = variants[variant];
  
  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={currentVariant.container}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`${currentVariant.tab} ${
              activeTab === index ? currentVariant.active : currentVariant.inactive
            }`}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {tabs.map((tab, index) => (
          <div
            key={index}
            id={`tabpanel-${index}`}
            role="tabpanel"
            hidden={activeTab !== index}
            className={activeTab === index ? 'animate-fade-in' : ''}
          >
            {activeTab === index && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  defaultTab: PropTypes.number,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['underline', 'pills', 'bordered']),
  className: PropTypes.string,
};

export default Tabs;
