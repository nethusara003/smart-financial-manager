import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp,
  Target, 
  Calendar,
  Wallet, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LayoutGrid,
  Zap,
  CreditCard,
  HelpCircle,
  Heart,
  LineChart,
  Star,
  Send,
  Sparkles
} from "lucide-react";

// ── Obsidian Shell constants (Hardcoded Hardlock) ──────────────────────────
const OBSIDIAN      = "#0B0E14";
const ELECTRIC_BLUE = "#3B82F6";

const Sidebar = ({ auth, isMobileOpen = false, onCloseMobile }) => {
  const userRole = auth?.user?.role;
  const { isDark } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    financial: true,
    insights: true,
    tools: true
  });

  const toggleSection = (section) => {
    if (isCollapsed) return;
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname]);

  const navItems = [
    {
      id: "financial",
      section: "Financial",
      icon: BarChart3,
      items: [
        { path: "/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
        { path: "/transactions",  label: "Transactions", icon: FileText },
        { path: "/analytics",    label: "Analytics",    icon: TrendingUp },
        { path: "/reports",      label: "Reports",      icon: FileText },
      ]
    },
    {
      id: "tools", 
      section: "Tools",
      icon: LayoutGrid,
      items: [
        { path: "/budgets",         label: "Budgets",         icon: Wallet },
        { path: "/goals",           label: "Goals",           icon: Target },
        { path: "/bills-reminders", label: "Bills & Reminders", icon: Calendar },
        { path: "/loans",           label: "Loans",           icon: CreditCard, badge: "NEW" },
        { path: "/transfers",       label: "Transfers",       icon: Send,       badge: "NEW" },
      ]
    },
    {
      id: "insights",
      section: "Insights",
      icon: Zap,
      items: [
        { path: "/financial-health", label: "Financial Health",    icon: Heart,     badge: "NEW" },
        { path: "/forecast",         label: "Forecast",            icon: LineChart,  badge: "NEW" },
        { path: "/retirement",       label: "Retirement Planner",  icon: Sparkles,  badge: "NEW" },
      ]
    }
  ];

  if (userRole === "admin" || userRole === "super_admin") {
    navItems.push({
      id: "admin",
      section: "Administration",
      icon: Shield,
      items: [
        { path: "/admin", label: "Admin Dashboard", icon: Shield },
      ]
    });
  }

  /* ── nav-link class builder (Force Pure White) ── */
  const linkClass = (isActive, indented = false) => {
    const base = `relative flex items-center overflow-hidden text-sm font-sans transition-all duration-200
     ${isCollapsed ? "justify-center p-2.5" : `gap-3 px-3 py-2.5 ${indented ? "ml-4" : ""}`}`;

    if (isActive) {
      return `${base} font-bold text-white
        before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full
        before:bg-[#3B82F6]`;
    }
    // Restore original muted state for dark mode; obsidian-shell will force white in light mode
    return `${base} font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg mx-1`;
  };

  const sectionLabelClass = `group flex w-full items-center justify-between rounded-lg px-3 py-2
    text-[10px] font-bold uppercase tracking-[0.22em] font-sans
    transition-all text-white hover:text-[#3B82F6]`;

  const menuLabelClass = `mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] font-sans text-slate-500`;
  const otherLabelClass = `mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.25em] font-sans text-slate-500`;

  /* ── sidebar style (Permanent Obsidian) ── */
  const sidebarStyle = { background: OBSIDIAN };

  const borderR      = `border-r border-white/10`;
  const borderB      = `border-b border-white/10`;
  const borderT      = `border-t border-white/10`;
  const dividerClass = `my-3 border-t border-white/10`;

  /* ── icons ── */
  const iconSize = "h-4 w-4 flex-shrink-0 stroke-current stroke-[1.5]";

  return (
    <>
    {isMobileOpen && (
      <button
        type="button"
        className="fixed inset-0 z-30 bg-black/50 md:hidden"
        aria-label="Close sidebar overlay"
        onClick={onCloseMobile}
      />
    )}
    <aside
      className={`${isCollapsed ? "md:w-16" : "md:w-[var(--sidebar-width)]"} w-[85vw] max-w-[20rem]
        flex flex-col fixed top-0 left-0 h-screen z-40 pt-[80px]
        transition-all duration-300 ${borderR} overflow-hidden shadow-2xl obsidian-shell
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      style={sidebarStyle}
    >
      {/* Branding */}
      <div className={`${isCollapsed ? "p-3" : "p-5"} ${borderB} transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="relative flex-shrink-0">
            <img
              src="/logo-sft.svg"
              alt="SFT Logo"
              className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"} drop-shadow-lg`}
            />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-sm font-bold font-sans leading-tight text-[#FFFFFF] tracking-tight uppercase">
                Smart Financial Tracker
              </h1>
              <p className="text-[10px] font-bold font-sans tracking-[0.22em] text-[#3B82F6] mt-0.5">
                SFT PLATFORM
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? "p-2" : "p-3"} space-y-3 overflow-y-auto custom-scrollbar`}>
        {!isCollapsed && <p className={menuLabelClass}>MENU</p>}

        {navItems.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.id];

          return (
            <div key={section.id} className="space-y-0.5">
              {!isCollapsed && (
                <button onClick={() => toggleSection(section.id)} className={sectionLabelClass}>
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-3.5 w-3.5 stroke-white stroke-[2]" />
                    <span>{section.section}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="h-3 w-3 text-white" /> : <ChevronUp className="h-3 w-3 text-white" />}
                </button>
              )}

              <div className={`space-y-0.5 ${!isCollapsed && !isExpanded ? "hidden" : ""} transition-all duration-200`}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => linkClass(isActive, !isCollapsed)}
                      onClick={() => onCloseMobile?.()}
                    >
                      <Icon className={iconSize} />
                      {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!isCollapsed && <div className={dividerClass} />}
        {!isCollapsed && <p className={otherLabelClass}>OTHER</p>}

        <NavLink to="/settings" className={({ isActive }) => linkClass(isActive)} onClick={() => onCloseMobile?.()}>
          <Settings className={iconSize} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <NavLink to="/help" className={({ isActive }) => linkClass(isActive)} onClick={() => onCloseMobile?.()}>
          <HelpCircle className={iconSize} />
          {!isCollapsed && <span>Help</span>}
        </NavLink>
      </nav>
    </aside>
    </>
  );
};

export default Sidebar;
