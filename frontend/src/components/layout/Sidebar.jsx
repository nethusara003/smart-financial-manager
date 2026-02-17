import { NavLink } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  Target, 
  RefreshCw, 
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
  Lightbulb,
  Heart,
  LineChart,
  Database
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
      ]
    },
    {
      id: "tools", 
      section: "Tools",
      icon: CreditCard,
      items: [
        { path: "/budgets", label: "Budgets", icon: DollarSign },
        { path: "/goals", label: "Goals", icon: Target },
        { path: "/recurring", label: "Recurring", icon: RefreshCw },
        { path: "/sample-data", label: "Sample Data", icon: Database, badge: "DEV" },
      ]
    },
    {
      id: "insights",
      section: "Insights",
      icon: PieChart,
      items: [
        { path: "/reports", label: "Reports", icon: FileText },
        { path: "/recommendations", label: "Recommendations", icon: Lightbulb, badge: "NEW" },
        { path: "/financial-health", label: "Financial Health", icon: Heart, badge: "NEW" },
        { path: "/forecast", label: "Forecast", icon: LineChart, badge: "NEW" },
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

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-dark-bg-primary border-r border-gray-200 dark:border-dark-border-default flex flex-col transition-all duration-300 shadow-lg dark:shadow-elevated-dark relative`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-dark-surface-elevated border border-gray-300 dark:border-dark-border-strong rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all duration-200 z-10 shadow-md dark:shadow-glow-blue"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600 dark:text-dark-accent-blue" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-dark-accent-blue" />
        )}
      </button>

      {/* Official SFT Branding */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200 dark:border-dark-border-default bg-gradient-to-r from-blue-50 dark:from-dark-surface-elevated to-green-50 dark:to-dark-surface-secondary transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative">
            <img 
              src="/logo-sft.svg" 
              alt="SFT Logo" 
              className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} drop-shadow-lg transition-all duration-300`}
            />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 dark:from-dark-accent-blue dark:via-dark-accent-cyan dark:to-dark-accent-blue bg-clip-text text-transparent drop-shadow-sm">
                Smart Financial Tracker
              </h1>
              <p className="text-xs text-gray-600 dark:text-dark-text-tertiary font-semibold tracking-wider">
                SFT PLATFORM
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-3 overflow-y-auto custom-scrollbar transition-all duration-300`}>
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider mb-4 px-3">
            MENU
          </p>
        )}
        
        {navItems.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.id];
          
          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-accent-blue hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="w-4 h-4 group-hover:text-primary-600 dark:group-hover:text-dark-accent-blue transition-colors" />
                    <span>{section.section}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  ) : (
                    <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              )}
              
              {/* Section Items */}
              <div className={`space-y-1 ${!isCollapsed && !isExpanded ? 'hidden' : ''} transition-all duration-200`}>
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.path} className="relative group">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 ml-4'} rounded-lg text-sm font-medium transition-all relative ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-dark-accent-blue dark:to-blue-500 text-white shadow-md dark:shadow-glow-blue"
                              : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-hover hover:text-gray-900 dark:hover:text-dark-accent-blue hover:shadow-sm dark:hover:shadow-none"
                          }`
                        }
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                      
                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-dark-surface-elevated text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-gray-700 dark:border-dark-border-strong">
                          {item.label}
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900 dark:border-r-dark-surface-elevated"></div>
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
        {!isCollapsed && <div className="border-t border-gray-200 dark:border-dark-border-default my-4"></div>}
        
        {/* Other Section */}
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider mb-2 px-3">
            OTHER
          </p>
        )}
        
        {/* Help */}
        <div className="relative group">
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg dark:shadow-glow-blue"
                  : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-hover hover:text-gray-900 dark:hover:text-blue-400 hover:shadow-sm"
              }`
            }
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Help</span>}
          </NavLink>
          
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-dark-surface-elevated text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-gray-700 dark:border-dark-border-strong">
              Help
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900 dark:border-r-dark-surface-elevated"></div>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-dark-border-default transition-all duration-300`}>
        <div className="relative group">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg dark:shadow-glow-blue"
                  : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-hover hover:text-gray-900 dark:hover:text-blue-400 hover:shadow-sm"
              }`
            }
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
          
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-dark-surface-elevated text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-gray-700 dark:border-dark-border-strong">
              Settings
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900 dark:border-r-dark-surface-elevated"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
