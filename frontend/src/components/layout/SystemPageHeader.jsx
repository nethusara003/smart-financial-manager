import React from 'react';

const SystemPageHeader = ({
  tagline,
  title,
  subtitle,
  actions,
  children,
  className = '',
}) => {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 dark:border-white/5 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_38%),linear-gradient(135deg,#0f172a_0%,#020617_100%)] px-6 py-4 text-slate-800 dark:text-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          {tagline ? (
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400/90">{tagline}</p>
          ) : null}
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300/80">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
};

export default SystemPageHeader;

