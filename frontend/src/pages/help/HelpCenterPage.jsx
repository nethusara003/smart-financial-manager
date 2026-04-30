import React from 'react';
import { ArrowLeft, ExternalLink, Book, FileText, Shield, Target, TrendingUp, Download, Bug, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpCenterPage = ({ onBack, onNavigate }) => {
  const navigate = useNavigate();

  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    navigate(path);
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank');
  };

  const helpSections = [
    {
      icon: Book,
      title: "User Guide",
      description: "Complete walkthrough of all features",
      color: "from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600",
      links: [
        { 
          title: "Getting Started", 
          description: "First steps with SFT",
          action: () => goTo('/transactions')
        },
        { 
          title: "Managing Transactions", 
          description: "Add, edit, and organize transactions",
          action: () => goTo('/transactions')
        },
        { 
          title: "Setting Up Goals", 
          description: "Create and track financial goals",
          action: () => goTo('/goals')
        },
        { 
          title: "Budget Planning", 
          description: "Control spending with budgets",
          action: () => goTo('/budgets')
        }
      ]
    },
    {
      icon: FileText,
      title: "FAQ & Support",
      description: "Answers to common questions",
      color: "from-green-500 to-green-600",
      links: [
        { 
          title: "Account Management", 
          description: "Password, settings, and profile",
          action: () => goTo('/settings')
        },
        { 
          title: "Data Export", 
          description: "Backing up your financial data",
          action: () => goTo('/settings?tab=data')
        },
        { 
          title: "Notification Settings", 
          description: "Configure alerts and emails",
          action: () => goTo('/settings?tab=notifications')
        },
        { 
          title: "Privacy & Security", 
          description: "Manage your security settings",
          action: () => goTo('/settings?tab=privacy')
        }
      ]
    },
    {
      icon: Shield,
      title: "Security",
      description: "Keep your financial data safe",
      color: "from-red-500 to-red-600",
      links: [
        { 
          title: "Two-Factor Authentication", 
          description: "Enable additional security",
          action: () => goTo('/settings?tab=privacy')
        },
        { 
          title: "Session Management", 
          description: "Control your login sessions",
          action: () => goTo('/settings?tab=privacy')
        },
        { 
          title: "Change Password", 
          description: "Update your account password",
          action: () => goTo('/settings?tab=password')
        },
        { 
          title: "Best Practices", 
          description: "Tips for staying secure",
          action: () => goTo('/settings?tab=privacy')
        }
      ]
    },
    {
      icon: Target,
      title: "Advanced Features",
      description: "Make the most of SFT",
      color: "from-orange-500 to-orange-600",
      links: [
        { 
          title: "Analytics & Reports", 
          description: "Deep insights into your finances",
          action: () => goTo('/analytics')
        },
        { 
          title: "Bills & Reminders", 
          description: "Track upcoming payments",
          action: () => goTo('/dashboard')
        },
        { 
          title: "AI Assistant", 
          description: "Get smart financial insights",
          action: () => goTo('/chat')
        }
      ]
    }
  ];

  const quickActions = [
    {
      icon: TrendingUp,
      title: "View Analytics",
      description: "Deep insights into your spending patterns",
      action: () => goTo('/analytics'),
      color: "blue"
    },
    {
      icon: Download,
      title: "Export Data",
      description: "Download your financial records",
      action: () => goTo('/settings?tab=data'),
      color: "green"
    },
    {
      icon: Bug,
      title: "Report a Bug",
      description: "Help us improve the application",
      action: () => handleExternalLink('https://github.com/nethusara003/smart-financial-manager/issues/new'),
      color: "orange"
    },
    {
      icon: Settings,
      title: "Manage Settings",
      description: "Customize your experience",
      action: () => goTo('/settings'),
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help
          </button>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600/90 dark:to-indigo-700 rounded-2xl p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Book className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Help Center</h1>
                  <p className="text-white/90 text-lg">Everything you need to know about Smart Financial Tracker</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Help Sections */}
        <div className="grid gap-6 mb-8">
          {helpSections.map((section, index) => (
            <div
              key={index}
              className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`bg-gradient-to-br ${section.color} p-3 rounded-xl shadow-lg`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    {section.title}
                  </h2>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.links.map((link, linkIndex) => (
                  <button
                    key={linkIndex}
                    onClick={link.action}
                    className="flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors text-left group"
                  >
                    <div>
                      <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {link.title}
                      </h4>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        {link.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-xl border border-light-border-default dark:border-dark-border-default hover:shadow-md transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                      <Icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                        {action.title}
                      </h4>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {action.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-gradient-to-r from-light-surface-secondary to-light-surface-primary dark:from-dark-surface-secondary dark:to-dark-surface-primary rounded-xl p-6 border border-light-border-default dark:border-dark-border-strong">
          <div className="text-center">
            <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Still Need Help?
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={onBack}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl"
              >
                Back to Help
              </button>
              <button 
                onClick={() => handleExternalLink('https://github.com/nethusara003/smart-financial-manager/issues/new')}
                className="px-6 py-3 border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg font-medium transition-all duration-200"
              >
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;