import React, { useState, useEffect } from 'react';
import { X, HelpCircle, BookOpen, Mail, ExternalLink, FileText, Zap } from 'lucide-react';
import { Overlay } from '../ui';
import GettingStartedPage from '../../pages/help/GettingStartedPage';
import QuickTipsPage from '../../pages/help/QuickTipsPage';
import DocumentationPage from '../../pages/help/DocumentationPage';
import EmailSupportPage from '../../pages/help/EmailSupportPage';
import HelpCenterPage from '../../pages/help/HelpCenterPage';

const HelpPanel = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(null);

  // Apply premium blur effect to main content when panel is open
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (isOpen) {
        // Premium blur effect
        mainContent.style.filter = 'blur(15px) saturate(0.8)';
        mainContent.style.transform = 'scale(1.02)';
        mainContent.style.opacity = '0.4';
        mainContent.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        mainContent.style.pointerEvents = 'none';
        
        // Add subtle overlay
        const overlay = document.createElement('div');
        overlay.id = 'help-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 240px;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
          pointer-events: none;
          z-index: 40;
          transition: all 0.5s ease;
        `;
        document.body.appendChild(overlay);
      } else {
        // Reset styles
        mainContent.style.filter = 'none';
        mainContent.style.transform = 'scale(1)';
        mainContent.style.opacity = '1';
        mainContent.style.pointerEvents = 'auto';
        
        // Remove overlay
        const overlay = document.getElementById('help-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    }

    // Cleanup function
    return () => {
      if (mainContent) {
        mainContent.style.filter = 'none';
        mainContent.style.transform = 'scale(1)';
        mainContent.style.opacity = '1';
        mainContent.style.pointerEvents = 'auto';
      }
      const overlay = document.getElementById('help-overlay');
      if (overlay) {
        overlay.remove();
      }
    };
  }, [isOpen]);

  if (!isOpen && !currentPage) return null;

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage(null);
  };

  // Render specific help pages
  if (currentPage === 'getting-started') {
    return <GettingStartedPage onBack={handleBack} />;
  }
  if (currentPage === 'quick-tips') {
    return <QuickTipsPage onBack={handleBack} />;
  }
  if (currentPage === 'documentation') {
    return <DocumentationPage onBack={handleBack} />;
  }
  if (currentPage === 'email-support') {
    return <EmailSupportPage onBack={handleBack} />;
  }
  if (currentPage === 'help-center') {
    return <HelpCenterPage onBack={handleBack} />;
  }

  const helpTopics = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of managing your finances',
      color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      action: () => handleNavigation('getting-started')
    },
    {
      icon: Zap,
      title: 'Quick Tips',
      description: 'Maximize your productivity with keyboard shortcuts',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      action: () => handleNavigation('quick-tips')
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Comprehensive guides and references',
      color: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
      action: () => handleNavigation('documentation')
    }
  ];

  const quickActions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@smartfinance.com',
      action: 'Contact Us',
      color: 'primary',
      onClick: () => handleNavigation('email-support')
    }
  ];

  const faqs = [
    {
      question: 'How do I add a transaction?',
      answer: 'Go to the Transactions page and click the "+ Add Transaction" button in the top right.'
    },
    {
      question: 'How do I change my currency?',
      answer: 'Use the currency selector in the top navigation bar. Your preference will be saved automatically.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! Go to Transactions page and click the download icon to export as CSV or PDF.'
    },
    {
      question: 'How do I set up budgets?',
      answer: 'Navigate to the Budgets page and create category-based budgets with spending limits.'
    }
  ];

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      containerClassName="items-start justify-end pt-20 px-4"
      backdropClassName="bg-transparent"
      panelClassName="max-w-lg mr-4"
      ariaLabelledBy="help-panel-title"
    >
      <div className="relative w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden animate-slide-in-down ring-1 ring-black/5 dark:ring-white/10">
        {/* Header with enhanced gradient */}
        <div className="p-6 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-blue-50/90 dark:from-blue-900/50 to-blue-50/90 dark:to-blue-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm border border-white/40 dark:border-gray-600/40">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 id="help-panel-title" className="text-lg font-bold text-gray-900 dark:text-white">Help & Support</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">We're here to help</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content with glass effect */}
        <div className="max-h-[32rem] overflow-y-auto">
          {/* Help Topics */}
          <div className="p-6 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Browse Topics</h4>
            <div className="grid grid-cols-1 gap-3">
              {helpTopics.map((topic, index) => {
                const IconComponent = topic.icon;
                return (
                  <button
                    key={index}
                    onClick={topic.action}
                    className="p-4 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-300 text-left group border border-white/30 dark:border-gray-600/30 hover:border-blue-300/50 dark:hover:border-blue-500/50 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] transform"
                  >
                    <div className={`p-2 ${topic.color} rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h5 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {topic.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {topic.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 pb-6 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Support</h4>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-white/70 dark:from-gray-800/70 to-blue-50/70 dark:to-blue-900/30 border border-white/30 dark:border-gray-600/30 rounded-xl hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-sm hover:scale-[1.02] transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-blue-100/80 dark:bg-blue-500/10 rounded-lg shadow-sm backdrop-blur-sm`}>
                        <IconComponent className={`w-4 h-4 text-blue-600 dark:text-blue-400`} />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {action.title}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <button className={`px-3 py-1.5 bg-blue-100/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-200/80 dark:hover:bg-blue-500/20 text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm`}>
                      {action.action}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQs */}
          <div className="px-6 pb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Frequently Asked Questions
            </h4>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white/60 dark:bg-gray-800/60 rounded-lg overflow-hidden backdrop-blur-sm border border-white/30 dark:border-gray-600/30"
                >
                  <summary className="px-4 py-3 cursor-pointer font-medium text-sm text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-gray-700/60 transition-all duration-200 list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <svg
                      className="w-4 h-4 text-gray-600 dark:text-gray-400 group-open:rotate-180 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-3 text-sm text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="px-6 pb-6 bg-white/40 dark:bg-gray-800/40 border-t border-white/30 dark:border-gray-600/30 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pt-6">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Search</span>
                <kbd className="px-2 py-1 bg-white/80 dark:bg-gray-700/80 border border-white/40 dark:border-gray-600/40 rounded text-gray-900 dark:text-white font-mono backdrop-blur-sm shadow-sm">
                  Ctrl + K
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Add Transaction</span>
                <kbd className="px-2 py-1 bg-white/80 dark:bg-gray-700/80 border border-white/40 dark:border-gray-600/40 rounded text-gray-900 dark:text-white font-mono backdrop-blur-sm shadow-sm">
                  Ctrl + N
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Help</span>
                <kbd className="px-2 py-1 bg-white/80 dark:bg-gray-700/80 border border-white/40 dark:border-gray-600/40 rounded text-gray-900 dark:text-white font-mono backdrop-blur-sm shadow-sm">
                  ?
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with glass effect */}
        <div className="p-4 border-t border-white/30 dark:border-gray-600/30 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
          <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
            Still need help?{' '}
            <button 
              onClick={() => handleNavigation('help-center')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 hover:underline transition-all duration-200"
            >
              Visit our Help Center
              <ExternalLink className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>
    </Overlay>
  );
};

export default HelpPanel;
