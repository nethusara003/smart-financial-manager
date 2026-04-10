import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuickSuggestions from './QuickSuggestions';
import { sendMessage, startNewConversation, getSuggestions } from '../../services/chatbotApi';

const ChatWindow = ({ onClose, onMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      
      // Check if there's a conversation ID in localStorage
      const storedConvId = localStorage.getItem('chatbot_conversation_id');
      
      if (storedConvId) {
        setConversationId(storedConvId);
        // Load conversation history here if needed
      } else {
        // Start new conversation
        const response = await startNewConversation();
        setConversationId(response.conversationId);
        localStorage.setItem('chatbot_conversation_id', response.conversationId);
        
        // Add welcome message
        if (response.welcomeMessage) {
          setMessages([{
            role: 'assistant',
            content: response.welcomeMessage,
            timestamp: new Date(),
            messageId: 'welcome'
          }]);
        }
      }
      
      // Load suggestions
      const suggestionsData = await getSuggestions();
      if (suggestionsData.success) {
        setSuggestions(suggestionsData.contextual || suggestionsData.popular || []);
      }
      
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText) => {
    try {
      setError(null);
      
      // Add user message optimistically
      const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        messageId: `user-${Date.now()}`
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Send message to backend
      const response = await sendMessage(messageText, conversationId, messages);

      // Update conversation ID if this was the first message
      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
        localStorage.setItem('chatbot_conversation_id', response.conversationId);
      }

      if (Array.isArray(response.updatedHistory) && response.updatedHistory.length > 0) {
        const rebuiltMessages = response.updatedHistory.map((entry, index) => ({
          role: entry.role,
          content: entry.content,
          timestamp: new Date(),
          messageId: `${entry.role}-${Date.now()}-${index}`,
        }));
        setMessages(rebuiltMessages);
      } else {
        // Fallback if backend does not include history
        const assistantMessage = {
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
          messageId: `assistant-${Date.now()}`,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

      // Update suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
        messageId: `error-${Date.now()}`,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      // Clear current conversation
      setMessages([]);
      setConversationId(null);
      localStorage.removeItem('chatbot_conversation_id');
      
      // Start new conversation
      await initializeConversation();
    } catch (error) {
      console.error('Failed to start new conversation:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-dark-bg-primary rounded-lg shadow-2xl dark:shadow-glow-blue overflow-hidden border border-gray-200 dark:border-blue-500/20">
      {/* Header */}
      <ChatHeader
        onClose={onClose}
        onMinimize={onMinimize}
        onNewConversation={handleNewConversation}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isTyping={isTyping}
        isLoading={isLoading}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && !isTyping && (
        <QuickSuggestions
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isTyping || isLoading}
      />
    </div>
  );
};

export default ChatWindow;
