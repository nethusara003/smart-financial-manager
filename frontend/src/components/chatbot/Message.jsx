import React from 'react';

const Message = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Parse message content for special formatting
  const renderContent = (content) => {
    // Split by newlines and render with proper formatting
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Check for bold text (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        // Add text before bold
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${index}-${lastIndex}`}>
              {line.substring(lastIndex, match.index)}
            </span>
          );
        }
        // Add bold text
        parts.push(
          <strong key={`bold-${index}-${match.index}`} className="font-semibold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(
          <span key={`text-${index}-${lastIndex}`}>
            {line.substring(lastIndex)}
          </span>
        );
      }

      return (
        <div key={index} className={index < lines.length - 1 ? 'mb-1' : ''}>
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex flex-col items-end max-w-[70%]">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-gold-500 dark:to-gold-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2 mb-4">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gold-500 dark:to-gold-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      
      {/* Message Content */}
      <div className="flex flex-col max-w-[80%]">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {renderContent(message.content)}
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default Message;
