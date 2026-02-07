import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CurrencySelector from "../CurrencySelector";
import SearchModal from "./SearchModal";
import NotificationsPanel from "./NotificationsPanel";
import HelpPanel from "./HelpPanel";
import UserDropdown from "./UserDropdown";
import { 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  Search,
  HelpCircle
} from "lucide-react";

const Topbar = ({ auth }) => {
  const navigate = useNavigate();
  const user = auth?.user;

  // State for panels
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch transactions for search and notifications
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        // Simulate unread notifications (would come from backend)
        setUnreadCount(Math.min(data.length, 5));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      // ? for help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        // Don't trigger if typing in input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowHelp(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guest");

    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-dark-surface-primary/95 border-b border-gray-200 dark:border-dark-border-strong shadow-sm dark:shadow-elevated-dark">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Welcome */}
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 dark:from-gold-400 dark:via-gold-300 dark:to-gold-500 bg-clip-text text-transparent">
                Welcome back, {user?.name?.split(' ')[0] || "Guest"} 👋
              </h2>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button 
              onClick={() => setShowSearch(true)}
              className="p-3 rounded-xl bg-gray-100 dark:bg-dark-surface-hover hover:bg-gray-200 dark:hover:bg-dark-surface-elevated hover:shadow-md dark:hover:shadow-glow-gold transition-all duration-200 group border border-transparent hover:border-purple-500/30 dark:hover:border-gold-500/30"
              title="Search transactions (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary group-hover:text-purple-600 dark:group-hover:text-gold-400" />
            </button>

            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-3 rounded-xl bg-gray-100 dark:bg-dark-surface-hover hover:bg-gray-200 dark:hover:bg-dark-surface-elevated hover:shadow-md dark:hover:shadow-glow-gold transition-all duration-200 group border border-transparent hover:border-purple-500/30 dark:hover:border-gold-500/30"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary group-hover:text-purple-600 dark:group-hover:text-gold-400" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full border-2 border-white"></span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-danger-500 text-white text-xs font-bold rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Help */}
            <button 
              onClick={() => setShowHelp(true)}
              className="p-3 rounded-xl bg-gray-100 dark:bg-dark-surface-hover hover:bg-gray-200 dark:hover:bg-dark-surface-elevated hover:shadow-md dark:hover:shadow-glow-gold transition-all duration-200 group border border-transparent hover:border-purple-500/30 dark:hover:border-gold-500/30"
              title="Help & Support (?)"
            >
              <HelpCircle className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary group-hover:text-purple-600 dark:group-hover:text-gold-400" />
            </button>

            {/* Currency Selector */}
            <div className="bg-gray-100 dark:bg-dark-surface-hover backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-border-default p-1 shadow-sm dark:shadow-inner-glow">
              <CurrencySelector variant="compact" showLabel={false} />
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-xl p-2 transition-colors"
              >
                {user && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{user.name}</p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                  </div>
                )}

                {/* Avatar with gradient border */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-0.5">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        {user?.name?.charAt(0).toUpperCase() || "G"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <UserDropdown
                  isOpen={showUserDropdown}
                  onClose={() => setShowUserDropdown(false)}
                  user={user}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-3 rounded-xl bg-danger-50/80 hover:bg-danger-100/80 transition-all duration-200 group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-danger-600 group-hover:text-danger-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals and Panels */}
      <SearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
        transactions={transactions}
      />
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        transactions={transactions}
      />
      <HelpPanel 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </header>
  );
};

export default Topbar;
