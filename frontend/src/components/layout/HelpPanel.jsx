import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  HelpCircle,
  BookOpen,
  Mail,
  ExternalLink,
  Receipt,
  Target,
  CalendarClock,
  ShieldCheck,
  ArrowUpRight,
  LifeBuoy,
  Clock3,
  BadgeCheck,
} from 'lucide-react';
import { Overlay } from '../ui';
import GettingStartedPage from '../../pages/help/GettingStartedPage';
import QuickTipsPage from '../../pages/help/QuickTipsPage';
import DocumentationPage from '../../pages/help/DocumentationPage';
import EmailSupportPage from '../../pages/help/EmailSupportPage';
import HelpCenterPage from '../../pages/help/HelpCenterPage';

const HelpPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(null);
  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  if (!isOpen && !currentPage) return null;

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const openRoute = (path) => {
    setCurrentPage(null);
    onClose?.();
    navigate(path);
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
    return <HelpCenterPage onBack={handleBack} onNavigate={openRoute} />;
  }

  const helpTopics = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Set up your first accounts, transactions, and budget workflow in minutes.',
      badge: 'Beginner',
      color: 'text-blue-600 dark:text-blue-300',
      action: () => handleNavigation('getting-started')
    },
    {
      icon: Receipt,
      title: 'Transactions & Reports',
      description: 'Track expenses, review categories, and open detailed reporting views.',
      badge: 'Core',
      color: 'text-cyan-600 dark:text-cyan-300',
      action: () => openRoute('/transactions')
    },
    {
      icon: Target,
      title: 'Budgets, Goals & Forecast',
      description: 'Control spending limits and compare progress with future projections.',
      badge: 'Planning',
      color: 'text-emerald-600 dark:text-emerald-300',
      action: () => openRoute('/budgets')
    },
    {
      icon: CalendarClock,
      title: 'Bills, Recurring & Loans',
      description: 'Manage due dates, recurring payments, loan tracking, and transfers.',
      badge: 'Operations',
      color: 'text-amber-600 dark:text-amber-300',
      action: () => openRoute('/bills-reminders')
    },
    {
      icon: ShieldCheck,
      title: 'Security & Preferences',
      description: 'Update privacy, notification, and session timeout settings securely.',
      badge: 'Safety',
      color: 'text-indigo-600 dark:text-indigo-300',
      action: () => openRoute('/settings?tab=privacy')
    },
    {
      icon: LifeBuoy,
      title: 'Documentation',
      description: 'Explore complete guides, feature docs, and implementation references.',
      badge: 'Deep Dive',
      color: 'text-violet-600 dark:text-violet-300',
      action: () => handleNavigation('documentation')
    }
  ];

  const quickActions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@smartfinance.com • Typical response within 24 hours',
      actionLabel: 'Contact Team',
      onClick: () => handleNavigation('email-support')
    },
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Guided troubleshooting and frequently asked questions',
      actionLabel: 'Open Center',
      onClick: () => handleNavigation('help-center')
    },
    {
      icon: BookOpen,
      title: 'Quick Productivity Tips',
      description: 'Best practices to keep your financial workflows fast and organized',
      actionLabel: 'View Tips',
      onClick: () => handleNavigation('quick-tips')
    }
  ];

  const faqs = [
    {
      question: 'How do I start tracking monthly spending quickly?',
      answer: 'Open Budgets to set category limits, then add daily entries in Transactions to monitor real-time progress.',
      cta: 'Open Budgets',
      action: () => openRoute('/budgets')
    },
    {
      question: 'Where can I configure reminders for upcoming payments?',
      answer: 'Use Bills & Reminders for due-date alerts and Recurring to automate repeated income or expense entries.',
      cta: 'Open Bills & Reminders',
      action: () => openRoute('/bills-reminders')
    },
    {
      question: 'How can I securely manage account and session settings?',
      answer: 'Open Settings > Privacy to update session timeout and security preferences for your account.',
      cta: 'Open Privacy Settings',
      action: () => openRoute('/settings?tab=privacy')
    },
    {
      question: 'Is there a fast way to open help from anywhere?',
      answer: 'Press ? from any non-input screen to open this Help panel instantly.',
      cta: 'View Quick Tips',
      action: () => handleNavigation('quick-tips')
    }
  ];

  const guidedWorkflows = [
    {
      title: 'Set up a monthly budget plan',
      summary: 'Create limits you can track daily without spreadsheet work.',
      steps: [
        'Open Budgets and create category limits for essentials, lifestyle, and savings.',
        'Use realistic limits based on your last month of transactions.',
        'Review budget utilization weekly and adjust only one category at a time.'
      ],
      actionLabel: 'Start in Budgets',
      action: () => openRoute('/budgets')
    },
    {
      title: 'Control recurring payments and due dates',
      summary: 'Reduce missed payments and improve cash-flow visibility.',
      steps: [
        'Add due-date reminders in Bills & Reminders for fixed obligations.',
        'Create recurring entries for salary, subscriptions, and utilities.',
        'Check Loans weekly to verify EMI status and payoff direction.'
      ],
      actionLabel: 'Open Bills & Reminders',
      action: () => openRoute('/bills-reminders')
    },
    {
      title: 'Get actionable spending insights',
      summary: 'Move from raw transactions to decision-ready insights.',
      steps: [
        'Categorize transactions consistently before reviewing analytics.',
        'Use Reports to compare this month against previous periods.',
        'Open Forecast to validate if current patterns support your goals.'
      ],
      actionLabel: 'Review Analytics',
      action: () => openRoute('/analytics')
    }
  ];

  const troubleshootingGuides = [
    {
      issue: 'Budget progress looks inaccurate',
      fix: 'Verify transaction categories first, then check that current-month entries are using the expected dates.',
      actionLabel: 'Open Transactions',
      action: () => openRoute('/transactions')
    },
    {
      issue: 'Not receiving reminder alerts',
      fix: 'Confirm notification preferences and ensure reminders are enabled for the relevant bill categories.',
      actionLabel: 'Notification Settings',
      action: () => openRoute('/settings?tab=notifications')
    },
    {
      issue: 'Session logs out too quickly',
      fix: 'Update session timeout under privacy settings to match your usage while keeping security best practices.',
      actionLabel: 'Privacy Settings',
      action: () => openRoute('/settings?tab=privacy')
    }
  ];

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      containerClassName="items-start justify-end pt-20 px-4 lg:pl-72 lg:pr-6"
      backdropClassName="bg-slate-900/30 backdrop-blur-sm"
      panelClassName="max-w-5xl"
      ariaLabelledBy="help-panel-title"
    >
      <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/95 dark:ring-white/10 animate-slide-in-down">
        <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl dark:bg-blue-500/10" />

        <div className="relative border-b border-slate-200/70 px-6 py-6 dark:border-slate-700/60 lg:px-7 lg:py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-200/60 bg-blue-50 p-2.5 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10">
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 id="help-panel-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Help & Support
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Updated guidance for your latest dashboard, planning, and account tools.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Coverage: Dashboard, Budgets, Loans, Transfers
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Clock3 className="h-3.5 w-3.5 text-blue-500" />
                    Support response: under 24h
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Last content refresh: {lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Close help panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative max-h-[calc(100vh-11rem)] overflow-y-auto px-6 pb-6 pt-5 lg:px-7 lg:pb-7">
          <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Browse Topics
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">Choose a guided path</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
              {helpTopics.map((topic, index) => {
                const IconComponent = topic.icon;
                return (
                  <button
                    key={index}
                    onClick={topic.action}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-400/60"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="rounded-lg bg-slate-100 p-2.5 dark:bg-slate-700/80">
                        <IconComponent className={`h-4 w-4 ${topic.color}`} />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {topic.badge}
                      </span>
                    </div>

                    <h5 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {topic.title}
                    </h5>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {topic.description}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-300 dark:group-hover:text-blue-200">
                      Open topic
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <h5 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Quick Access</h5>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-800">
                    <span>Open help panel instantly</span>
                    <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-slate-700 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      ?
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-800">
                    <span>Change account currency</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Topbar Currency Selector</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-800">
                    <span>Manage alerts</span>
                    <button
                      onClick={() => openRoute('/settings?tab=notifications')}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Open Notifications
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <h5 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Guided Workflows</h5>
                <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">
                  Follow these practical sequences to get reliable results faster.
                </p>

                <div className="space-y-3">
                  {guidedWorkflows.map((guide, index) => (
                    <div key={index} className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                      <h6 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{guide.title}</h6>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{guide.summary}</p>

                      <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-700 dark:text-slate-300">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>

                      <button
                        onClick={guide.action}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        {guide.actionLabel}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                Contact & Guidance
              </h4>

              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="group w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-400/50"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-500/10">
                          <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-300">
                          {action.actionLabel}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <h5 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{action.title}</h5>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{action.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-500/30 dark:from-blue-500/10 dark:to-cyan-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Need guided help?</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  Our support team can review account setup, budgeting flows, and reporting issues.
                </p>
                <button
                  onClick={() => handleNavigation('email-support')}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-200 dark:hover:text-blue-100"
                >
                  Start support request
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <h5 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Troubleshooting</h5>
                <div className="space-y-3">
                  {troubleshootingGuides.map((item, index) => (
                    <div key={index} className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.issue}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.fix}</p>
                      <button
                        onClick={item.action}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        {item.actionLabel}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">
              Frequently Asked Questions
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 transition-colors duration-200 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700/70">
                    <span>{faq.question}</span>
                    <svg
                      className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180 dark:text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="space-y-3 bg-slate-50 px-4 pb-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                    <p>{faq.answer}</p>
                    <button
                      onClick={faq.action}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {faq.cta}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 bg-slate-50/70 p-4 text-center text-xs text-slate-600 dark:border-slate-700/70 dark:bg-slate-800/50 dark:text-slate-300">
          <p>
            Still need help?{' '}
            <button 
              onClick={() => handleNavigation('help-center')}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline dark:text-blue-300 dark:hover:text-blue-200"
            >
              Visit our Help Center
              <ExternalLink className="h-3 w-3" />
            </button>
          </p>
        </div>
      </div>
    </Overlay>
  );
};

export default HelpPanel;
