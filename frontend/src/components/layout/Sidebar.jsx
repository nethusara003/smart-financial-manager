import { NavLink } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp,
  Target, 
  Calendar,
  DollarSign, 
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  CreditCard,
  HelpCircle,
  Heart,
  LineChart,
  Star,
  Send,
  Sparkles
} from "lucide-react";

const Sidebar = ({ auth }) => {
  const userRole = auth?.user?.role;
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

  const navItems = [
    {
      id: "financial",
      section: "Financial",
      icon: BarChart3,
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/transactions", label: "Transactions", icon: Receipt },
        { path: "/analytics", label: "Analytics", icon: TrendingUp },
        { path: "/reports", label: "Reports", icon: FileText },
      ]
    },
    {
      id: "tools", 
      section: "Tools",
      icon: CreditCard,
      items: [
        { path: "/budgets", label: "Budgets", icon: DollarSign },
        { path: "/goals", label: "Goals", icon: Target },
        { path: "/bills-reminders", label: "Bills & Reminders", icon: Calendar },
        { path: "/loans", label: "Loans", icon: CreditCard, badge: "NEW" },
        { path: "/transfers", label: "Transfers", icon: Send, badge: "NEW" },
      ]
    },
    {
      id: "insights",
      section: "Insights",
      icon: PieChart,
      items: [
        { path: "/financial-health", label: "Financial Health", icon: Heart, badge: "NEW" },
        { path: "/forecast", label: "Forecast", icon: LineChart, badge: "NEW" },
        { path: "/retirement", label: "Retirement Planner", icon: Sparkles, badge: "NEW" },
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

  /* ── shared nav-link class builder ── */
  const linkClass = (isActive, indented = false) =>
    `relative flex items-center overflow-hidden rounded-lg text-sm font-medium transition-all
     ${isCollapsed ? 'justify-center p-2.5' : `gap-3 px-3 py-2.5 ${indented ? 'ml-4' : ''}`}
     ${isActive
       ? 'bg-[rgba(255,255,255,0.15)] text-white ring-1 ring-[rgba(255,255,255,0.2)] shadow-[0_0_16px_rgba(59,130,246,0.18)] before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-[#60A5FA] before:to-[#3B82F6]'
       : 'text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
     }`;

  const sectionLabelClass = "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[rgba(255,255,255,0.5)] transition-all hover:text-[rgba(255,255,255,0.8)]";

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-64'} flex flex-col fixed top-0 left-0 h-screen z-40 pt-[80px] transition-all duration-300 border-r border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden`}
      style={{
        background: 'linear-gradient(180deg, #172554 0%, #0c1a3a 35%, #08111f 65%, #02050b 100%)',
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] bg-[#172554] text-white shadow-lg transition-all duration-200 hover:border-[rgba(59,130,246,0.5)] hover:bg-[#1e3a8a]"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-blue-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-blue-400" />
        )}
      </button>

      {/* Branding */}
      <div className={`${isCollapsed ? 'p-3' : 'p-5'} border-b border-[rgba(255,255,255,0.08)] transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative flex-shrink-0">
            <img
              src="/logo-sft.svg"
              alt="SFT Logo"
              className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} drop-shadow-lg transition-all duration-300`}
            />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight">Smart Financial Tracker</h1>
              <p className="text-[10px] font-semibold tracking-widest text-[rgba(255,255,255,0.5)] mt-0.5">SFT PLATFORM</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-3'} space-y-3 overflow-y-auto custom-scrollbar transition-all duration-300`}>
        {!isCollapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.4)]">
            MENU
          </p>
        )}
        
        {navItems.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.id];
          
          return (
            <div key={section.id} className="space-y-0.5">
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className={sectionLabelClass}
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-3.5 w-3.5" />
                    <span>{section.section}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronUp className="h-3 w-3" />
                  )}
                </button>
              )}
              
              {/* Section Items */}
              <div className={`space-y-0.5 ${!isCollapsed && !isExpanded ? 'hidden' : ''} transition-all duration-200`}>
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.path} className="relative group">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => linkClass(isActive, !isCollapsed)}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="flex-1">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(59,130,246,0.2)] text-[#93c5fd] border border-[rgba(59,130,246,0.25)]">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                      
                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0D1117] px-3 py-1.5 text-sm text-white opacity-0 invisible shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                          {item.label}
                          <div className="absolute top-1/2 left-0 -translate-x-1 -translate-y-1/2 transform border-4 border-transparent border-r-[#0D1117]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Divider */}
        {!isCollapsed && <div className="my-3 border-t border-[rgba(255,255,255,0.08)]" />}
        
        {/* Other Section Label */}
        {!isCollapsed && (
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.4)]">
            OTHER
          </p>
        )}
        
        {/* Feedback */}
        <div className="relative group">
          <NavLink
            to="/feedback"
            className={({ isActive }) => linkClass(isActive)}
          >
            <Star className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Feedback</span>}
          </NavLink>
          {isCollapsed && (
            <div className="absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0D1117] px-3 py-1.5 text-sm text-white opacity-0 invisible shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
              Feedback
              <div className="absolute top-1/2 left-0 -translate-x-1 -translate-y-1/2 transform border-4 border-transparent border-r-[#0D1117]" />
            </div>
          )}
        </div>
        
        {/* Help */}
        <div className="relative group">
          <NavLink
            to="/help"
            className={({ isActive }) => linkClass(isActive)}
          >
            <HelpCircle className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Help</span>}
          </NavLink>
          {isCollapsed && (
            <div className="absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0D1117] px-3 py-1.5 text-sm text-white opacity-0 invisible shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
              Help
              <div className="absolute top-1/2 left-0 -translate-x-1 -translate-y-1/2 transform border-4 border-transparent border-r-[#0D1117]" />
            </div>
          )}
        </div>
      </nav>

      {/* Footer — Settings */}
      <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-t border-[rgba(255,255,255,0.08)] transition-all duration-300`}>
        <div className="relative group">
          <NavLink
            to="/settings"
            className={({ isActive }) => linkClass(isActive)}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
          {isCollapsed && (
            <div className="absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0D1117] px-3 py-1.5 text-sm text-white opacity-0 invisible shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
              Settings
              <div className="absolute top-1/2 left-0 -translate-x-1 -translate-y-1/2 transform border-4 border-transparent border-r-[#0D1117]" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
