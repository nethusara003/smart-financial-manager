import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, TrendingDown, Calculator, Sparkles } from 'lucide-react';
import Loans from './Loans';
import LoanComparison from './LoanComparison';
import RefinancingCalculator from '../components/loans/RefinancingCalculator';
import DebtPayoffWizard from '../components/loans/DebtPayoffWizard';

const LoansHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get('tab') || 'my-loans';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const tabs = [
    {
      id: 'my-loans',
      label: 'My Loans & EMI',
      icon: CreditCard,
      description: 'Manage your loans and track EMI payments'
    },
    {
      id: 'compare',
      label: 'Compare Loans',
      icon: TrendingDown,
      description: 'Compare multiple loan offers side by side'
    },
    {
      id: 'refinancing',
      label: 'Refinancing Calculator',
      icon: Calculator,
      description: 'Evaluate if refinancing makes sense'
    },
    {
      id: 'payoff-wizard',
      label: 'Debt Payoff Wizard',
      icon: Sparkles,
      description: 'Find the best debt payoff strategy'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'my-loans':
        return <Loans hideHeader={true} />;
      case 'compare':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <LoanComparison />
          </div>
        );
      case 'refinancing':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <RefinancingCalculator />
          </div>
        );
      case 'payoff-wizard':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <DebtPayoffWizard />
          </div>
        );
      default:
        return <Loans hideHeader={true} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Title */}
          <div className="py-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Loans & Financial Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive loan management and planning tools
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    {isActive && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                        {tab.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default LoansHub;
