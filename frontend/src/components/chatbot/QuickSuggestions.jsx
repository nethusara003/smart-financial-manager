import React from 'react';

const QuickSuggestions = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-1">
        <svg className="w-4 h-4 text-gray-400 dark:text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gold-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gold-500/30 rounded-full hover:bg-gray-100 dark:hover:bg-gold-500/20 hover:border-gray-400 dark:hover:border-gold-400 transition-all duration-200 hover:scale-105 active:scale-95 dark:hover:shadow-glow-gold/30"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;
