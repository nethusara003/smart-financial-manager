import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, TrendingDown, Calculator, Sparkles, Plus, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Loans from './Loans';
import LoanComparison from './LoanComparison';
import RefinancingCalculator from '../components/loans/RefinancingCalculator';
import DebtPayoffWizard from '../components/loans/DebtPayoffWizard';
import * as loanAPI from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { getStoredAuthSnapshot } from '../utils/authStorage';
import SystemPageHeader from '../components/layout/SystemPageHeader';

const LoansHub = () => {
  const { formatCurrency } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'my-loans';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [openAddSignal, setOpenAddSignal] = useState(0);
  const [openExportSignal, setOpenExportSignal] = useState(0);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { isGuest } = getStoredAuthSnapshot();
        if (isGuest) {
          setSummary({});
          return;
        }

        const response = await loanAPI.getLoans({});
        setSummary(response.summary || {});
      } catch {
        setSummary({});
      }
    };

    loadSummary();
  }, [activeTab]);

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
        return (
          <Loans
            openAddSignal={openAddSignal}
            openExportSignal={openExportSignal}
            onSummaryChange={setSummary}
          />
        );
      case 'compare':
        return <LoanComparison />;
      case 'refinancing':
        return <RefinancingCalculator />;
      case 'payoff-wizard':
        return <DebtPayoffWizard />;
      default:
        return (
          <Loans
            openAddSignal={openAddSignal}
            openExportSignal={openExportSignal}
            onSummaryChange={setSummary}
          />
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SystemPageHeader
        tagline="DETERMINISTIC DEBT CONTROL"
        title="Loans"
        subtitle="Deterministic Debt Control Matrix"
        actions={activeTab === 'my-loans' ? (
          <>
            <button
              type="button"
              onClick={() => setOpenExportSignal((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-light-border-default dark:border-white/10 bg-light-surface-primary dark:bg-white/5 px-4 py-2 text-sm font-semibold text-light-text-primary dark:text-white transition hover:bg-light-bg-accent dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Export Loans
            </button>
            <button
              type="button"
              onClick={() => setOpenAddSignal((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-light-border-default dark:border-white/10 bg-light-surface-primary dark:bg-white/5 px-4 py-2 text-sm font-semibold text-light-text-primary dark:text-white transition hover:bg-light-bg-accent dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Add Loan
            </button>
          </>
        ) : null}
      />

      <section className="rounded-xl border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] p-3 shadow-premium dark:shadow-card-dark">
        <div className="flex overflow-x-auto gap-2 custom-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/80 text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                    : 'bg-light-bg-accent text-light-text-secondary hover:bg-light-bg-hover dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] p-4 shadow-premium dark:shadow-card-dark">
        <div className="flex flex-wrap gap-3 xl:flex-nowrap">
          <div className="flex h-[88px] min-w-[170px] flex-1 items-center justify-between rounded-xl border border-light-border-default dark:border-white/10 bg-light-surface-primary dark:bg-white/[0.03] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-slate-300">Total Loans</p>
              <p className="mt-1 text-lg font-bold text-light-text-primary dark:text-white">{summary.totalLoans || 0}</p>
              <p className="text-xs text-light-text-tertiary dark:text-slate-400">{summary.activeLoans || 0} active</p>
            </div>
            <DollarSign className="h-4 w-4 text-slate-200" />
          </div>

          <div className="flex h-[88px] min-w-[200px] flex-1 items-center justify-between rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 shadow-[0_0_20px_rgba(244,63,94,0.16)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">Monthly EMI</p>
              <p className="mt-1 text-lg font-bold text-white">{formatCurrency(summary.totalMonthlyEmi || 0)}</p>
              <p className="text-xs text-rose-100/80">per month</p>
            </div>
            <Calendar className="h-4 w-4 text-rose-200" />
          </div>

          <div className="flex h-[88px] min-w-[200px] flex-1 items-center justify-between rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 shadow-[0_0_20px_rgba(244,63,94,0.16)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">Outstanding</p>
              <p className="mt-1 text-lg font-bold text-white">{formatCurrency(summary.totalOutstanding || 0)}</p>
              <p className="text-xs text-rose-100/80">remaining</p>
            </div>
            <TrendingUp className="h-4 w-4 text-rose-200" />
          </div>

          <div className="flex h-[88px] min-w-[200px] flex-1 items-center justify-between rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 shadow-[0_0_20px_rgba(59,130,246,0.16)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Total Borrowed</p>
              <p className="mt-1 text-lg font-bold text-white">{formatCurrency(summary.totalBorrowed || 0)}</p>
              <p className="text-xs text-blue-100/80">lifetime</p>
            </div>
            <CreditCard className="h-4 w-4 text-blue-200" />
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default LoansHub;
