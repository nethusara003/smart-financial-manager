import React, { useState } from 'react';
import { Overlay } from '../ui';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Overlay
          isOpen={isOpen}
          onClose={handleClose}
          containerClassName="items-end justify-end p-4 pb-20 md:pb-4"
          panelClassName="max-w-full md:max-w-[400px]"
          backdropClassName="bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
          ariaLabelledBy="chat-widget-title"
        >
          <div className="w-full md:w-[400px] h-[600px] max-h-[calc(100vh-100px)] md:max-h-[600px] animate-in slide-in-from-bottom-8 fade-in duration-300">
            <h2 id="chat-widget-title" className="sr-only">Financial Assistant chat</h2>
            <ChatWindow onClose={handleClose} onMinimize={handleToggle} />
          </div>
        </Overlay>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl dark:shadow-glow-blue hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 transition-all duration-200 flex items-center justify-center group"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            
            {/* Notification Badge */}
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full animate-ping absolute"></span>
                <span className="w-2 h-2 bg-white rounded-full"></span>
              </span>
            )}
          </>
        )}
      </button>

    </>
  );
};

export default ChatWidget;
