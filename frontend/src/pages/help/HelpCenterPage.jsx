import React from 'react';
import { ArrowLeft, ExternalLink, Book, FileText, Shield, CreditCard, Target } from 'lucide-react';

const HelpCenterPage = ({ onBack }) => {
  const helpSections = [
    {
      icon: Book,
      title: "User Guide",
      description: "Complete walkthrough of all features",
      color: "from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600",
      links: [
        { title: "Getting Started", description: "First steps with SFT" },
        { title: "Managing Transactions", description: "Add, edit, and organize transactions" },
        { title: "Setting Up Goals", description: "Create and track financial goals" },
        { title: "Budget Planning", description: "Control spending with budgets" }
      ]
    },
    {
      icon: FileText,
      title: "FAQ",
      description: "Answers to common questions",
      color: "from-green-500 to-green-600",
      links: [
        { title: "Account Management", description: "Password, settings, and profile" },
        { title: "Data Export", description: "Backing up your financial data" },
        { title: "Troubleshooting", description: "Common issues and solutions" },
        { title: "Mobile App", description: "Using SFT on mobile" }
      ]
    },
    {
      icon: Shield,
      title: "Security",
      description: "Keep your financial data safe",
      color: "from-red-500 to-red-600",
      links: [
        { title: "Two-Factor Authentication", description: "Enable additional security" },
        { title: "Data Protection", description: "How we protect your information" },
        { title: "Privacy Policy", description: "Our commitment to your privacy" },
        { title: "Best Practices", description: "Tips for staying secure" }
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Subscription and payment information",
      color: "from-blue-500 to-blue-600",
      links: [
        { title: "Plan Comparison", description: "Free vs Premium features" },
        { title: "Billing Information", description: "Manage payment methods" },
        { title: "Upgrade Account", description: "Get access to premium features" },
        { title: "Refund Policy", description: "Our refund and cancellation policy" }
      ]
    },
    {
      icon: Target,
      title: "Advanced Features",
      description: "Make the most of SFT",
      color: "from-orange-500 to-orange-600",
      links: [
        { title: "Analytics & Reports", description: "Deep insights into your finances" },
        { title: "API Integration", description: "Connect with other financial tools" },
        { title: "Automation Rules", description: "Set up automatic categorization" },
        { title: "Custom Categories", description: "Organize transactions your way" }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Download Mobile App",
      description: "Take SFT on the go",
      action: "iOS & Android apps available",
      color: "primary"
    },
    {
      title: "System Status",
      description: "Check if our services are running smoothly",
      action: "View Status Page",
      color: "success"
    },
    {
      title: "Feature Requests",
      description: "Suggest new features or improvements",
      action: "Submit Request",
      color: "warning"
    },
    {
      title: "Community Forum",
      description: "Connect with other SFT users",
      action: "Join Discussion",
      color: "blue"
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
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-xl border border-light-border-default dark:border-dark-border-default hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                      {action.description}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-${action.color}-100 dark:bg-${action.color}-900/20 text-${action.color}-600 dark:text-${action.color}-400 rounded-md`}>
                      {action.action}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
              <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl">
                Contact Support
              </button>
              <button className="px-6 py-3 border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg font-medium transition-all duration-200">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;