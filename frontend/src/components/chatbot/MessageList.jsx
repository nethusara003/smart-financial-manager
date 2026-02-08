import React, { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, isTyping, isLoading }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-gold-500 mb-2"></div>
          <p className="text-sm text-gray-500 dark:text-gold-400/60">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gold-500 dark:to-gold-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gold-300 mb-2">
            Welcome to Financial Assistant!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gold-200/60 mb-4">
            I can help you understand your spending, track your goals, and provide financial insights.
          </p>
          <div className="text-left bg-gray-50 dark:bg-gray-800/50 dark:border dark:border-gold-500/20 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gold-300 mb-2">Try asking:</p>
            <p className="text-xs text-gray-600 dark:text-gold-200/70">💰 "How much did I spend this month?"</p>
            <p className="text-xs text-gray-600 dark:text-gold-200/70">📊 "Show my spending by category"</p>
            <p className="text-xs text-gray-600 dark:text-gold-200/70">🎯 "How close am I to my goals?"</p>
            <p className="text-xs text-gray-600 dark:text-gold-200/70">💡 "Tips for saving money"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth"
      style={{ scrollbarGutter: 'stable' }}
    >
      {messages.map((message, index) => (
        <Message
          key={message.messageId || index}
          message={message}
          isUser={message.role === 'user'}
        />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
