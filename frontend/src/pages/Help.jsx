import { useState } from 'react';
import { 
  HelpCircle, 
  Book, 
  Mail, 
  ExternalLink, 
  FileText, 
  Shield, 
  Download,
  Bug,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowRight,
  Github
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmailSupportPage from './help/EmailSupportPage';
import HelpCenterPage from './help/HelpCenterPage';
import GettingStartedPage from './help/GettingStartedPage';
import DocumentationPage from './help/DocumentationPage';

const Help = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');

  // Render sub-pages based on currentView
  if (currentView === 'email-support') {
    return <EmailSupportPage onBack={() => setCurrentView('main')} />;
  }
  
  if (currentView === 'help-center') {
    return <HelpCenterPage onBack={() => setCurrentView('main')} />;
  }
  
  if (currentView === 'getting-started') {
    return <GettingStartedPage onBack={() => setCurrentView('main')} />;
  }
  
  if (currentView === 'documentation') {
    return <DocumentationPage onBack={() => setCurrentView('main')} />;
  }

  const handleExportData = () => {
    navigate('/settings?tab=data');
  };

  const handleBugReport = () => {
    window.open('https://github.com/nethusara003/smart-financial-manager/issues/new', '_blank');
  };

  const supportFeatures = [
    {
      icon: Book,
      title: "Documentation",
      description: "Comprehensive guides and tutorials for all features",
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      items: [
        { 
          name: "Getting Started Guide", 
          description: "Learn the basics in 5 minutes",
          action: () => setCurrentView('getting-started')
        },
        { 
          name: "Complete Documentation", 
          description: "In-depth guides for all features",
          action: () => setCurrentView('documentation')
        },
        { 
          name: "Video Tutorials", 
          description: "Step-by-step video guides",
          action: () => window.open('https://youtube.com/@smartfinancialmanager', '_blank')
        },
        { 
          name: "Best Practices", 
          description: "Tips for managing your finances",
          action: () => setCurrentView('help-center')
        }
      ]
    },
    {
      icon: FileText,
      title: "Help Center & FAQ",
      description: "Quick answers to common questions",
      color: "green",
      gradient: "from-green-500 to-green-600",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      hoverColor: "hover:bg-green-100 dark:hover:bg-green-900/30",
      items: [
        { 
          name: "Browse FAQ", 
          description: "Find answers to common questions",
          action: () => setCurrentView('help-center')
        },
        { 
          name: "Account & Settings", 
          description: "Manage your profile and preferences",
          action: () => navigate('/settings')
        },
        { 
          name: "Security & Privacy", 
          description: "Learn about data protection",
          action: () => navigate('/settings?tab=privacy')
        },
        { 
          name: "Troubleshooting", 
          description: "Common issues and solutions",
          action: () => setCurrentView('help-center')
        }
      ]
    },
    {
      icon: Mail,
      title: "Contact Support",
      description: "Get personalized help from our team",
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
      items: [
        { 
          name: "Email Support", 
          description: "Response within 24 hours",
          action: () => setCurrentView('email-support')
        },
        { 
          name: "Report a Bug", 
          description: "Help us improve the app",
          action: handleBugReport,
          icon: Github
        },
        { 
          name: "Feature Request", 
          description: "Suggest new features",
          action: () => window.open('https://github.com/nethusara003/smart-financial-manager/issues/new?labels=enhancement', '_blank'),
          icon: Github
        },
        { 
          name: "Export Your Data", 
          description: "Download all your financial data",
          action: handleExportData,
          icon: Download
        }
      ]
    }
  ];

  const quickActions = [
    {
      icon: Book,
      title: "View Full Documentation",
      description: "Complete user guides and tutorials",
      color: "blue",
      action: () => setCurrentView('documentation')
    },
    {
      icon: Mail,
      title: "Contact Support Team",
      description: "Get help from our support experts",
      color: "green",
      action: () => setCurrentView('email-support')
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Review your security settings",
      color: "purple",
      action: () => navigate('/settings?tab=privacy')
    },
    {
      icon: Download,
      title: "Export Data",
      description: "Download your financial records",
      color: "orange",
      action: handleExportData
    }
  ];

  const commonQuestions = [
    {
      question: "How do I add a transaction?",
      answer: "Navigate to the Transactions page and click the 'Add Transaction' button.",
      action: () => navigate('/transactions')
    },
    {
      question: "How do I create a budget?",
      answer: "Go to the Budgets page and set spending limits for different categories.",
      action: () => navigate('/budgets')
    },
    {
      question: "How do I enable notifications?",
      answer: "Visit Settings → Notifications to configure email and budget alerts.",
      action: () => navigate('/settings?tab=notifications')
    },
    {
      question: "How do I export my data?",
      answer: "Go to Settings → Data & Storage to download your financial records.",
      action: handleExportData
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl">
              <HelpCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-4 animate-gradient">
            Help & Support Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Get the help you need to make the most of Smart Financial Tracker.
            Find answers, explore features, or reach out to our support team.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, guides, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 dark:text-green-300">
                  All Systems Operational
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Application running smoothly • Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {supportFeatures.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-[1.02]"
              >
                {/* Card Header */}
                <div className={`relative p-6 bg-gradient-to-br ${section.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => {
                      const ItemIcon = item.icon || ArrowRight;
                      return (
                        <li key={itemIndex}>
                          <button 
                            onClick={item.action}
                            className={`flex items-start gap-3 w-full text-left p-3 rounded-lg ${section.hoverColor} transition-all group/item`}
                          >
                            <ItemIcon className={`w-5 h-5 ${section.textColor} mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.description}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 opacity-0 group-hover/item:opacity-100 transition-all flex-shrink-0" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              const colors = {
                blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
                green: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
                purple: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800',
                orange: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800'
              };
              const iconColors = {
                blue: 'text-blue-600 dark:text-blue-400',
                green: 'text-green-600 dark:text-green-400',
                purple: 'text-purple-600 dark:text-purple-400',
                orange: 'text-orange-600 dark:text-orange-400'
              };
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`flex flex-col items-center gap-4 p-6 rounded-xl transition-all duration-300 border ${colors[action.color]} group hover:scale-105 hover:shadow-lg`}
                >
                  <div className={`w-12 h-12 ${colors[action.color].split(' ')[0]} rounded-xl flex items-center justify-center border ${colors[action.color].split('border-')[1]} group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`w-6 h-6 ${iconColors[action.color]}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <ExternalLink className={`w-4 h-4 ${iconColors[action.color]} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Common Questions */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Common Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonQuestions.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all text-left group border border-gray-200 dark:border-gray-700"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.question}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-500 dark:via-purple-500 dark:to-blue-500 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative">
            <h3 className="text-3xl font-bold text-white mb-3">
              Still need help?
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Our support team is ready to assist you. Get personalized help within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setCurrentView('email-support')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Email Support Team
              </button>
              <button 
                onClick={handleBugReport}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-semibold border-2 border-white/30 hover:border-white/50"
              >
                <Bug className="w-5 h-5" />
                Report a Bug
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;