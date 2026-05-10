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
      className={`rounded-2xl border border-white/5 px-6 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 obsidian-shell ${className}`}
      style={{
        background: `radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 40%), linear-gradient(135deg, #0f172a 0%, #020617 100%)`
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          {tagline ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFFFFF]">
              {tagline}
            </p>
          ) : null}
          
          <h1 className="mt-1 text-3xl font-bold text-[#FFFFFF] leading-tight">
            {title}
          </h1>
          
          {subtitle ? (
            <p className="mt-1.5 text-xs font-medium text-[#FFFFFF]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {actions}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
};

export default SystemPageHeader;
