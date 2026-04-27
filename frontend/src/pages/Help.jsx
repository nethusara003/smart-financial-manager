import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Bug,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  Mail,
  Receipt,
  Search,
  ShieldCheck,
  Target,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmailSupportPage from './help/EmailSupportPage';
import HelpCenterPage from './help/HelpCenterPage';
import GettingStartedPage from './help/GettingStartedPage';
import DocumentationPage from './help/DocumentationPage';
import QuickTipsPage from './help/QuickTipsPage';

const Help = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  // Render sub-pages based on currentView
  if (currentView === 'email-support') {
    return <EmailSupportPage onBack={() => setCurrentView('main')} />;
  }
  
  if (currentView === 'help-center') {
    return <HelpCenterPage onBack={() => setCurrentView('main')} onNavigate={(path) => navigate(path)} />;
  }
  
  if (currentView === 'getting-started') {
    return <GettingStartedPage onBack={() => setCurrentView('main')} />;
  }
  
  if (currentView === 'documentation') {
    return <DocumentationPage onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'quick-tips') {
    return <QuickTipsPage onBack={() => setCurrentView('main')} />;
  }

  const handleBugReport = () => {
    window.open('https://github.com/nethusara003/smart-financial-manager/issues/new', '_blank');
  };

  const matchesSearch = (items) => {
    if (!normalizedSearchQuery) {
      return true;
    }
    return items.some((item) => String(item).toLowerCase().includes(normalizedSearchQuery));
  };

  const helpTopics = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Set up your first accounts, transactions, and budget workflow in minutes.',
      badge: 'Beginner',
      iconColor: 'text-blue-600 dark:text-blue-300',
      action: () => setCurrentView('getting-started'),
      keywords: ['onboarding', 'setup', 'first steps']
    },
    {
      icon: Receipt,
      title: 'Transactions and Reports',
      description: 'Track expenses, review categories, and open detailed reporting views.',
      badge: 'Core',
      iconColor: 'text-cyan-600 dark:text-cyan-300',
      action: () => navigate('/transactions'),
      keywords: ['transactions', 'reports', 'cashflow', 'history']
    },
    {
      icon: Target,
      title: 'Budgets, Goals and Forecast',
      description: 'Control spending limits and compare progress with future projections.',
      badge: 'Planning',
      iconColor: 'text-emerald-600 dark:text-emerald-300',
      action: () => navigate('/budgets'),
      keywords: ['budgets', 'goals', 'forecast', 'planning']
    }
  ];

  helpTopics.push(
    {
      icon: CalendarClock,
      title: 'Bills, Recurring and Loans',
      description: 'Manage due dates, recurring payments, loan tracking, and transfers.',
      badge: 'Operations',
      iconColor: 'text-amber-600 dark:text-amber-300',
      action: () => navigate('/bills-reminders'),
      keywords: ['bills', 'reminders', 'loans', 'transfers', 'recurring']
    },
    {
      icon: ShieldCheck,
      title: 'Security and Preferences',
      description: 'Update privacy, notification, and session timeout settings securely.',
      badge: 'Safety',
      iconColor: 'text-indigo-600 dark:text-indigo-300',
      action: () => navigate('/settings?tab=privacy'),
      keywords: ['security', 'privacy', 'session', 'notifications']
    },
    {
      icon: LifeBuoy,
      title: 'Documentation',
      description: 'Explore complete guides, feature docs, and implementation references.',
      badge: 'Deep Dive',
      iconColor: 'text-violet-600 dark:text-violet-300',
      action: () => setCurrentView('documentation'),
      keywords: ['docs', 'documentation', 'reference']
    },
    {
      icon: BookOpen,
      title: 'Quick Productivity Tips',
      description: 'Learn efficient workflows to manage finances faster and cleaner.',
      badge: 'Efficiency',
      iconColor: 'text-blue-500 dark:text-blue-300',
      action: () => setCurrentView('quick-tips'),
      keywords: ['tips', 'productivity', 'workflow']
    }
  );

  const contactGuidance = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@smartfinance.com - Typical response within 24 hours',
      actionLabel: 'Contact Team',
      action: () => setCurrentView('email-support'),
      keywords: ['support', 'email', 'contact']
    },
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Guided troubleshooting and frequently asked questions',
      actionLabel: 'Open Center',
      action: () => setCurrentView('help-center'),
      keywords: ['faq', 'help center', 'questions']
    },
    {
      icon: BookOpen,
      title: 'Quick Tips',
      description: 'Best practices to keep your financial workflows fast and organized',
      actionLabel: 'View Tips',
      action: () => setCurrentView('quick-tips'),
      keywords: ['tips', 'best practices']
    },
    {
      icon: Bug,
      title: 'Report a Bug',
      description: 'Share a bug report to help us improve reliability and UX quality',
      actionLabel: 'Open Issue',
      action: handleBugReport,
      keywords: ['bug', 'issue', 'github']
    }
  ];

  const guidedWorkflows = [
    {
      title: 'Set up a monthly budget plan',
      summary: 'Create limits you can track daily without spreadsheet work.',
      steps: [
        'Open Budgets and create category limits for essentials, lifestyle, and savings.',
        'Use realistic limits based on your previous month of transactions.',
        'Review budget utilization weekly and adjust one category at a time.'
      ],
      actionLabel: 'Start in Budgets',
      action: () => navigate('/budgets'),
      keywords: ['budget', 'monthly', 'limits', 'plan']
    },
    {
      title: 'Control recurring payments and due dates',
      summary: 'Reduce missed payments and improve cash-flow visibility.',
      steps: [
        'Add due-date reminders in Bills and Reminders for fixed obligations.',
        'Create recurring entries for salary, subscriptions, and utilities.',
        'Check Loans weekly to validate EMI status and payoff progress.'
      ],
      actionLabel: 'Open Bills and Reminders',
      action: () => navigate('/bills-reminders'),
      keywords: ['recurring', 'bills', 'loans', 'payments']
    },
    {
      title: 'Turn transactions into decision-ready insights',
      summary: 'Move from raw data to strategic financial decisions.',
      steps: [
        'Categorize transactions consistently before opening analytics.',
        'Use Reports to compare current month against previous periods.',
        'Open Forecast to verify if current behavior supports your goals.'
      ],
      actionLabel: 'Review Analytics',
      action: () => navigate('/analytics'),
      keywords: ['analytics', 'reports', 'forecast', 'insights']
    }
  ];

  const troubleshootingGuides = [
    {
      issue: 'Budget progress looks inaccurate',
      fix: 'Verify transaction categories first, then confirm current-month entries are using expected dates.',
      actionLabel: 'Open Transactions',
      action: () => navigate('/transactions'),
      keywords: ['budget', 'incorrect', 'categories']
    },
    {
      issue: 'Not receiving reminder alerts',
      fix: 'Confirm notification preferences and ensure reminders are enabled for the right bill categories.',
      actionLabel: 'Notification Settings',
      action: () => navigate('/settings?tab=notifications'),
      keywords: ['alerts', 'notifications', 'reminders']
    },
    {
      issue: 'Session logs out too quickly',
      fix: 'Update session timeout in privacy settings to match your usage while preserving account safety.',
      actionLabel: 'Privacy Settings',
      action: () => navigate('/settings?tab=privacy'),
      keywords: ['session', 'timeout', 'privacy']
    }
  ];

  const commonQuestions = [
    {
      question: 'How do I start tracking monthly spending quickly?',
      answer: 'Open Budgets to set category limits, then add daily entries in Transactions to monitor progress.',
      actionLabel: 'Open Budgets',
      action: () => navigate('/budgets'),
      keywords: ['monthly', 'spending', 'budgets']
    },
    {
      question: 'Where can I configure reminders for upcoming payments?',
      answer: 'Use Bills and Reminders for due-date alerts and Recurring for automated repeated entries.',
      actionLabel: 'Open Bills and Reminders',
      action: () => navigate('/bills-reminders'),
      keywords: ['reminders', 'payments', 'bills']
    },
    {
      question: 'How can I securely manage account and session settings?',
      answer: 'Open Settings and switch to Privacy to configure security, timeout, and protection preferences.',
      actionLabel: 'Open Privacy Settings',
      action: () => navigate('/settings?tab=privacy'),
      keywords: ['security', 'session', 'privacy']
    },
    {
      question: 'Is there a fast way to open support from anywhere?',
      answer: 'Use the topbar help icon or press ? from any non-input screen to open the support panel instantly.',
      actionLabel: 'Open Quick Tips',
      action: () => setCurrentView('quick-tips'),
      keywords: ['shortcut', 'help', 'support panel']
    }
  ];

  const filteredHelpTopics = helpTopics.filter((topic) =>
    matchesSearch([topic.title, topic.description, topic.badge, ...topic.keywords])
  );

  const filteredContactGuidance = contactGuidance.filter((item) =>
    matchesSearch([item.title, item.description, item.actionLabel, ...item.keywords])
  );

  const filteredGuidedWorkflows = guidedWorkflows.filter((workflow) =>
    matchesSearch([workflow.title, workflow.summary, ...workflow.steps, ...workflow.keywords])
  );

  const filteredTroubleshootingGuides = troubleshootingGuides.filter((item) =>
    matchesSearch([item.issue, item.fix, item.actionLabel, ...item.keywords])
  );

  const filteredCommonQuestions = commonQuestions.filter((item) =>
    matchesSearch([item.question, item.answer, item.actionLabel, ...item.keywords])
  );

  const hasFilteredResults =
    filteredHelpTopics.length > 0 ||
    filteredContactGuidance.length > 0 ||
    filteredGuidedWorkflows.length > 0 ||
    filteredTroubleshootingGuides.length > 0 ||
    filteredCommonQuestions.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/50 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40">
      <div className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/10" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 dark:ring-white/10 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-200/60 bg-blue-50 p-3 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10">
                  <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 lg:text-4xl">
                    Help and Support Center
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 lg:text-base">
                    Guidance-first support for planning, tracking, and securing your finances.
                  </p>
                </div>
              </div>

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

            <button
              onClick={() => setCurrentView('email-support')}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </button>
          </div>

          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics, workflows, troubleshooting, or FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>

        {!hasFilteredResults && normalizedSearchQuery ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No support content matched your search.</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Try simpler terms like budget, notifications, or transactions.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Clear search
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
              <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 dark:ring-white/10 lg:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">Browse Topics</h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Choose a guided path</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredHelpTopics.map((topic) => {
                    const IconComponent = topic.icon;
                    return (
                      <button
                        key={topic.title}
                        onClick={topic.action}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-400/60"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="rounded-lg bg-slate-100 p-2.5 dark:bg-slate-700/80">
                            <IconComponent className={`h-4 w-4 ${topic.iconColor}`} />
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {topic.badge}
                          </span>
                        </div>

                        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{topic.title}</h3>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{topic.description}</p>

                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-300 dark:group-hover:text-blue-200">
                          Open topic
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 dark:ring-white/10 lg:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">Contact and Guidance</h2>

                <div className="space-y-3">
                  {filteredContactGuidance.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.title}
                        onClick={item.action}
                        className="group w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-400/50"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-500/10">
                            <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-300">
                            {item.actionLabel}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-cyan-500/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">System status</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">All core support channels are available.</p>
                </div>
              </section>
            </div>

            <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 dark:ring-white/10 lg:p-6">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">Guided Workflows</h2>
              <p className="mb-4 text-xs text-slate-600 dark:text-slate-300">Follow these practical sequences to get reliable results faster.</p>

              <div className="grid gap-4 lg:grid-cols-3">
                {filteredGuidedWorkflows.map((workflow) => (
                  <div key={workflow.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{workflow.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{workflow.summary}</p>

                    <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs text-slate-700 dark:text-slate-300">
                      {workflow.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>

                    <button
                      onClick={workflow.action}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {workflow.actionLabel}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 dark:ring-white/10 lg:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">Troubleshooting</h2>
                </div>

                <div className="space-y-3">
                  {filteredTroubleshootingGuides.map((item) => (
                    <div key={item.issue} className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
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
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 dark:ring-white/10 lg:p-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">Frequently Asked Questions</h2>

                <div className="space-y-3">
                  {filteredCommonQuestions.map((item) => (
                    <details
                      key={item.question}
                      className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 transition-colors duration-200 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700/70">
                        <span>{item.question}</span>
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
                        <p>{item.answer}</p>
                        <button
                          onClick={item.action}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          {item.actionLabel}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-lg dark:border-blue-500/30 dark:from-blue-500/10 dark:to-cyan-500/10 lg:p-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Still need personalized help?</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-200">
                Our team can review your setup and guide you through budgets, reporting flows, and account configuration.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentView('email-support')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  Email Support Team
                </button>
                <button
                  onClick={handleBugReport}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <Bug className="h-4 w-4" />
                  Report a Bug
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Help;