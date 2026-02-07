import React from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  DollarSign, 
  PlusCircle, 
  Target,
  BarChart3,
  Settings,
  CreditCard,
  Users,
  Shield,
  Lightbulb
} from 'lucide-react';

const GettingStartedPage = ({ onBack }) => {
  const steps = [
    {
      icon: PlusCircle,
      title: "1. Add Your First Transaction",
      description: "Start by recording your income and expenses to get a clear picture of your finances.",
      details: [
        "Navigate to the Transactions page",
        "Click the '+ Add Transaction' button",
        "Choose income or expense type",
        "Enter amount, category, and description",
        "Set the transaction date"
      ],
      color: "from-purple-500 to-purple-600 dark:from-gold-500 dark:to-gold-600"
    },
    {
      icon: Target,
      title: "2. Set Up Financial Goals",
      description: "Create savings goals to stay motivated and track your progress.",
      details: [
        "Go to the Goals page",
        "Click 'Add Goal' to create new goals",
        "Set target amounts and deadlines",
        "Track progress with visual indicators",
        "Add contributions regularly"
      ],
      color: "from-success-500 to-success-600"
    },
    {
      icon: BarChart3,
      title: "3. Monitor Your Budget",
      description: "Create budgets to control spending and achieve financial discipline.",
      details: [
        "Visit the Budgets page",
        "Set spending limits by category",
        "Monitor budget vs actual spending",
        "Receive warnings when approaching limits",
        "Adjust budgets as needed"
      ],
      color: "from-warning-500 to-warning-600"
    },
    {
      icon: Settings,
      title: "4. Customize Your Experience",
      description: "Personalize the app to match your preferences and workflow.",
      details: [
        "Access Settings from the user menu",
        "Choose your preferred currency",
        "Set up notification preferences",
        "Customize dashboard layout",
        "Configure security settings"
      ],
      color: "from-purple-500 to-purple-600"
    }
  ];

  const tips = [
    "Use categories consistently to get better insights",
    "Set realistic goals that motivate rather than discourage",
    "Review your finances weekly for better control",
    "Take advantage of the analytics to spot trends",
    "Export data regularly as backup"
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
          
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 dark:from-gold-500/90 dark:to-gold-600 rounded-2xl p-8 shadow-2xl dark:shadow-glow-gold">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Getting Started</h1>
                  <p className="text-white/90 text-lg">Your journey to financial success begins here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid gap-8 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated"
            >
              <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${step.color} p-3 rounded-xl shadow-lg`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-gold-400 rounded-full"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-warning-500" />
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Pro Tips for Success
            </h2>
          </div>
          <div className="grid gap-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-light-surface-primary dark:bg-dark-surface-primary rounded-lg">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedPage;