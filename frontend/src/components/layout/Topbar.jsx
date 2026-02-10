import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import CurrencySelector from "../CurrencySelector";
import SearchModal from "./SearchModal";
import NotificationsPanel from "./NotificationsPanel";
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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-dark-surface-primary/95 border-b border-gray-200 dark:border-dark-border-strong shadow-sm dark:shadow-elevated-dark">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Welcome */}
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-600 p-0.5">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                      {user?.name?.charAt(0).toUpperCase() || "G"}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-blue-700 dark:from-blue-300 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                  Welcome back, {user?.name?.split(' ')[0] || "Guest"}!
                </h2>
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button 
              onClick={() => setShowSearch(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-glow-blue"
              title="Search transactions (Ctrl+K)"
            >
              <Search className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>

            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-glow-blue"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-900 shadow-lg animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Help */}
            <button 
              onClick={() => setShowHelp(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-glow-blue"
              title="Help & Support (?)"
            >
              <HelpCircle className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>

            {/* Currency Selector */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
              <CurrencySelector variant="compact" showLabel={false} />
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-3 py-2 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
              >
                {user && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</p>
                  </div>
                )}

                {/* Avatar with premium gradient border */}
                <div className="relative group/avatar">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 rounded-full blur-sm opacity-75 group-hover/avatar:opacity-100 transition-opacity"></div>
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold bg-gradient-to-br from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                          {user?.name?.charAt(0).toUpperCase() || "G"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
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
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/40 dark:hover:to-red-800/40 transition-all duration-200 group border border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700/50 hover:shadow-lg"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />
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
