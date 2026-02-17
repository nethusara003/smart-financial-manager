import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  DollarSign, 
  TrendingUp, 
  Edit2, 
  Trash2,
  PieChart,
  Percent,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const BudgetGroup = ({ 
  parentBudget, 
  childBudgets = [], 
  formatCurrency, 
  onEditChild, 
  onDeleteChild,
  categoryIcons,
  categoryColors 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate total spending across all child budgets
  const totalSpent = childBudgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const totalLimit = parentBudget.limit;
  const spentPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const statusColor = getStatusColor(spentPercentage);
  const colorClasses = categoryColors[statusColor] || categoryColors.primary;

  return (
    <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong overflow-hidden">
      {/* Parent Budget Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-start gap-4 flex-1">
            {/* Expand/Collapse Icon */}
            <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.border} border transition-transform ${isExpanded ? 'rotate-0' : ''}`}>
              {isExpanded ? (
                <ChevronDown className={`w-6 h-6 ${colorClasses.text}`} />
              ) : (
                <ChevronRight className={`w-6 h-6 ${colorClasses.text}`} />
              )}
            </div>

            {/* Budget Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {parentBudget.category}
                </h3>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                  {childBudgets.length} Categories
                </span>
              </div>
              
              {/* Metadata */}
              {parentBudget.groupMetadata && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {parentBudget.groupMetadata.monthlyIncome && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>Income: {formatCurrency(parentBudget.groupMetadata.monthlyIncome)}</span>
                    </div>
                  )}
                  {parentBudget.groupMetadata.savingsRate && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>Savings: {parentBudget.groupMetadata.savingsRate}</span>
                    </div>
                  )}
                  {parentBudget.groupMetadata.allocation && (
                    <div className="flex items-center gap-1.5">
                      <PieChart className="w-4 h-4" />
                      <span>
                        {parentBudget.groupMetadata.allocation.essentials} Essential | {parentBudget.groupMetadata.allocation.discretionary} Discretionary
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalSpent)} spent
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(totalLimit)} limit
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      spentPercentage >= 100 ? 'bg-red-500' :
                      spentPercentage >= 90 ? 'bg-red-400' :
                      spentPercentage >= 80 ? 'bg-yellow-400' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${
                    spentPercentage >= 100 ? 'text-red-600 dark:text-red-400' :
                    spentPercentage >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {spentPercentage.toFixed(1)}% used
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalLimit - totalSpent)} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Status Icon */}
          <div className={`p-3 rounded-xl ${colorClasses.bg}`}>
            {spentPercentage >= 80 ? (
              <AlertCircle className={`w-6 h-6 ${colorClasses.text}`} />
            ) : (
              <CheckCircle2 className={`w-6 h-6 ${colorClasses.text}`} />
            )}
          </div>
        </div>
      </div>

      {/* Child Budgets (Expandable) */}
      {isExpanded && childBudgets.length > 0 && (
        <div className="border-t border-light-border-default dark:border-dark-border-strong bg-gray-50 dark:bg-dark-surface-secondary">
          <div className="p-6 space-y-3">
            {childBudgets.map((budget) => {
              const spent = budget.spent || 0;
              const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const IconComponent = categoryIcons[budget.icon] || categoryIcons.DollarSign;
              const budgetColor = categoryColors[budget.color] || categoryColors.primary;

              return (
                <div 
                  key={budget._id}
                  className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 border border-light-border-default dark:border-dark-border-default hover:shadow-md dark:hover:shadow-glow-blue transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left - Icon and Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2.5 rounded-lg ${budgetColor.bg} ${budgetColor.border} border`}>
                        <IconComponent className={`w-5 h-5 ${budgetColor.text}`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {budget.category}
                        </h4>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>{formatCurrency(spent)}</span>
                            <span>{formatCurrency(budget.limit)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                percentage >= 100 ? 'bg-red-500' :
                                percentage >= 90 ? 'bg-red-400' :
                                percentage >= 80 ? 'bg-yellow-400' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${
                              percentage >= 100 ? 'text-red-600 dark:text-red-400' :
                              percentage >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {percentage.toFixed(0)}%
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatCurrency(budget.limit - spent)} left
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditChild(budget);
                        }}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                        title="Edit budget"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChild(budget);
                        }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        title="Delete budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetGroup;
