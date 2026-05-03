const PageLayout = ({
  title,
  description,
  actions,
  children,
  className = "",
  contentClassName = "",
}) => {
  return (
    <div className={`space-y-6 animate-fade-in ${className}`}>
      <header className="rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_38%),linear-gradient(135deg,#172554_0%,#08111f_48%,#02050b_100%)] px-6 py-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400/90">SYSTEM INSIGHTS</p>
            <h1 className="mt-0.5 text-2xl font-bold text-white leading-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-300/80">
                {description}
              </p>
            )}
          </div>

          {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
        </div>
      </header>

      <div className={`space-y-6 ${contentClassName}`}>{children}</div>
    </div>
  );
};

export default PageLayout;