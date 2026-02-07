import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Keyboard, 
  Search,
  PlusCircle,
  Download,
  Filter,
  Eye,
  Copy,
  Zap,
  Command
} from 'lucide-react';

const QuickTipsPage = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const shortcuts = [
    {
      category: 'general',
      title: 'General Navigation',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Open search/command palette', icon: Search },
        { keys: ['?'], description: 'Show help panel', icon: Keyboard },
        { keys: ['Esc'], description: 'Close modal or panel', icon: Eye },
        { keys: ['Ctrl', '/'], description: 'Toggle sidebar', icon: Filter }
      ]
    },
    {
      category: 'transactions',
      title: 'Transaction Management',
      items: [
        { keys: ['Ctrl', 'N'], description: 'Add new transaction', icon: PlusCircle },
        { keys: ['Ctrl', 'E'], description: 'Export transactions', icon: Download },
        { keys: ['Ctrl', 'F'], description: 'Filter transactions', icon: Filter },
        { keys: ['Ctrl', 'D'], description: 'Duplicate transaction', icon: Copy }
      ]
    },
    {
      category: 'productivity',
      title: 'Productivity Boosts',
      items: [
        { keys: ['Tab'], description: 'Navigate between form fields', icon: Keyboard },
        { keys: ['Enter'], description: 'Submit forms quickly', icon: Zap },
        { keys: ['Ctrl', 'Z'], description: 'Undo last action', icon: Command },
        { keys: ['Ctrl', 'S'], description: 'Quick save', icon: Download }
      ]
    }
  ];

  const productivityTips = [
    {
      icon: Search,
      title: "Use Smart Search",
      description: "Press Ctrl+K to instantly search transactions, goals, or navigate to any page.",
      color: "from-purple-500 to-purple-600 dark:from-gold-500 dark:to-gold-600"
    },
    {
      icon: Filter,
      title: "Master Filters",
      description: "Use date ranges and category filters to quickly find what you're looking for.",
      color: "from-success-500 to-success-600"
    },
    {
      icon: PlusCircle,
      title: "Quick Add",
      description: "Use Ctrl+N from anywhere to add a transaction without losing your place.",
      color: "from-warning-500 to-warning-600"
    },
    {
      icon: Download,
      title: "Regular Exports",
      description: "Set up weekly exports to keep backups of your financial data.",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Shortcuts' },
    { value: 'general', label: 'General' },
    { value: 'transactions', label: 'Transactions' },
    { value: 'productivity', label: 'Productivity' }
  ];

  const filteredShortcuts = selectedCategory === 'all' 
    ? shortcuts 
    : shortcuts.filter(section => section.category === selectedCategory);

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
          
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600/90 dark:to-purple-700 rounded-2xl p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Quick Tips & Shortcuts</h1>
                  <p className="text-white/90 text-lg">Maximize your productivity with keyboard shortcuts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-4 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-purple-500 dark:bg-gold-500 text-white shadow-md dark:shadow-glow-gold'
                      : 'bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-secondary dark:text-dark-text-secondary hover:bg-purple-50 dark:hover:bg-gold-500/10'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="grid gap-8 mb-8">
          {filteredShortcuts.map((section, index) => (
            <div
              key={index}
              className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong"
            >
              <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                {section.title}
              </h3>
              <div className="grid gap-3">
                {section.items.map((shortcut, shortcutIndex) => (
                  <div
                    key={shortcutIndex}
                    className="flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <shortcut.icon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                      <span className="text-light-text-primary dark:text-dark-text-primary">
                        {shortcut.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && <span className="text-light-text-tertiary dark:text-dark-text-tertiary mx-1">+</span>}
                          <kbd className="px-2 py-1 bg-light-surface-primary dark:bg-dark-surface-primary border border-light-border-default dark:border-dark-border-default rounded text-light-text-primary dark:text-dark-text-primary font-mono text-sm shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Productivity Tips */}
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Productivity Boosters
          </h2>
          {productivityTips.map((tip, index) => (
            <div
              key={index}
              className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated"
            >
              <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${tip.color} p-3 rounded-xl shadow-lg`}>
                  <tip.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickTipsPage;