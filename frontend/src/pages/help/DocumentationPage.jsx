import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Search,
  ChevronRight,
  Book,
  CreditCard,
  Target,
  BarChart3,
  Settings,
  Shield,
  DollarSign,
  Users
} from 'lucide-react';

const DocumentationPage = ({ onBack }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const documentation = [
    {
      id: 'transactions',
      icon: CreditCard,
      title: 'Transaction Management',
      color: 'from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600',
      description: 'Complete guide to managing your income and expenses',
      sections: [
        {
          title: 'Adding Transactions',
          content: `
            <h3>Creating New Transactions</h3>
            <p>Transactions are the foundation of your financial tracking. Follow these steps:</p>
            <ol>
              <li>Navigate to the Transactions page from the sidebar</li>
              <li>Click the "+ Add Transaction" button in the top right</li>
              <li>Select transaction type (Income or Expense)</li>
              <li>Choose the appropriate category</li>
              <li>Enter the amount and description</li>
              <li>Set the transaction date</li>
              <li>Click "Add Transaction" to save</li>
            </ol>
            
            <h3>Transaction Categories</h3>
            <p>Use consistent categories for better insights:</p>
            <ul>
              <li><strong>Income:</strong> Salary, Freelance, Investment Returns, Gifts</li>
              <li><strong>Expenses:</strong> Food, Transportation, Housing, Entertainment, Healthcare</li>
            </ul>
            
            <h3>Best Practices</h3>
            <ul>
              <li>Record transactions immediately when possible</li>
              <li>Use descriptive notes for future reference</li>
              <li>Review and categorize regularly</li>
              <li>Take photos of receipts for record keeping</li>
            </ul>
          `
        },
        {
          title: 'Editing & Deleting',
          content: `
            <h3>Modifying Transactions</h3>
            <p>To edit an existing transaction:</p>
            <ol>
              <li>Find the transaction in your list</li>
              <li>Click the edit icon (pencil) next to the transaction</li>
              <li>Update the fields as needed</li>
              <li>Click "Save Changes" to confirm</li>
            </ol>
            
            <h3>Bulk Operations</h3>
            <p>For multiple transactions:</p>
            <ul>
              <li>Use checkboxes to select multiple transactions</li>
              <li>Choose bulk actions from the toolbar</li>
              <li>Confirm the operation</li>
            </ul>
            
            <h3>Deletion Safety</h3>
            <p>Deleted transactions cannot be recovered. Always:</p>
            <ul>
              <li>Double-check before deleting</li>
              <li>Export data regularly as backup</li>
              <li>Consider archiving instead of deleting</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'goals',
      icon: Target,
      title: 'Financial Goals',
      color: 'from-success-500 to-success-600',
      description: 'Set, track, and achieve your financial objectives',
      sections: [
        {
          title: 'Creating Goals',
          content: `
            <h3>Setting Up Financial Goals</h3>
            <p>Goals help you stay motivated and track progress toward financial milestones:</p>
            <ol>
              <li>Go to the Goals page</li>
              <li>Click "Add Goal" button</li>
              <li>Enter goal name and description</li>
              <li>Set target amount</li>
              <li>Choose target date</li>
              <li>Select goal category and priority</li>
              <li>Save your goal</li>
            </ol>
            
            <h3>Goal Categories</h3>
            <ul>
              <li><strong>Emergency Fund:</strong> 3-6 months of expenses</li>
              <li><strong>Savings:</strong> General savings targets</li>
              <li><strong>Investment:</strong> Long-term wealth building</li>
              <li><strong>Debt Payoff:</strong> Eliminating debt</li>
              <li><strong>Purchase:</strong> Specific items or experiences</li>
            </ul>
            
            <h3>SMART Goals Framework</h3>
            <p>Make your goals:</p>
            <ul>
              <li><strong>Specific:</strong> Clear and well-defined</li>
              <li><strong>Measurable:</strong> Quantifiable targets</li>
              <li><strong>Achievable:</strong> Realistic and attainable</li>
              <li><strong>Relevant:</strong> Aligned with your priorities</li>
              <li><strong>Time-bound:</strong> Have clear deadlines</li>
            </ul>
          `
        },
        {
          title: 'Tracking Progress',
          content: `
            <h3>Monitoring Goal Progress</h3>
            <p>Regular tracking keeps you on course:</p>
            <ul>
              <li>View progress bars and percentages</li>
              <li>Add contributions regularly</li>
              <li>Review milestone achievements</li>
              <li>Adjust targets if needed</li>
            </ul>
            
            <h3>Adding Contributions</h3>
            <p>To add money to a goal:</p>
            <ol>
              <li>Find your goal on the Goals page</li>
              <li>Click "Add Contribution"</li>
              <li>Enter the contribution amount</li>
              <li>Confirm the addition</li>
            </ol>
            
            <h3>Goal Analytics</h3>
            <p>Use insights to optimize your approach:</p>
            <ul>
              <li>Track contribution frequency</li>
              <li>Monitor progress velocity</li>
              <li>Identify seasonal patterns</li>
              <li>Adjust strategies based on data</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'budgets',
      icon: BarChart3,
      title: 'Budget Management',
      color: 'from-warning-500 to-warning-600',
      description: 'Control spending with smart budgeting tools',
      sections: [
        {
          title: 'Creating Budgets',
          content: `
            <h3>Setting Up Your Budget</h3>
            <p>Budgets help control spending and achieve financial discipline:</p>
            <ol>
              <li>Navigate to the Budgets page</li>
              <li>Click "Create Budget" for a category</li>
              <li>Set monthly spending limit</li>
              <li>Choose budget period (monthly/yearly)</li>
              <li>Set alert thresholds (e.g., 80% of budget)</li>
              <li>Save the budget</li>
            </ol>
            
            <h3>Budget Categories</h3>
            <p>Common budget categories include:</p>
            <ul>
              <li><strong>Fixed Expenses:</strong> Rent, Insurance, Subscriptions</li>
              <li><strong>Variable Expenses:</strong> Food, Transportation, Entertainment</li>
              <li><strong>Savings:</strong> Emergency fund, Investments</li>
              <li><strong>Debt Payments:</strong> Credit cards, Loans</li>
            </ul>
            
            <h3>50/30/20 Rule</h3>
            <p>A popular budgeting framework:</p>
            <ul>
              <li><strong>50%:</strong> Needs (housing, utilities, groceries)</li>
              <li><strong>30%:</strong> Wants (entertainment, dining out)</li>
              <li><strong>20%:</strong> Savings and debt repayment</li>
            </ul>
          `
        },
        {
          title: 'Budget Monitoring',
          content: `
            <h3>Tracking Budget Performance</h3>
            <p>Regular monitoring prevents overspending:</p>
            <ul>
              <li>Check budget vs. actual spending weekly</li>
              <li>Review alert notifications</li>
              <li>Identify spending patterns</li>
              <li>Adjust budgets as circumstances change</li>
            </ul>
            
            <h3>Warning System</h3>
            <p>Stay informed with automatic alerts:</p>
            <ul>
              <li><strong>Yellow Alert:</strong> 80% of budget used</li>
              <li><strong>Red Alert:</strong> Budget exceeded</li>
              <li><strong>Weekly Summary:</strong> Progress updates</li>
            </ul>
            
            <h3>Budget Optimization</h3>
            <p>Improve your budgeting over time:</p>
            <ul>
              <li>Analyze spending trends monthly</li>
              <li>Adjust unrealistic targets</li>
              <li>Find areas for cost reduction</li>
              <li>Celebrate budget achievements</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security & Privacy',
      color: 'from-danger-500 to-danger-600',
      description: 'Protect your financial data and privacy',
      sections: [
        {
          title: 'Account Security',
          content: `
            <h3>Password Security</h3>
            <p>Protect your account with strong security measures:</p>
            <ul>
              <li>Use a unique, complex password (12+ characters)</li>
              <li>Include uppercase, lowercase, numbers, and symbols</li>
              <li>Never share your password</li>
              <li>Change password regularly (every 6 months)</li>
              <li>Use a password manager for best security</li>
            </ul>
            
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security:</p>
            <ol>
              <li>Go to Settings > Security</li>
              <li>Enable Two-Factor Authentication</li>
              <li>Download an authenticator app (Google Authenticator, Authy)</li>
              <li>Scan the QR code with your app</li>
              <li>Enter the verification code</li>
              <li>Save backup codes in a secure location</li>
            </ol>
            
            <h3>Session Management</h3>
            <ul>
              <li>Log out when using public computers</li>
              <li>Review active sessions regularly</li>
              <li>Set automatic logout timeouts</li>
              <li>Monitor for suspicious activity</li>
            </ul>
          `
        },
        {
          title: 'Data Privacy',
          content: `
            <h3>Data Protection</h3>
            <p>We take your privacy seriously:</p>
            <ul>
              <li>All data is encrypted in transit and at rest</li>
              <li>We never sell or share your personal information</li>
              <li>You have full control over your data</li>
              <li>Regular security audits ensure protection</li>
            </ul>
            
            <h3>Data Export & Deletion</h3>
            <p>You own your data:</p>
            <ul>
              <li><strong>Export:</strong> Download all your data anytime</li>
              <li><strong>Backup:</strong> Regular exports recommended</li>
              <li><strong>Deletion:</strong> Request complete data removal</li>
              <li><strong>Transparency:</strong> Clear data usage policies</li>
            </ul>
            
            <h3>Privacy Controls</h3>
            <p>Customize your privacy settings:</p>
            <ul>
              <li>Control data sharing preferences</li>
              <li>Manage notification settings</li>
              <li>Set data retention periods</li>
              <li>Review privacy policy updates</li>
            </ul>
          `
        }
      ]
    }
  ];

  const filteredDocs = documentation.filter(doc => 
    searchTerm === '' || 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSectionClick = (doc, sectionIndex) => {
    setSelectedSection({ doc, sectionIndex });
  };

  if (selectedSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </button>
          
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-8 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong">
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
              {selectedSection.doc.title} - {selectedSection.doc.sections[selectedSection.sectionIndex].title}
            </h1>
            
            <div 
              className="prose prose-lg max-w-none text-light-text-secondary dark:text-dark-text-secondary"
              dangerouslySetInnerHTML={{ 
                __html: selectedSection.doc.sections[selectedSection.sectionIndex].content 
              }}
            />
          </div>
        </div>
      </div>
    );
  }

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
          
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600/90 dark:to-green-700 rounded-2xl p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Documentation</h1>
                  <p className="text-white/90 text-lg">Comprehensive guides and references</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-light-surface-primary dark:bg-dark-surface-primary border border-light-border-default dark:border-dark-border-default rounded-xl text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl p-6 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`bg-gradient-to-br ${doc.color} p-3 rounded-xl shadow-lg`}>
                  <doc.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {doc.title}
                  </h2>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {doc.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {doc.sections.map((section, sectionIndex) => (
                  <button
                    key={sectionIndex}
                    onClick={() => handleSectionClick(doc, sectionIndex)}
                    className="w-full flex items-center justify-between p-3 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors text-left"
                  >
                    <span className="text-light-text-primary dark:text-dark-text-primary font-medium">
                      {section.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;