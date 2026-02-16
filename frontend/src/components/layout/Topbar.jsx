import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import CurrencySelector from "../CurrencySelector";
import SearchModal from "./SearchModal";
import NotificationCenter from "../NotificationCenter";
import HelpPanel from "./HelpPanel";
import UserDropdown from "./UserDropdown";
import LogoutModal from "../ui/LogoutModal";
import { 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  Search,
  HelpCircle,
  Sparkles
} from "lucide-react";

const Topbar = ({ auth }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const user = currentUser || auth?.user;

  // State for panels
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch transactions for search and notifications
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch transactions for search
        const txResponse = await fetch("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (txResponse.ok && isMounted) {
          const data = await txResponse.json();
          setTransactions(data);
        }

        // Fetch unread notifications count
        const notifResponse = await fetch("http://localhost:5000/api/notifications?unreadOnly=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (notifResponse.ok && isMounted) {
          const notifData = await notifResponse.json();
          setUnreadCount(notifData.unreadCount || 0);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error);
        }
      }
    };
    
    loadData();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    setShowLogoutModal(true);
    setShowUserDropdown(false); // Close dropdown when modal opens
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    
    // Clear ALL localStorage items
    localStorage.clear();

    navigate("/login", { replace: true });
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-dark-bg-primary/95 border-b border-gray-200 dark:border-dark-border-strong shadow-sm dark:shadow-elevated-dark">
      {/* Premium Gradient Overlay for Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/[0.02] to-transparent dark:block hidden pointer-events-none"></div>
      <div className="relative px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Welcome */}
          <div className="flex items-center gap-4">
            {/* User Avatar with Premium Styling */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-dark-accent-blue dark:via-blue-500 dark:to-dark-accent-cyan rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-dark-accent-blue dark:to-blue-500 p-0.5 shadow-lg dark:shadow-glow-blue">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-dark-surface-elevated flex items-center justify-center overflow-hidden ring-1 ring-white/20 dark:ring-dark-border-strong">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold bg-gradient-to-br from-blue-600 to-blue-700 dark:from-dark-accent-blue dark:to-dark-accent-cyan bg-clip-text text-transparent">
                      {user?.name?.charAt(0).toUpperCase() || "G"}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-dark-accent-emerald dark:to-green-400 border-2 border-white dark:border-dark-surface-primary rounded-full animate-pulse shadow-md dark:shadow-glow-emerald"></div>
            </div>

            {/* Welcome Text with Enhanced Styling */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-blue-700 dark:from-dark-text-primary dark:via-dark-accent-blue dark:to-dark-accent-cyan bg-clip-text text-transparent drop-shadow-sm">
                  Welcome back, {user?.name?.split(' ')[0] || "Guest"}!
                </h2>
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-dark-accent-blue animate-pulse drop-shadow-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium tracking-wide">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right Section - Enhanced Controls with Premium Dark Styling */}
          <div className="flex items-center gap-3">
            {/* Search Button with Enhanced Dark Mode */}
            <button 
              onClick={() => setShowSearch(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface-secondary dark:to-dark-surface-elevated hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 group border border-gray-200 dark:border-dark-border-strong hover:border-blue-400 dark:hover:border-dark-accent-blue hover:shadow-md dark:hover:shadow-glow-blue ring-1 ring-white/10 dark:ring-dark-border-subtle"
              title="Search transactions (Ctrl+K)"
            >
              <Search className="w-4.5 h-4.5 text-gray-600 dark:text-dark-text-secondary group-hover:text-blue-600 dark:group-hover:text-dark-accent-blue transition-colors drop-shadow-sm" />
            </button>

            {/* Notifications with Premium Badge */}
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface-secondary dark:to-dark-surface-elevated hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 group border border-gray-200 dark:border-dark-border-strong hover:border-blue-400 dark:hover:border-dark-accent-blue hover:shadow-md dark:hover:shadow-glow-blue ring-1 ring-white/10 dark:ring-dark-border-subtle"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5 text-gray-600 dark:text-dark-text-secondary group-hover:text-blue-600 dark:group-hover:text-dark-accent-blue transition-colors drop-shadow-sm" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-dark-surface-primary shadow-lg animate-pulse ring-2 ring-red-500/20 dark:ring-red-400/30">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Help with Premium Styling */}
            <button 
              onClick={() => setShowHelp(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface-secondary dark:to-dark-surface-elevated hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 group border border-gray-200 dark:border-dark-border-strong hover:border-blue-400 dark:hover:border-dark-accent-blue hover:shadow-md dark:hover:shadow-glow-blue ring-1 ring-white/10 dark:ring-dark-border-subtle"
              title="Help & Support (?)"
            >
              <HelpCircle className="w-4.5 h-4.5 text-gray-600 dark:text-dark-text-secondary group-hover:text-blue-600 dark:group-hover:text-dark-accent-blue transition-colors drop-shadow-sm" />
            </button>

            {/* Currency Selector with Premium Container */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface-secondary dark:to-dark-surface-elevated backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-border-strong p-1 shadow-sm dark:shadow-inner-dark ring-1 ring-white/10 dark:ring-dark-border-subtle">
              <CurrencySelector variant="compact" showLabel={false} />
            </div>

            {/* Premium Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-dark-border-strong to-transparent opacity-50"></div>

            {/* User Profile with Enhanced Styling */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-dark-surface-hover rounded-xl px-3 py-2 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-dark-accent-blue/30 group hover:shadow-sm dark:hover:shadow-glow-blue"
              >
                {user && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary group-hover:text-blue-700 dark:group-hover:text-dark-accent-blue transition-colors">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary truncate max-w-[150px]">{user.email}</p>
                  </div>
                )}

                {/* Avatar with Premium Gradient Border and Ring */}
                <div className="relative group/avatar">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 dark:from-dark-accent-blue dark:via-blue-500 dark:to-dark-accent-cyan rounded-full blur-sm opacity-75 group-hover/avatar:opacity-100 transition-opacity"></div>
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-dark-accent-blue dark:to-blue-500 p-0.5 shadow-md dark:shadow-glow-blue">
                    <div className="w-full h-full rounded-full bg-white dark:bg-dark-surface-elevated flex items-center justify-center overflow-hidden ring-1 ring-white/20 dark:ring-dark-border-strong">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold bg-gradient-to-br from-blue-600 to-blue-600 dark:from-dark-accent-blue dark:to-dark-accent-cyan bg-clip-text text-transparent">
                          {user?.name?.charAt(0).toUpperCase() || "G"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Premium Dropdown Arrow */}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-dark-text-tertiary group-hover:text-blue-600 dark:group-hover:text-dark-accent-blue transition-all duration-200 drop-shadow-sm ${showUserDropdown ? 'rotate-180' : ''}`} />
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

            {/* Premium Logout Button */}
            <button
              onClick={handleLogout}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/40 dark:hover:to-red-800/40 transition-all duration-200 group border border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700/50 hover:shadow-md dark:hover:shadow-glow-gold ring-1 ring-red-100/50 dark:ring-red-900/30"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors drop-shadow-sm" />
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
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <HelpPanel 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />
    </header>
  );
};

export default Topbar;
